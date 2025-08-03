from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from building.models import Building
from project.models import Project


class ExteriorBlinds(models.Model):
    """Model for exterior blinds installation scenario"""
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='exterior_blinds')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='exterior_blinds')
    
    # Οικονομικά στοιχεία
    window_area = models.FloatField(
        verbose_name="Επιφάνεια παραθύρων (m²)",
        validators=[MinValueValidator(0.1)],
        help_text="Συνολική επιφάνεια παραθύρων σε τετραγωνικά μέτρα"
    )
    
    cost_per_m2 = models.FloatField(
        verbose_name="Κόστος ανά m² (€)",
        validators=[MinValueValidator(0)],
        help_text="Κόστος εγκατάστασης περσίδων ανά τετραγωνικό μέτρο"
    )
    
    installation_cost = models.FloatField(
        verbose_name="Κόστος εγκατάστασης (€)",
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Επιπλέον κόστος εγκατάστασης"
    )
    
    maintenance_cost = models.FloatField(
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Ετήσιο κόστος συντήρησης των περσίδων"
    )
    
    # Ενεργειακά στοιχεία
    cooling_energy_savings = models.FloatField(
        verbose_name="Εξοικονόμηση ενέργειας ψύξης (kWh/έτος)",
        validators=[MinValueValidator(0)],
        help_text="Ετήσια εξοικονόμηση ενέργειας λόγω μείωσης φόρτου ψύξης"
    )
    
    energy_cost_kwh = models.FloatField(
        verbose_name="Κόστος ενέργειας (€/kWh)",
        validators=[MinValueValidator(0)],
        default=0.15,
        help_text="Κόστος ενέργειας σε ευρώ ανά kWh"
    )
    
    # Οικονομικοί παράμετροι
    time_period = models.IntegerField(
        verbose_name="Χρονικό διάστημα (έτη)",
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        default=20,
        help_text="Χρονικό διάστημα αξιολόγησης της επένδυσης"
    )
    
    discount_rate = models.FloatField(
        verbose_name="Προεξοφλητικός συντελεστής (%)",
        validators=[MinValueValidator(0), MaxValueValidator(30)],
        default=5.0,
        help_text="Προεξοφλητικός συντελεστής για τον υπολογισμό NPV"
    )
    
    # Αυτόματοι υπολογισμοί (read-only)
    total_investment_cost = models.FloatField(
        verbose_name="Συνολικό κόστος επένδυσης (€)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός συνολικού κόστους"
    )
    
    annual_energy_savings = models.FloatField(
        verbose_name="Ετήσια ενεργειακή εξοικονόμηση (€)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός ετήσιας εξοικονόμησης"
    )
    
    annual_economic_benefit = models.FloatField(
        verbose_name="Ετήσιο οικονομικό όφελος (€)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός ετήσιου οφέλους"
    )
    
    payback_period = models.FloatField(
        verbose_name="Περίοδος αποπληρωμής (έτη)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός περιόδου αποπληρωμής"
    )
    
    net_present_value = models.FloatField(
        verbose_name="Καθαρή παρούσα αξία - NPV (€)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός NPV"
    )
    
    internal_rate_of_return = models.FloatField(
        verbose_name="Εσωτερικός βαθμός απόδοσης - IRR (%)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός IRR"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Εγκατάσταση Εξωτερικών Περσίδων"
        verbose_name_plural = "Εγκαταστάσεις Εξωτερικών Περσίδων"
        unique_together = ('building', 'project')
        
    def __str__(self):
        return f"Εξωτερικές Περσίδες - {self.building.name}"
    
    def _calculate_economics(self):
        """Υπολογισμός οικονομικών δεικτών"""
        try:
            # Συνολικό κόστος επένδυσης
            self.total_investment_cost = (self.window_area * self.cost_per_m2) + self.installation_cost
            
            # Ετήσια ενεργειακή εξοικονόμηση σε ευρώ
            self.annual_energy_savings = self.cooling_energy_savings * self.energy_cost_kwh
            
            # Ετήσιο οικονομικό όφελος (εξοικονόμηση - συντήρηση)
            self.annual_economic_benefit = self.annual_energy_savings - self.maintenance_cost
            
            # Περίοδος αποπληρωμής
            if self.annual_economic_benefit > 0:
                self.payback_period = self.total_investment_cost / self.annual_economic_benefit
            else:
                self.payback_period = None
            
            # NPV υπολογισμός
            if self.annual_economic_benefit > 0 and self.discount_rate > 0:
                discount_factor = self.discount_rate / 100
                npv = 0
                for year in range(1, self.time_period + 1):
                    npv += self.annual_economic_benefit / ((1 + discount_factor) ** year)
                self.net_present_value = npv - self.total_investment_cost
            else:
                self.net_present_value = -self.total_investment_cost
            
            # IRR απλοποιημένος υπολογισμός
            if self.total_investment_cost > 0:
                self.internal_rate_of_return = (self.annual_economic_benefit / self.total_investment_cost) * 100
            else:
                self.internal_rate_of_return = 0
                
        except (ValueError, TypeError, ZeroDivisionError):
            # Σε περίπτωση σφάλματος, θέτουμε τις τιμές σε None
            self.total_investment_cost = None
            self.annual_energy_savings = None
            self.annual_economic_benefit = None
            self.payback_period = None
            self.net_present_value = None
            self.internal_rate_of_return = None
    
    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός οικονομικών δεικτών πριν την αποθήκευση"""
        self._calculate_economics()
        super().save(*args, **kwargs)
