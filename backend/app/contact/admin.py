from django.contrib import admin
from .models import Contact

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'email', 'building', 'created_at')
    list_filter = ('building', 'role', 'created_at')
    search_fields = ('name', 'email', 'building__name')
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('uuid', 'building', 'name', 'role')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
