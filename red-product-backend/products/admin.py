from django.contrib import admin

from .models import Hotel

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'price_per_night', 'currency', 'created_by', 'created_at')
    list_filter = ('currency', 'created_at')
    search_fields = ('name', 'address')

