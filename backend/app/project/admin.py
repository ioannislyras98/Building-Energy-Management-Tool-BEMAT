from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path
from django.shortcuts import render
from django.contrib import messages
from django.db import transaction
from .models import Project

def bulk_delete_projects(modeladmin, request, queryset):
    """Custom bulk delete action with confirmation page."""
    if request.POST.get('confirm_delete'):
        # Perform the actual deletion
        with transaction.atomic():
            count = queryset.count()
            project_names = list(queryset.values_list('name', flat=True))
            queryset.delete()
            
        messages.success(
            request, 
            f'Successfully deleted {count} projects: {", ".join(project_names[:5])}'
            + (f' and {len(project_names) - 5} more' if len(project_names) > 5 else '')
        )
        return HttpResponseRedirect(request.get_full_path())
    
    # Show confirmation page
    context = {
        'queryset': queryset,
        'projects_count': queryset.count(),
        'action': 'bulk_delete_projects',
        'opts': modeladmin.model._meta,
        'has_view_permission': modeladmin.has_view_permission(request),
        'has_change_permission': modeladmin.has_change_permission(request),
        'has_delete_permission': modeladmin.has_delete_permission(request),
    }
    
    return render(request, 'admin/project/bulk_delete_confirmation.html', context)

bulk_delete_projects.short_description = "🗑️ Bulk delete selected projects"

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "uuid", 
        "name", 
        "user", 
        "date_created", 
        "is_submitted",
        "buildings_count", 
        "cost_per_kwh_fuel", 
        "cost_per_kwh_electricity"
    )
    
    list_filter = (
        "is_submitted",
        "date_created",
        "user",
    )
    
    search_fields = (
        "name",
        "uuid",
        "user__username",
        "user__email",
    )
    
    list_per_page = 25
    
    ordering = ("-date_created",)
    
    readonly_fields = ("uuid", "date_created")
    
    actions = [bulk_delete_projects]
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("uuid", "name", "user")
        }),
        ("Costs", {
            "fields": ("cost_per_kwh_fuel", "cost_per_kwh_electricity"),
            "classes": ("collapse",)
        }),
        ("Status", {
            "fields": ("is_submitted", "date_created"),
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related for better performance."""
        return super().get_queryset(request).select_related('user')
    
    def buildings_count(self, obj):
        """Show count of buildings in this project."""
        return obj.buildings.count()
    buildings_count.short_description = "Buildings"
    buildings_count.admin_order_field = "buildings__count"