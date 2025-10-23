from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()


class WindowReplacement(models.Model):
    """
    Window replacement analysis with energy and economic calculations
    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Χρήστης")
    building = models.ForeignKey(
        'building.Building', 
        on_delete=models.CASCADE, 
        verbose_name="Κτίριο"
    )
    project = models.ForeignKey(
        'project.Project', 
        on_delete=models.CASCADE, 
        verbose_name="Έργο"
    )
    
    old_thermal_conductivity = models.FloatField(
        verbose_name="Παλαιός συντελεστής θερμικής αγωγιμότητας (W/m²K)",
        help_text="Συντελεστής θερμικής αγωγιμότητας παλαιών υαλοπινάκων"
    )
    new_thermal_conductivity = models.FloatField(
        verbose_name="Νέος συντελεστής θερμικής αγωγιμότητας (W/m²K)",
        help_text="Συντελεστής θερμικής αγωγιμότητας νέων υαλοπινάκων"
    )
    window_area = models.FloatField(
        verbose_name="Επιφάνεια υαλοπινάκων (m²)",
        help_text="Συνολική επιφάνεια υαλοπινάκων προς αντικατάσταση"
    )
    
    old_losses_summer = models.FloatField(
        verbose_name="Απώλειες πριν - Θερινοί Μήνες (kWh)",
        help_text="Ενεργειακές απώλειες με παλαιούς υαλοπίνακες κατά τους θερινούς μήνες",
        null=True,
        blank=True
    )
    old_losses_winter = models.FloatField(
        verbose_name="Απώλειες πριν - Χειμερινοί Μήνες (kWh)",
        help_text="Ενεργειακές απώλειες με παλαιούς υαλοπίνακες κατά τους χειμερινούς μήνες",
        null=True,
        blank=True
    )
    new_losses_summer = models.FloatField(
        verbose_name="Απώλειες μετά - Θερινοί Μήνες (kWh)",
        help_text="Ενεργειακές απώλειες με νέους υαλοπίνακες κατά τους θερινούς μήνες",
        null=True,
        blank=True
    )
    new_losses_winter = models.FloatField(
        verbose_name="Απώλειες μετά - Χειμερινοί Μήνες (kWh)",
        help_text="Ενεργειακές απώλειες με νέους υαλοπίνακες κατά τους χειμερινούς μήνες",
        null=True,
        blank=True
    )
    
    cost_per_sqm = models.FloatField(
        verbose_name="Κόστος ανά m² (€/m²)",
        help_text="Κόστος αντικατάστασης ανά τετραγωνικό μέτρο",
        null=True,
        blank=True
    )
    energy_cost_kwh = models.FloatField(
        verbose_name="Κόστος ενέργειας (€/kWh)",
        help_text="Κόστος ενεργειακής μονάδας",
        null=True,
        blank=True
    )
    maintenance_cost_annual = models.FloatField(
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        help_text="Ετήσιο κόστος συντήρησης νέων υαλοπινάκων",
        null=True,
        blank=True,
        default=0
    )
    lifespan_years = models.FloatField(
        verbose_name="Διάρκεια ζωής (έτη)",
        help_text="Αναμενόμενη διάρκεια ζωής νέων υαλοπινάκων",
        null=True,
        blank=True,
        default=20
    )
    
    energy_savings_summer = models.FloatField(
        verbose_name="Ενεργειακή εξοικονόμηση καλοκαίρι (kWh)",
        help_text="Ετήσια ενεργειακή εξοικονόμηση κατά τους θερινούς μήνες",
        null=True,
        blank=True
    )
    energy_savings_winter = models.FloatField(
        verbose_name="Ενεργειακή εξοικονόμηση χειμώνα (kWh)",
        help_text="Ετήσια ενεργειακή εξοικονόμηση κατά τους χειμερινούς μήνες",
        null=True,
        blank=True
    )
    total_energy_savings = models.FloatField(
        verbose_name="Συνολική ετήσια ενεργειακή εξοικονόμηση (kWh)",
        help_text="Συνολική ετήσια ενεργειακή εξοικονόμηση",
        null=True,
        blank=True
    )
    
    annual_cost_savings = models.FloatField(
        verbose_name="Ετήσια οικονομική εξοικονόμηση (€)",
        help_text="Ετήσια εξοικονόμηση σε κόστος ενέργειας",
        null=True,
        blank=True
    )
    total_investment_cost = models.FloatField(
        verbose_name="Συνολικό κόστος επένδυσης (€)",
        help_text="Συνολικό κόστος αντικατάστασης υαλοπινάκων",
        null=True,
        blank=True
    )
    payback_period = models.FloatField(
        verbose_name="Περίοδος αποπληρωμής (έτη)",
        help_text="Χρόνος απόσβεσης της επένδυσης",
        null=True,
        blank=True
    )
    net_present_value = models.FloatField(
        verbose_name="Καθαρή παρούσα αξία (€)",
        help_text="NPV της επένδυσης",
        null=True,
        blank=True
    )
    internal_rate_of_return = models.FloatField(
        verbose_name="Εσωτερικός βαθμός απόδοσης (%)",
        help_text="IRR της επένδυσης",
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ημερομηνία δημιουργίας")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ημερομηνία ενημέρωσης")

    class Meta:
        verbose_name = "Αντικατάσταση Υαλοπινάκων"
        verbose_name_plural = "Αντικαταστάσεις Υαλοπινάκων"
        ordering = ['-created_at']
        unique_together = [['building', 'user']]

    def __str__(self):
        return f"Window Replacement - {self.building} ({self.uuid})"

    def save(self, *args, **kwargs):
        """
        Override save to calculate energy and economic benefits automatically
        """
        if not self.user_id and hasattr(self, '_user'):
            self.user = self._user
            
        super().save(*args, **kwargs)

    def calculate_energy_savings(self):
        """
        Calculate energy savings from window replacement
        """
        if all([self.old_losses_summer, self.old_losses_winter, 
                self.new_losses_summer, self.new_losses_winter]):
            self.energy_savings_summer = self.old_losses_summer - self.new_losses_summer
            self.energy_savings_winter = self.old_losses_winter - self.new_losses_winter
            self.total_energy_savings = self.energy_savings_summer + self.energy_savings_winter

    def calculate_economic_benefits(self):
        """
        Calculate economic benefits and financial metrics
        """
        if self.total_energy_savings and self.energy_cost_kwh:
            self.annual_cost_savings = self.total_energy_savings * self.energy_cost_kwh
            
        if self.window_area and self.cost_per_sqm:
            self.total_investment_cost = self.window_area * self.cost_per_sqm
            
        if self.annual_cost_savings and self.total_investment_cost and self.annual_cost_savings > 0:
            self.payback_period = self.total_investment_cost / self.annual_cost_savings
            
            discount_rate = 0.05
            years = self.lifespan_years or 20
            annual_net_savings = self.annual_cost_savings - (self.maintenance_cost_annual or 0)
            
            pv_savings = 0
            for year in range(1, int(years) + 1):
                pv_savings += annual_net_savings / (1 + discount_rate) ** year
                
            self.net_present_value = pv_savings - self.total_investment_cost
            
            if self.total_investment_cost > 0:
                self.internal_rate_of_return = (annual_net_savings / self.total_investment_cost) * 100

    def get_efficiency_improvement(self):
        """
        Calculate the efficiency improvement percentage
        """
        if self.old_thermal_conductivity and self.new_thermal_conductivity:
            return ((self.old_thermal_conductivity - self.new_thermal_conductivity) / 
                   self.old_thermal_conductivity) * 100
        return 0

    def get_total_lifetime_savings(self):
        """
        Calculate total savings over the lifespan
        """
        if self.annual_cost_savings and self.lifespan_years:
            return self.annual_cost_savings * self.lifespan_years
        return 0
