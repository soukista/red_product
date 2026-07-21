from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Profil étendu de l'administrateur — lié au User Django natif."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.TextField(blank=True, null=True)  # Image en Base64

    def __str__(self):
        return f"Profil de {self.user.email}"


# Créer automatiquement un UserProfile à chaque création de User
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
