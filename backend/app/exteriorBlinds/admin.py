from django.contrib import admin
from .models import ExteriorBlinds


@admin.register(ExteriorBlinds)
class ExteriorBlindsAdmin(admin.ModelAdmin):
    """Admin interface για εξωτερικές περσίδες"""
    
    list_display = [
        'building', 'project', 'window_area', 'cost_per_m2', 
        'total_investment_cost', 'annual_economic_benefit', 
        'payback_period', 'created_at'
    ]
    
    list_filter = [
        'created_at', 'updated_at', 'building__name', 'project__name'
    ]
    
    search_fields = [
        'building__name', 'project__name', 'building__address'
    ]
    
    readonly_fields = [
        'uuid', 'total_investment_cost', 'annual_energy_savings', 
        'annual_economic_benefit', 'payback_period', 'net_present_value', 
        'internal_rate_of_return', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Βασικές Πληροφορίες', {
            'fields': ('uuid', 'building', 'project')
        }),
        ('Οικονομικά Στοιχεία', {
            'fields': ('window_area', 'cost_per_m2', 'installation_cost', 'maintenance_cost')
        }),
        ('Ενεργειακά Στοιχεία', {
            'fields': ('cooling_energy_savings', 'energy_cost_kwh')
        }),
        ('Παράμετροι Αξιολόγησης', {
            'fields': ('time_period', 'discount_rate')
        }),
        ('Αυτόματοι Υπολογισμοί', {
            'fields': ('total_investment_cost', 'annual_energy_savings', 'annual_economic_benefit',
                      'payback_period', 'net_present_value', 'internal_rate_of_return'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Προσθήκη επιπλέον readonly πεδίων για υπάρχοντα αντικείμενα"""
        readonly = list(self.readonly_fields)
        if obj:  # Αν επεξεργαζόμαστε υπάρχον αντικείμενο
            readonly.extend(['building', 'project'])
        return readonly
