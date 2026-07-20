import logging

from django.conf import settings
from django.contrib.auth.models import User
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

# 3. Vue de mot de passe oublié — envoi via SendGrid
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
            user_name = user.first_name if (user and user.first_name) else "Administrateur"

            subject = "Réinitialisation de votre mot de passe - RED Product"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e53e3e;">RED Product</h2>
                <p>Bonjour <strong>{user_name}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte RED Product.</p>
                <p>Pour réinitialiser votre mot de passe, veuillez contacter l'administrateur système ou réessayez ultérieurement.</p>
                <br>
                <p>Cordialement,</p>
                <p><strong>L'équipe RED Product</strong></p>
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
                {"message": "E-mail de réinitialisation envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"[EMAIL] Erreur SendGrid: {e}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
