import logging
import threading

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

            logger.info(f"[EMAIL] Envoi vers {email_clean} depuis {from_email}")
            logger.info(f"[EMAIL] SMTP Host={settings.EMAIL_HOST} Port={settings.EMAIL_PORT} User={settings.EMAIL_HOST_USER}")

            def send_async():
                try:
                    send_mail(
                        subject,
                        message,
                        from_email,
                        [email_clean],
                        fail_silently=False,
                    )
                    logger.info(f"[EMAIL] Envoi réussi à {email_clean}")
                except Exception as ex:
                    logger.error(f"[EMAIL] ECHEC envoi SMTP: {ex}")

            threading.Thread(target=send_async, daemon=True).start()

            return Response(
                {"message": "Un e-mail de réinitialisation a été envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.exception(f"[EMAIL] Erreur inattendue: {e}")
            return Response(
                {"message": "Un e-mail de réinitialisation a été envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )
