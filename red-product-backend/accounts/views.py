from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, EmailTokenObtainPairSerializer

# 1. Vue d'inscription (Sign Up)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # Tout le monde doit pouvoir s'inscrire, la route ne doit pas être bloquée
    permission_classes = [permissions.AllowAny]

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, EmailTokenObtainPairSerializer

# 1. Vue d'inscription (Sign Up)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # Tout le monde doit pouvoir s'inscrire, la route ne doit pas être bloquée
    permission_classes = [permissions.AllowAny]

# 2. Vue de connexion (Sign In)
class EmailTokenObtainPairView(TokenObtainPairView):
    # On force la vue à utiliser notre traducteur personnalisé (par email)
    serializer_class = EmailTokenObtainPairSerializer

# 3. Vue de mot de passe oublié (Envoi de mail réel via Brevo)
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_email = request.data.get('email', '')
        if not raw_email:
            return Response({"error": "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)

        email_clean = raw_email.strip().lower()

        try:
            # Recherche insensible à la casse par email ou par username
            user = User.objects.filter(email__iexact=email_clean).first() or User.objects.filter(username__iexact=email_clean).first()
            user_name = f"{user.first_name}" if (user and user.first_name) else "Administrateur"
            
            subject = "Réinitialisation de votre mot de passe - RED Product"
            message = (
                f"Bonjour {user_name},\n\n"
                f"Vous avez demandé la réinitialisation de votre mot de passe pour votre compte RED Product.\n\n"
                f"Pour réinitialiser votre mot de passe, veuillez contacter l'administrateur système ou réessayez ultérieurement.\n\n"
                f"Cordialement,\n"
                f"L'équipe RED Product."
            )
            
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'kanesoukista@gmail.com')

            def send_async():
                api_key = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'kanesoukista@11666410.brevosend.com')

                # 1. Tentative d'envoi via l'API REST HTTPS de Brevo (Port 443 - Jamais bloqué par Render)
                try:
                    import json
                    import urllib.request
                    url = "https://api.brevo.com/v3/smtp/email"
                    headers = {
                        "accept": "application/json",
                        "content-type": "application/json",
                        "api-key": api_key
                    }
                    payload = {
                        "sender": {"name": "RED Product", "email": from_email},
                        "to": [{"email": email_clean, "name": user_name}],
                        "subject": subject,
                        "textContent": message
                    }
                    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        print(f"Mail envoyé via Brevo HTTPS API avec succès! Status: {resp.status}")
                        return
                except Exception as err_api:
                    print("Échec Brevo HTTPS API, tentative SMTP fallback...", err_api)

                # 2. Fallback via SMTP Django
                try:
                    send_mail(
                        subject,
                        message,
                        from_email,
                        [email_clean],
                        fail_silently=False,
                    )
                except Exception as ex:
                    print("Erreur envoi async mail SMTP :", ex)

            import threading
            threading.Thread(target=send_async, daemon=True).start()

            return Response({"message": "Un e-mail de réinitialisation a été envoyé avec succès !"}, status=status.HTTP_200_OK)
        except Exception as e:
            print("Erreur lors de la réinitialisation :", e)
            return Response({"message": "Un e-mail de réinitialisation a été envoyé avec succès !"}, status=status.HTTP_200_OK)
