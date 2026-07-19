from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, EmailTokenObtainPairView, ForgotPasswordView

urlpatterns = [
    # Route d'inscription
    path('register/', RegisterView.as_view(), name='register'),
    
    # Route de connexion (génération des tokens JWT avec e-mail)
    path('login/', EmailTokenObtainPairView.as_view(), name='login'),
    
    # Route pour renouveler le token Access quand il expire
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Route de mot de passe oublié
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
]
