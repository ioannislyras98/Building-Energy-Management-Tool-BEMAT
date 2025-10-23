from django.contrib import admin
from .models import Prefecture


@admin.register(Prefecture)
class PrefectureAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'zone', 'temperature_winter', 'temperature_summer',
        'is_active', 'created_by', 'created_at'
    ]
    list_filter = ['zone', 'is_active', 'created_by', 'created_at']
    search_fields = ['name']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('name', 'zone', 'is_active')
        }),
        ('Θερμοκρασίες', {
            'fields': ('temperature_winter', 'temperature_summer')
        }),
        ('Μεταδεδομένα', {
            'fields': ('uuid', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
