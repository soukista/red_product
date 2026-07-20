import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer

logger = logging.getLogger(__name__)

# 1. Vue d'inscription (Sign Up)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# 2. Vue de connexion (Sign In)
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# 3. Vue de demande de réinitialisation de mot de passe (Envoi de lien sécurisé via SendGrid)
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_email = request.data.get('email', '')
        if not raw_email:
            return Response({"error": "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)

        email_clean = raw_email.strip().lower()

        try:
            user = (
                User.objects.filter(email__iexact=email_clean).first()
                or User.objects.filter(username__iexact=email_clean).first()
            )

            # Même si l'utilisateur n'existe pas, pour des raisons de sécurité on répond OK
            if not user:
                return Response(
                    {"message": "Si cette adresse existe, un e-mail de réinitialisation lui a été envoyé."},
                    status=status.HTTP_200_OK,
                )

            user_name = user.first_name if user.first_name else "Administrateur"
            
            # Génération du token unique et sécurisé de réinitialisation Django
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # URL du Frontend Vercel (ou fallback local)
            frontend_url = "https://red-product-alpha.vercel.app"
            reset_link = f"{frontend_url}/reset-password/{uidb64}/{token}"

            subject = "Réinitialisation de votre mot de passe - RED Product"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #e53e3e; text-align: center;">RED Product</h2>
                <p>Bonjour <strong>{user_name}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte RED Product.</p>
                <p>Veuillez cliquer sur le bouton ci-dessous pour choisir votre nouveau mot de passe :</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #3d4449; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
                </div>
                
                <p style="font-size: 13px; color: #666666;">Si le bouton ci-dessus ne fonctionne pas, vous pouvez aussi copier-coller le lien suivant dans votre navigateur :</p>
                <p style="font-size: 12px; word-break: break-all;"><a href="{reset_link}" style="color: #3182ce;">{reset_link}</a></p>
                
                <hr style="border: none; border-top: 1px solid #edf2f7; margin: 25px 0;">
                <p style="font-size: 12px; color: #a0aec0; text-align: center;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            </div>
            """

            sendgrid_api_key = getattr(settings, 'SENDGRID_API_KEY', '')
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'kanesoukista@gmail.com')

            if not sendgrid_api_key:
                logger.error("[EMAIL] SENDGRID_API_KEY manquante.")
                return Response(
                    {"error": "Configuration email manquante.", "detail": "SENDGRID_API_KEY non définie."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            message = Mail(
                from_email=from_email,
                to_emails=email_clean,
                subject=subject,
                html_content=html_content,
            )

            sg = SendGridAPIClient(sendgrid_api_key)
            response = sg.send(message)

            logger.info(f"[EMAIL] Succès SendGrid! status={response.status_code}")

            return Response(
                {"message": "Un e-mail de réinitialisation a été envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"[EMAIL] Erreur SendGrid: {e}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# 4. Vue de confirmation de réinitialisation avec le nouveau mot de passe
class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response(
                {"error": "Le lien est incomplet ou le mot de passe est manquant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 4:
            return Response(
                {"error": "Le mot de passe doit contenir au moins 4 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            logger.info(f"[AUTH] Mot de passe réinitialisé avec succès pour l'utilisateur {user.email}")
            return Response(
                {"message": "Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter."},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Le lien de réinitialisation est invalide ou a déjà été utilisé / expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )
