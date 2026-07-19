from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HotelViewSet, DashboardStatsView

# On crée le routeur par défaut de DRF
router = DefaultRouter()
# On enregistre la route 'hotels' liée à notre ViewSet
router.register('hotels', HotelViewSet, basename='hotel')

# Les URLs de l'application incluent toutes les routes générées par le routeur
urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]