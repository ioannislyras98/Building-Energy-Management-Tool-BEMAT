from django.contrib import admin
from .models import BoilerDetail

@admin.register(BoilerDetail)
class BoilerDetailAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'building', 'nominal_power', 'fuel_type', 'manufacturing_year', 'created_at']
    list_filter = ['fuel_type', 'manufacturing_year', 'created_at']
    search_fields = ['building__name', 'fuel_type']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project', 'user')
        }),
        ('Χαρακτηριστικά Λέβητα', {
            'fields': ('nominal_power', 'internal_efficiency', 'manufacturing_year', 'fuel_type')
        }),
        ('Μετρήσεις Καυσαερίων', {
            'fields': ('nitrogen_monoxide', 'nitrogen_oxides', 'exhaust_temperature', 'smoke_scale', 'room_temperature')
        }),
        ('Χρονικές Σημάνσεις', {
            'fields': ('created_at', 'updated_at')
        }),
    )
