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
    
    window_area = models.FloatField(
        verbose_name="Επιφάνεια παραθύρων (m²)",
        validators=[MinValueValidator(0.1)],
        help_text="Συνολική επιφάνεια παραθύρων σε τετραγωνικά μέτρα"
    )
    
    shading_coefficient = models.FloatField(
        verbose_name="Συντελεστής σκίασης περσίδων (%)",
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=70.0,
        help_text="Ποσοστό μείωσης ηλιακών κερδών από τις περσίδες (συνήθως 60-80%)"
    )
    
    solar_radiation = models.FloatField(
        verbose_name="Μέση ημερήσια ηλιακή ακτινοβολία (kWh/m²/ημέρα)",
        validators=[MinValueValidator(0)],
        default=5.0,
        help_text="Μέση ημερήσια ηλιακή ακτινοβολία για τους μήνες ψύξης"
    )
    
    cooling_months = models.IntegerField(
        verbose_name="Μήνες λειτουργίας ψύξης",
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        default=5,
        help_text="Αριθμός μηνών που λειτουργεί το σύστημα ψύξης (συνήθως 4-6)"
    )
    
    cooling_system_eer = models.FloatField(
        verbose_name="Απόδοση συστήματος ψύξης (EER)",
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        default=2.5,
        help_text="Energy Efficiency Ratio του συστήματος ψύξης (συνήθως 2.0-3.5)"
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
    cooling_energy_savings = models.DecimalField(
        verbose_name="Εξοικονόμηση ενέργειας ψύξης (kWh/έτος)",
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός ετήσιας εξοικονόμησης ενέργειας ψύξης"
    )
    
    energy_cost_kwh = models.FloatField(
        verbose_name="Κόστος ενέργειας (€/kWh)",
        validators=[MinValueValidator(0)],
        default=0.15,
        help_text="Κόστος ενέργειας σε ευρώ ανά kWh"
    )
    
    time_period = models.IntegerField(
        verbose_name="Χρονικό διάστημα (έτη)",
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        default=20,
        help_text="Χρονικό διάστημα αξιολόγησης της επένδυσης"
    )
    
    discount_rate = models.FloatField(
        verbose_name="Επιτόκιο αναγωγής (%)",
        validators=[MinValueValidator(0), MaxValueValidator(30)],
        default=5.0,
        help_text="Επιτόκιο αναγωγής για τον υπολογισμό NPV"
    )
    
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
    
    discounted_payback_period = models.FloatField(
        verbose_name="Προεξοφλημένη περίοδος αποπληρωμής (έτη)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός προεξοφλημένης περιόδου αποπληρωμής"
    )
    
    net_present_value = models.DecimalField(
        verbose_name="Καθαρή παρούσα αξία - NPV (€)",
        max_digits=12,
        decimal_places=2,
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
    
    def _calculate_cooling_savings(self):
        """Υπολογισμός εξοικονόμησης ενέργειας ψύξης"""
        try:
            # Υπολογισμός ηλιακών κερδών μέσω παραθύρων
            # Ηλιακά κέρδη (kWh/έτος) = Επιφάνεια × Ηλιακή ακτινοβολία × Ημέρες × Μήνες
            days_per_month = 30
            solar_gains_kwh = (self.window_area * self.solar_radiation * 
                              days_per_month * self.cooling_months)
            
            # Μείωση ηλιακών κερδών από περσίδες
            reduced_solar_gains = solar_gains_kwh * (self.shading_coefficient / 100.0)
            
            # Εξοικονόμηση ηλεκτρικής ενέργειας = Μειωμένα ηλιακά κέρδη / EER
            # (Η μείωση του φορτίου ψύξης μετατρέπεται σε μείωση κατανάλωσης ρεύματος)
            from decimal import Decimal, ROUND_HALF_UP
            savings = reduced_solar_gains / self.cooling_system_eer
            self.cooling_energy_savings = Decimal(str(savings)).quantize(Decimal('0.001'), rounding=ROUND_HALF_UP)
            
        except (ValueError, TypeError, ZeroDivisionError):
            self.cooling_energy_savings = Decimal('0.000')
    
    def _calculate_economics(self):
        """Υπολογισμός οικονομικών δεικτών"""
        try:
            # Πρώτα υπολογίζουμε την εξοικονόμηση ψύξης
            self._calculate_cooling_savings()
            
            self.total_investment_cost = (self.window_area * self.cost_per_m2) + self.installation_cost
            
            # Μετατροπή Decimal σε float για τους υπολογισμούς
            cooling_savings_value = float(self.cooling_energy_savings) if self.cooling_energy_savings else 0
            self.annual_energy_savings = cooling_savings_value * self.energy_cost_kwh
            
            self.annual_economic_benefit = self.annual_energy_savings - self.maintenance_cost
            
            if self.annual_economic_benefit > 0:
                self.payback_period = self.total_investment_cost / self.annual_economic_benefit
            else:
                self.payback_period = None
            
            # Discounted Payback Period calculation
            if self.annual_economic_benefit > 0 and self.discount_rate > 0:
                discount_factor = self.discount_rate / 100
                cumulative_discounted_cash_flow = 0
                self.discounted_payback_period = None
                
                for year in range(1, self.time_period + 1):
                    discounted_cash_flow = self.annual_economic_benefit / ((1 + discount_factor) ** year)
                    cumulative_discounted_cash_flow += discounted_cash_flow
                    
                    if cumulative_discounted_cash_flow >= self.total_investment_cost:
                        # Linear interpolation for precise payback period
                        previous = cumulative_discounted_cash_flow - discounted_cash_flow
                        fraction = (self.total_investment_cost - previous) / discounted_cash_flow
                        self.discounted_payback_period = (year - 1) + fraction
                        break
                
                # If payback not achieved within time period, set to time_period + 1
                if self.discounted_payback_period is None:
                    self.discounted_payback_period = self.time_period + 1
            else:
                self.discounted_payback_period = None
            
            if self.annual_economic_benefit > 0 and self.discount_rate > 0:
                discount_factor = self.discount_rate / 100
                npv = 0
                for year in range(1, self.time_period + 1):
                    npv += self.annual_economic_benefit / ((1 + discount_factor) ** year)
                npv_value = npv - self.total_investment_cost
            else:
                npv_value = -self.total_investment_cost
            
            # Μετατροπή σε Decimal με 2 δεκαδικά
            from decimal import Decimal, ROUND_HALF_UP
            self.net_present_value = Decimal(str(npv_value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            # IRR υπολογισμός με Newton-Raphson
            if self.total_investment_cost > 0 and self.annual_economic_benefit > 0:
                # Υπολογισμός IRR: βρίσκουμε το επιτόκιο όπου NPV = 0
                initial_investment = float(self.total_investment_cost)
                annual_benefit = float(self.annual_economic_benefit)
                years = int(self.time_period)
                
                # Αρχική εκτίμηση IRR
                irr = 0.1  # 10%
                tolerance = 0.00001
                max_iterations = 1000
                
                for _ in range(max_iterations):
                    # Υπολογισμός NPV με το τρέχον IRR
                    npv = -initial_investment
                    npv_derivative = 0
                    
                    for year in range(1, years + 1):
                        factor = (1 + irr) ** year
                        npv += annual_benefit / factor
                        npv_derivative -= year * annual_benefit / (factor * (1 + irr))
                    
                    # Έλεγχος σύγκλισης
                    if abs(npv) < tolerance:
                        break
                    
                    # Newton-Raphson update
                    if npv_derivative != 0:
                        irr = irr - npv / npv_derivative
                    else:
                        break
                    
                    # Αποφυγή αρνητικών IRR
                    if irr < -0.99:
                        irr = -0.99
                
                self.internal_rate_of_return = irr * 100
            else:
                self.internal_rate_of_return = 0
                
        except (ValueError, TypeError, ZeroDivisionError):
            self.total_investment_cost = None
            self.annual_energy_savings = None
            self.annual_economic_benefit = None
            self.payback_period = None
            self.discounted_payback_period = None
            self.net_present_value = None
            self.internal_rate_of_return = None
    
    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός οικονομικών δεικτών πριν την αποθήκευση"""
        self._calculate_economics()
        super().save(*args, **kwargs)
