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

# 3. Vue de mot de passe oublié — envoi via Resend API (port 443, jamais bloqué)
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

            resend_api_key = getattr(settings, 'RESEND_API_KEY', '')

            if not resend_api_key:
                logger.error("[EMAIL] RESEND_API_KEY manquante sur le serveur.")
                return Response(
                    {"error": "Configuration email manquante.", "detail": "RESEND_API_KEY non définie."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Envoi via API Resend HTTPS (port 443 — jamais bloqué par Render)
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "from": "onboarding@resend.dev",
                "to": [email_clean],
                "subject": subject,
                "html": html_content,
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read().decode("utf-8")
                logger.info(f"[EMAIL] Succes Resend! status={resp.status} body={body}")

            return Response(
                {"message": "E-mail de réinitialisation envoyé avec succès !"},
                status=status.HTTP_200_OK,
            )

        except urllib.error.HTTPError as http_err:
            body = http_err.read().decode("utf-8")
            logger.error(f"[EMAIL] Resend API HTTP {http_err.code}: {body}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": f"Resend {http_err.code}: {body}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"[EMAIL] Erreur inattendue: {e}")
            return Response(
                {"error": "Echec de l'envoi.", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
