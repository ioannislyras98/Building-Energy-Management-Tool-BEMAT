import uuid
from django.db import models
from django.core.validators import MinValueValidator
from building.models import Building
from project.models import Project


class AutomaticLightingControl(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.OneToOneField(
        Building,
        on_delete=models.CASCADE,
        related_name='automatic_lighting_control'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='automatic_lighting_controls'
    )
    
    # Στοιχεία Συστήματος Φωτισμού
    lighting_area = models.FloatField(
        verbose_name="Επιφάνεια φωτισμού (m²)",
        validators=[MinValueValidator(0.1)],
        help_text="Συνολική επιφάνεια που καλύπτει το σύστημα φωτισμού"
    )
    cost_per_m2 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Κόστος ανά m² (€)",
        validators=[MinValueValidator(0)],
        help_text="Κόστος εγκατάστασης συστήματος αυτόματου ελέγχου ανά τετραγωνικό μέτρο"
    )
    installation_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Κόστος εγκατάστασης (€)",
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Επιπλέον κόστος εγκατάστασης (εργασία, υλικά κλπ)"
    )
    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Ετήσιο κόστος συντήρησης και λειτουργίας του συστήματος"
    )
    
    # Ενεργειακά Στοιχεία
    lighting_energy_savings = models.FloatField(
        verbose_name="Εξοικονόμηση ενέργειας φωτισμού (kWh/έτος)",
        validators=[MinValueValidator(0)],
        help_text="Ετήσια εξοικονόμηση ενέργειας από την αυτόματη ρύθμιση φωτισμού"
    )
    energy_cost_kwh = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        verbose_name="Κόστος ενέργειας (€/kWh)",
        default=0.150,
        validators=[MinValueValidator(0)],
        help_text="Τιμή ενέργειας ανά kWh"
    )
    
    # Παράμετροι Αξιολόγησης
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
    
    # Υπολογιζόμενα Πεδία
    total_investment_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Συνολικό κόστος επένδυσης (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: (Επιφάνεια × Κόστος/m²) + Κόστος εγκατάστασης"
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
        verbose_name = "Αυτόματος Έλεγχος Φωτισμού"
        verbose_name_plural = "Αυτόματος Έλεγχος Φωτισμού"
        db_table = 'automatic_lighting_control'

    def __str__(self):
        return f"Αυτόματος έλεγχος φωτισμού - {self.building}"

    def _calculate_economics(self):
        """Υπολογισμός οικονομικών δεικτών"""
        try:
            # Συνολικό κόστος επένδυσης
            self.total_investment_cost = (
                float(self.lighting_area) * float(self.cost_per_m2) + 
                float(self.installation_cost)
            )
            
            # Ετήσια ενεργειακή εξοικονόμηση
            self.annual_energy_savings = (
                float(self.lighting_energy_savings) * float(self.energy_cost_kwh)
            )
            
            # Ετήσιο οικονομικό όφελος
            self.annual_economic_benefit = (
                float(self.annual_energy_savings) - float(self.maintenance_cost)
            )
            
            # Περίοδος αποπληρωμής
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
            
            # IRR υπολογισμός με Newton-Raphson
            if float(self.total_investment_cost) > 0 and annual_benefit > 0:
                # Υπολογισμός IRR: βρίσκουμε το επιτόκιο όπου NPV = 0
                initial_investment = float(self.total_investment_cost)
                
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
            # Σε περίπτωση σφάλματος, μηδενίζουμε τα υπολογιζόμενα πεδία
            self.total_investment_cost = 0
            self.annual_energy_savings = 0
            self.annual_economic_benefit = 0
            self.payback_period = None
            self.net_present_value = 0
            self.internal_rate_of_return = 0

    def save(self, *args, **kwargs):
        self._calculate_economics()
        super().save(*args, **kwargs)
