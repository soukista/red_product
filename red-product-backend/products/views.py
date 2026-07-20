from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Hotel
from .serializers import HotelSerializer

class HotelViewSet(viewsets.ModelViewSet):
    serializer_class = HotelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Chaque administrateur ne voit et ne gère QUE ses propres hôtels
        return Hotel.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # On renvoie le nombre d'hôtels propres à cet administrateur
        hotels_count = Hotel.objects.filter(created_by=request.user).count()
        users_count = User.objects.count()
        
        return Response({
            'hotels_count': hotels_count,
            'users_count': users_count,
            'messages_count': 40,
            'emails_count': 25,
            'forms_count': 125,
            'entities_count': 2
        })
