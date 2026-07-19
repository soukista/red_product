from django.db import models
from django.conf import settings

class Hotel(models.Model):
    CURRENCY_CHOICES = [
        ('XOF', 'F XOF'),
        ('EUR', 'Euro'),
        ('USD', 'Dollar'),
    ]

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='XOF'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hotels'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


