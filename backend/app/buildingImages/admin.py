from django.contrib import admin
from .models import BuildingImage


@admin.register(BuildingImage)
class BuildingImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'building', 'project', 'uploaded_at']
    list_filter = ['category', 'uploaded_at', 'building', 'project']
    search_fields = ['title', 'description', 'tags', 'building__name']
    readonly_fields = ['uploaded_at', 'updated_at']
    
    fieldsets = (
        ('Image Information', {
            'fields': ('title', 'description', 'category', 'tags', 'image')
        }),
        ('Relations', {
            'fields': ('building', 'project')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
