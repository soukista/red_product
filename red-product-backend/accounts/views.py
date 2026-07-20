import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.contrib.auth.models import User
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

# 3. Vue de mot de passe oublié — envoi via Brevo REST API (port 443, jamais bloqué)
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
            brevo_api_key = getattr(settings, 'BREVO_API_KEY', '')

            logger.warning(f"[EMAIL] Envoi à {email_clean} depuis {from_email}")
            logger.warning(f"[EMAIL] Clé BREVO_API_KEY présente : {'OUI' if brevo_api_key else 'NON'}")

            if not brevo_api_key:
                return Response(
                    {"error": "Configuration manquante.", "detail": "BREVO_API_KEY non définie sur le serveur."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Envoi via API REST Brevo HTTPS (port 443 — contourne le blocage Render du port 587)
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": brevo_api_key,
            }
            payload = {
                "sender": {"name": "RED Product", "email": from_email},
                "to": [{"email": email_clean, "name": user_name}],
                "subject": subject,
                "textContent": message,
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read().decode("utf-8")
                logger.warning(f"[EMAIL] Succès Brevo API! status={resp.status} body={body}")

            return Response(
                {"message": "E-mail de réinitialisation envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except urllib.error.HTTPError as http_err:
            body = http_err.read().decode("utf-8")
            logger.error(f"[EMAIL] Brevo API HTTP {http_err.code}: {body}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": f"Brevo {http_err.code}: {body}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"[EMAIL] Erreur inattendue: {e}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
