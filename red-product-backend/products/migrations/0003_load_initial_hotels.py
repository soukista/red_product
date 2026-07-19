from django.db import migrations
from django.core.management import call_command

def load_fixtures(apps, schema_editor):
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
