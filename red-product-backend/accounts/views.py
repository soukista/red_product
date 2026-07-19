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
        email = request.data.get('email')
        if not email:
            return Response({"error": "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Nom complet de l'utilisateur
            user_name = f"{user.first_name}" or "Administrateur"
            
            subject = "Réinitialisation de votre mot de passe - RED Product"
            message = (
                f"Bonjour {user_name},\n\n"
                f"Vous avez demandé la réinitialisation du mot de passe associé à ce compte RED Product.\n\n"
                f"Cliquez sur le lien suivant pour accéder à la page de connexion et réinitialiser vos identifiants :\n"
                f"http://localhost:5173/login\n\n"
                f"Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.\n\n"
                f"Cordialement,\n"
                f"L'équipe RED Product."
            )
            
            # Envoyer le mail réel en utilisant l'adresse de l'expéditeur de Brevo
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@redproduct.com')
            send_mail(
                subject,
                message,
                from_email,
                [email],
                fail_silently=False,
            )
            return Response({"message": "Un e-mail de réinitialisation a été envoyé avec succès !"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Pour des raisons de sécurité (éviter l'énumération de comptes), on renvoie le même message de réussite
            return Response({"message": "Un e-mail de réinitialisation a été envoyé avec succès !"}, status=status.HTTP_200_OK)
        except Exception as e:
            print("Erreur SMTP lors de l'envoi du mail :", e)
            return Response({"error": "Impossible d'envoyer l'e-mail. Veuillez réessayer plus tard."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
