from django.contrib import admin
from .models import Material


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'thermal_conductivity', 
        'is_active', 'created_by', 'created_at'
    ]
    list_filter = ['category', 'is_active', 'created_by', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('name', 'category', 'description', 'is_active')
        }),
        ('Θερμικές Ιδιότητες', {
            'fields': ('thermal_conductivity',)
        }),
        ('Μεταδεδομένα', {
            'fields': ('uuid', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
