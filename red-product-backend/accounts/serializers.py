from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# 1. Serializer d'inscription (Sign Up)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'email', 'password']

    def validate_email(self, value):
        email_clean = value.strip().lower()
        # Vérifier de manière insensible à la casse si l'e-mail existe déjà
        if User.objects.filter(username__iexact=email_clean).exists() or User.objects.filter(email__iexact=email_clean).exists():
            raise serializers.ValidationError("Un compte avec cette adresse e-mail existe déjà.")
        return email_clean

    def create(self, validated_data):
        email_clean = validated_data['email'].strip().lower()
        user = User.objects.create_user(
            username=email_clean,
            email=email_clean,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user

# 2. Serializer de connexion (Sign In)
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # On supprime le champ 'username' hérité
        self.fields.pop('username', None)

    def validate(self, attrs):
        raw_email = attrs.get('email', '')
        password = attrs.get('password')

        if raw_email and password:
            email_clean = raw_email.strip().lower()
            
            # Recherche de l'utilisateur de manière insensible à la casse
            user = (
                User.objects.filter(email__iexact=email_clean).first()
                or User.objects.filter(username__iexact=email_clean).first()
            )

            if not user:
                raise serializers.ValidationError("Identifiants incorrects.")

            # Authentification de l'utilisateur avec son vrai username
            user_auth = authenticate(username=user.username, password=password)

            if not user_auth:
                raise serializers.ValidationError("Identifiants incorrects.")
            
            if not user_auth.is_active:
                raise serializers.ValidationError("Ce compte est désactivé.")

            # Génération des tokens JWT
            data = super().validate({'username': user.username, 'password': password})
            
            # Renvoi des informations utilisateur pour le Header React
            data['user'] = {
                'id': user.id,
                'name': user.first_name,
                'email': user.email
            }
            return data
        
        raise serializers.ValidationError("L'adresse e-mail et le mot de passe sont requis.")