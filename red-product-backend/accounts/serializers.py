from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

# 1. Serializer d'inscription (Sign Up)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'email', 'password']

    def validate_email(self, value):
        # Vérifier si un utilisateur avec cet email existe déjà (en tant qu'email ou username)
        if User.objects.filter(username=value).exists() or User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cette adresse e-mail existe déjà.")
        return value

    def create(self, validated_data):
        # On crée l'utilisateur en mettant l'e-mail comme username et email
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
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
        # On supprime le champ 'username' hérité pour éviter l'erreur 400 "champ obligatoire"
        self.fields.pop('username', None)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # On authentifie via l'e-mail (qui est aussi notre username en base)
            user = authenticate(username=email, password=password)

            if not user:
                raise serializers.ValidationError("Identifiants incorrects.")
            
            if not user.is_active:
                raise serializers.ValidationError("Ce compte est désactivé.")

            # Génération des tokens JWT
            data = super().validate({'username': user.username, 'password': password})
            
            # On renvoie en plus les infos de l'admin pour que React les affiche (ex: nom dans le header)
            data['user'] = {
                'id': user.id,
                'name': user.first_name,
                'email': user.email
            }
            return data
        
        raise serializers.ValidationError("L'adresse e-mail et le mot de passe sont requis.")