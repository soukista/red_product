from django.db import migrations
from django.core.management import call_command

def load_fixtures(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    # Créer l'administrateur par défaut (ID=1) s'il n'existe pas
    if not User.objects.filter(id=1).exists():
        User.objects.create_user(
            username='admin@redproduct.com',
            email='admin@redproduct.com',
            password='AdminPassword123!',
            first_name='Admin RED',
            is_staff=True,
            is_superuser=True
        )
    
    try:
        call_command('loaddata', 'products/fixtures/hotels.json')
    except Exception as e:
        print("Chargement des hôtels ignoré ou déjà effectué :", e)

def reverse_code(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_hotel_image'),
    ]

    operations = [
        migrations.RunPython(load_fixtures, reverse_code),
    ]
