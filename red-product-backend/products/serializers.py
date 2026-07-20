from rest_framework import serializers
from .models import Hotel

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'address', 'phone', 'email', 'image', 'price_per_night', 'currency', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def validate_image(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("La photo de l'hôtel est obligatoire.")
        return value