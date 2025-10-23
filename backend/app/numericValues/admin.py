from django.contrib import admin
from .models import NumericValue


@admin.register(NumericValue)
class NumericValueAdmin(admin.ModelAdmin):
    list_display = ['name', 'value', 'created_by', 'created_at']
    list_filter = ['created_at', 'created_by']
    search_fields = ['name']
    list_editable = ['value']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('name', 'value')
        }),
        ('Σύστημα', {
            'fields': ('uuid', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

