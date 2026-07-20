import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

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

# 3. Vue de mot de passe oublié
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
            message = (
                f"Bonjour {user_name},\n\n"
                f"Vous avez demandé la réinitialisation de votre mot de passe pour votre compte RED Product.\n\n"
                f"Pour réinitialiser votre mot de passe, veuillez contacter l'administrateur système ou réessayez ultérieurement.\n\n"
                f"Cordialement,\n"
                f"L'équipe RED Product."
            )

            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'kanesoukista@11666410.brevosend.com')

            # LOG de diagnostic visible dans les logs Render
            logger.warning(f"[EMAIL-DEBUG] Tentative d'envoi à : {email_clean}")
            logger.warning(f"[EMAIL-DEBUG] HOST={settings.EMAIL_HOST} PORT={settings.EMAIL_PORT}")
            logger.warning(f"[EMAIL-DEBUG] USER={settings.EMAIL_HOST_USER}")
            logger.warning(f"[EMAIL-DEBUG] PASSWORD présent : {'OUI' if settings.EMAIL_HOST_PASSWORD else 'NON - VARIABLE MANQUANTE'}")
            logger.warning(f"[EMAIL-DEBUG] FROM={from_email}")

            # Envoi SYNCHRONE pour capturer et retourner l'erreur exacte
            send_mail(
                subject,
                message,
                from_email,
                [email_clean],
                fail_silently=False,
            )

            logger.warning(f"[EMAIL-DEBUG] SUCCES - email envoyé à {email_clean}")
            return Response(
                {"message": "E-mail envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # On retourne l'erreur REELLE dans la réponse pour diagnostiquer
            error_detail = str(e)
            logger.error(f"[EMAIL-DEBUG] ECHEC : {error_detail}")
            return Response(
                {
                    "error": "Echec de l'envoi de l'email.",
                    "detail": error_detail,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
