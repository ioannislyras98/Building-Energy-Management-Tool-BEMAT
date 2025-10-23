from django.db import models
from django.core.validators import MinValueValidator
from building.models import Building
from project.models import Project


class BoilerReplacement(models.Model):
    building = models.OneToOneField(
        Building,
        on_delete=models.CASCADE,
        related_name='boiler_replacement'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='boiler_replacements'
    )
    
    boiler_power = models.FloatField(
        verbose_name="Ισχύς λέβητα (kW)",
        validators=[MinValueValidator(0.1)],
        help_text="Ισχύς του νέου λέβητα σε kW"
    )
    boiler_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Κόστος λέβητα (€)",
        validators=[MinValueValidator(0)],
        help_text="Κόστος αγοράς του νέου λέβητα"
    )
    installation_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Κόστος εγκατάστασης (€)",
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Κόστος εγκατάστασης και σύνδεσης του νέου λέβητα"
    )
    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Ετήσιο κόστος συντήρησης του νέου λέβητα"
    )
    
    heating_energy_savings = models.FloatField(
        verbose_name="Εξοικονόμηση ενέργειας θέρμανσης (kWh/έτος)",
        validators=[MinValueValidator(0)],
        help_text="Ετήσια εξοικονόμηση ενέργειας από την αντικατάσταση λέβητα"
    )
    energy_cost_kwh = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        verbose_name="Κόστος ενέργειας (€/kWh)",
        default=0.150,
        validators=[MinValueValidator(0)],
        help_text="Τιμή ενέργειας ανά kWh"
    )
    
    time_period = models.IntegerField(
        verbose_name="Χρονικό διάστημα (έτη)",
        default=20,
        validators=[MinValueValidator(1)],
        help_text="Περίοδος αξιολόγησης της επένδυσης σε έτη"
    )
    discount_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Προεξοφλητικός συντελεστής (%)",
        default=5.0,
        validators=[MinValueValidator(0)],
        help_text="Προεξοφλητικός συντελεστής για υπολογισμό NPV"
    )
    
    total_investment_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Συνολικό κόστος επένδυσης (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Κόστος λέβητα + Κόστος εγκατάστασης"
    )
    annual_energy_savings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Ετήσια ενεργειακή εξοικονόμηση (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Εξοικονόμηση kWh × Κόστος ενέργειας"
    )
    annual_economic_benefit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Ετήσιο οικονομικό όφελος (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Εξοικονόμηση - Κόστος συντήρησης"
    )
    payback_period = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Περίοδος αποπληρωμής (έτη)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Κόστος επένδυσης ÷ Ετήσιο όφελος"
    )
    net_present_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Καθαρή παρούσα αξία - NPV (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός NPV με προεξοφλητικό συντελεστή"
    )
    internal_rate_of_return = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Εσωτερικός βαθμός απόδοσης - IRR (%)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός IRR (απλοποιημένος)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Αντικατάσταση Λέβητα"
        verbose_name_plural = "Αντικατάσταση Λέβητα"
        db_table = 'boiler_replacement'

    def __str__(self):
        return f"Αντικατάσταση λέβητα - {self.building}"

    def _calculate_economics(self):
        """Υπολογισμός οικονομικών δεικτών"""
        try:
            self.total_investment_cost = (
                float(self.boiler_cost) + float(self.installation_cost)
            )
            
            self.annual_energy_savings = (
                float(self.heating_energy_savings) * float(self.energy_cost_kwh)
            )
            
            self.annual_economic_benefit = (
                float(self.annual_energy_savings) - float(self.maintenance_cost)
            )
            
            if float(self.annual_economic_benefit) > 0:
                self.payback_period = (
                    float(self.total_investment_cost) / float(self.annual_economic_benefit)
                )
            else:
                self.payback_period = None
            
            # NPV υπολογισμός
            discount_rate_decimal = float(self.discount_rate) / 100
            years = int(self.time_period)
            annual_benefit = float(self.annual_economic_benefit)
            
            if discount_rate_decimal > 0:
                # NPV = Σ[Annual_Benefit / (1 + r)^t] - Initial_Investment
                npv_sum = 0
                for year in range(1, years + 1):
                    npv_sum += annual_benefit / ((1 + discount_rate_decimal) ** year)
                self.net_present_value = npv_sum - float(self.total_investment_cost)
            else:
                # Αν δεν υπάρχει προεξοφλητικός συντελεστής
                self.net_present_value = (annual_benefit * years) - float(self.total_investment_cost)
            
            # IRR υπολογισμός (απλοποιημένος)
            if float(self.total_investment_cost) > 0 and annual_benefit > 0:
                self.internal_rate_of_return = (annual_benefit / float(self.total_investment_cost)) * 100
            else:
                self.internal_rate_of_return = 0
                
        except (ValueError, TypeError, ZeroDivisionError):
            # Σε περίπτωση σφάλματος
            self.total_investment_cost = 0
            self.annual_energy_savings = 0
            self.annual_economic_benefit = 0
            self.payback_period = None
            self.net_present_value = 0
            self.internal_rate_of_return = 0

    def save(self, *args, **kwargs):
        self._calculate_economics()
        super().save(*args, **kwargs)
