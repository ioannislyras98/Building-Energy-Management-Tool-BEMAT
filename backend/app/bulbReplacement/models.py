from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import uuid

User = get_user_model()


class BulbReplacement(models.Model):
    """
    Bulb replacement analysis with energy and economic calculations
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
    
    old_bulb_type = models.CharField(
        max_length=255,
        verbose_name="Τύπος παλαιού φορτίου",
        help_text="Τύπος του παλαιού λαμπτήρα",
        default="Λαμπτήρας Πυρακτώσεως"
    )
    old_power_per_bulb = models.FloatField(
        verbose_name="Ισχύς παλαιού φορτίου (W)",
        help_text="Ισχύς του παλαιού λαμπτήρα σε Watts"
    )
    old_bulb_count = models.IntegerField(
        verbose_name="Πλήθος παλαιών λαμπτήρων",
        help_text="Αριθμός παλαιών λαμπτήρων"
    )
    old_operating_hours = models.FloatField(
        verbose_name="Ώρες λειτουργίας παλαιών λαμπτήρων ανά έτος",
        help_text="Ώρες λειτουργίας των παλαιών λαμπτήρων ανά έτος"
    )
    old_consumption_kwh = models.FloatField(
        verbose_name="Κατανάλωση παλαιών λαμπτήρων (kWh)",
        help_text="Ετήσια κατανάλωση παλαιών λαμπτήρων σε kWh",
        null=True,
        blank=True
    )
    
    new_bulb_type = models.CharField(
        max_length=255,
        verbose_name="Τύπος νέου φορτίου",
        help_text="Τύπος του νέου λαμπτήρα",
        default="LED Λαμπτήρας"
    )
    new_power_per_bulb = models.FloatField(
        verbose_name="Ισχύς νέου φορτίου (W)",
        help_text="Ισχύς του νέου λαμπτήρα σε Watts"
    )
    new_bulb_count = models.IntegerField(
        verbose_name="Πλήθος νέων λαμπτήρων",
        help_text="Αριθμός νέων λαμπτήρων"
    )
    new_operating_hours = models.FloatField(
        verbose_name="Ώρες λειτουργίας νέων λαμπτήρων ανά έτος",
        help_text="Ώρες λειτουργίας των νέων λαμπτήρων ανά έτος"
    )
    new_consumption_kwh = models.FloatField(
        verbose_name="Κατανάλωση νέων λαμπτήρων (kWh)",
        help_text="Ετήσια κατανάλωση νέων λαμπτήρων σε kWh",
        null=True,
        blank=True
    )
    
    cost_per_new_bulb = models.FloatField(
        verbose_name="Κόστος ανά νέο λαμπτήρα (€)",
        help_text="Κόστος αγοράς ενός νέου λαμπτήρα",
        null=True,
        blank=True
    )
    installation_cost = models.FloatField(
        verbose_name="Κόστος εγκατάστασης (€)",
        help_text="Επιπρόσθετο κόστος για την εγκατάσταση",
        null=True,
        blank=True,
        default=0
    )
    energy_cost_kwh = models.FloatField(
        verbose_name="Κόστος ενέργειας (€/kWh)",
        help_text="Κόστος ενεργειακής μονάδας",
        null=True,
        blank=True
    )
    maintenance_cost_annual = models.FloatField(
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        help_text="Ετήσιο κόστος συντήρησης νέων λαμπτήρων",
        null=True,
        blank=True,
        default=0
    )
    lifespan_years = models.FloatField(
        verbose_name="Διάρκεια ζωής (έτη)",
        help_text="Αναμενόμενη διάρκεια ζωής νέων λαμπτήρων",
        null=True,
        blank=True,
        default=10
    )
    
    energy_savings_kwh = models.FloatField(
        verbose_name="Ετήσια ενεργειακή εξοικονόμηση (kWh)",
        help_text="Ετήσια ενεργειακή εξοικονόμηση από την αντικατάσταση",
        null=True,
        blank=True
    )
    
    total_investment_cost = models.FloatField(
        verbose_name="Συνολικό κόστος επένδυσης (€)",
        help_text="Συνολικό κόστος αντικατάστασης λαμπτήρων",
        null=True,
        blank=True
    )
    annual_cost_savings = models.FloatField(
        verbose_name="Ετήσια οικονομική εξοικονόμηση (€)",
        help_text="Ετήσια εξοικονόμηση σε κόστος ενέργειας",
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
        verbose_name = "Αντικατάσταση Λαμπτήρων"
        verbose_name_plural = "Αντικαταστάσεις Λαμπτήρων"
        ordering = ['-created_at']
        unique_together = [['building', 'user']]

    def __str__(self):
        return f"Bulb Replacement - {self.building} ({self.uuid})"

    def save(self, *args, **kwargs):
        """
        Override save to calculate energy and economic benefits automatically
        """
        if not self.user_id and hasattr(self, '_user'):
            self.user = self._user
            
        self.calculate_consumption()
        self.calculate_energy_savings()
        self.calculate_economic_benefits()
            
        super().save(*args, **kwargs)

    def calculate_consumption(self):
        """
        Calculate energy consumption for old and new bulbs
        """
        if all([self.old_power_per_bulb, self.old_bulb_count, self.old_operating_hours]):
            self.old_consumption_kwh = (self.old_power_per_bulb * self.old_bulb_count * self.old_operating_hours) / 1000
            
        if all([self.new_power_per_bulb, self.new_bulb_count, self.new_operating_hours]):
            self.new_consumption_kwh = (self.new_power_per_bulb * self.new_bulb_count * self.new_operating_hours) / 1000

    def calculate_energy_savings(self):
        """
        Calculate energy savings from bulb replacement
        """
        if self.old_consumption_kwh and self.new_consumption_kwh:
            self.energy_savings_kwh = self.old_consumption_kwh - self.new_consumption_kwh

    def calculate_economic_benefits(self):
        """
        Calculate economic benefits and financial metrics
        """
        if self.new_bulb_count and self.cost_per_new_bulb:
            bulb_cost = self.new_bulb_count * self.cost_per_new_bulb
            installation_cost = self.installation_cost or 0
            self.total_investment_cost = bulb_cost + installation_cost
            
        if self.energy_savings_kwh and self.energy_cost_kwh:
            self.annual_cost_savings = self.energy_savings_kwh * self.energy_cost_kwh
            
        if self.annual_cost_savings and self.total_investment_cost and self.annual_cost_savings > 0:
            self.payback_period = self.total_investment_cost / self.annual_cost_savings
            
            discount_rate = 0.05
            years = self.lifespan_years or 10
            annual_net_savings = self.annual_cost_savings - (self.maintenance_cost_annual or 0)
            
            pv_savings = 0
            for year in range(1, int(years) + 1):
                pv_savings += annual_net_savings / (1 + discount_rate) ** year
                
            self.net_present_value = pv_savings - self.total_investment_cost
            
            # Calculate IRR using Newton-Raphson method
            if self.total_investment_cost > 0 and annual_net_savings > 0 and years > 0:
                guess = 0.1  # Initial guess 10%
                max_iterations = 1000
                tolerance = 0.00001
                
                for i in range(max_iterations):
                    npv_at_guess = -self.total_investment_cost
                    derivative_npv = 0
                    
                    for year in range(1, int(years) + 1):
                        discount_factor = (1 + guess) ** year
                        npv_at_guess += annual_net_savings / discount_factor
                        derivative_npv -= (year * annual_net_savings) / ((1 + guess) ** (year + 1))
                    
                    if abs(npv_at_guess) < tolerance:
                        self.internal_rate_of_return = guess * 100
                        break
                    
                    if abs(derivative_npv) > 0.000001:
                        guess = guess - npv_at_guess / derivative_npv
                    else:
                        self.internal_rate_of_return = 0
                        break
                    
                    if guess < -0.99:
                        guess = -0.99
                    if guess > 10:
                        guess = 10
                else:
                    self.internal_rate_of_return = guess * 100 if guess > -0.99 else 0
            else:
                self.internal_rate_of_return = 0

    def get_efficiency_improvement(self):
        """
        Calculate the efficiency improvement percentage
        """
        if self.old_consumption_kwh and self.new_consumption_kwh:
            return ((self.old_consumption_kwh - self.new_consumption_kwh) / 
                   self.old_consumption_kwh) * 100
        return 0

    def get_total_lifetime_savings(self):
        """
        Calculate total savings over the lifespan
        """
        if self.annual_cost_savings and self.lifespan_years:
            return self.annual_cost_savings * self.lifespan_years
        return 0
