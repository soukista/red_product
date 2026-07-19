from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Hotel
from .serializers import HotelSerializer

class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.all().order_by('-created_at')
    serializer_class = HotelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # On renvoie le nombre réel d'hôtels et d'utilisateurs inscrits en BDD
        hotels_count = Hotel.objects.count()
        users_count = User.objects.count()
        
        return Response({
            'hotels_count': hotels_count,
            'users_count': users_count,
            'messages_count': 40,
            'emails_count': 25,
            'forms_count': 125,
            'entities_count': 2
        })
