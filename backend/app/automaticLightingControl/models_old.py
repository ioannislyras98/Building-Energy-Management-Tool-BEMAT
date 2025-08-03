from django.db import models
from django.core.validators import MinValueValidator
from building.models import Building
from project.models import Project


class AutomaticLightingControl(models.Model):
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
            
            # IRR υπολογισμός (απλοποιημένος)
            if float(self.total_investment_cost) > 0 and annual_benefit > 0:
                self.internal_rate_of_return = (annual_benefit / float(self.total_investment_cost)) * 100
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
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Ετήσιο κόστος συντήρησης του συστήματος"
    )
    
    # Ενεργειακά στοιχεία
    current_lighting_consumption = models.FloatField(
        verbose_name="Τρέχουσα κατανάλωση φωτισμού (kWh/έτος)",
        validators=[MinValueValidator(0)],
        help_text="Ετήσια κατανάλωση ενέργειας για φωτισμό"
    )
    
    energy_savings_percentage = models.FloatField(
        verbose_name="Ποσοστό εξοικονόμησης (%)",
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=30.0,
        help_text="Ποσοστό εξοικονόμησης ενέργειας με το νέο σύστημα"
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
        default=15,
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
    
    annual_energy_savings_kwh = models.FloatField(
        verbose_name="Ετήσια εξοικονόμηση ενέργειας (kWh)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός ετήσιας εξοικονόμησης σε kWh"
    )
    
    annual_energy_savings = models.FloatField(
        verbose_name="Ετήσια ενεργειακή εξοικονόμηση (€)",
        blank=True,
        null=True,
        help_text="Αυτόματος υπολογισμός ετήσιας εξοικονόμησης σε ευρώ"
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
        verbose_name = "Αυτόματος Έλεγχος Φωτισμού"
        verbose_name_plural = "Συστήματα Αυτόματου Ελέγχου Φωτισμού"
        unique_together = ('building', 'project')
        
    def __str__(self):
        return f"Αυτόματος Έλεγχος Φωτισμού - {self.building.name}"
    
    def _calculate_economics(self):
        """Υπολογισμός οικονομικών δεικτών"""
        try:
            # Συνολικό κόστος επένδυσης
            self.total_investment_cost = self.system_cost + self.installation_cost
            
            # Ετήσια εξοικονόμηση ενέργειας σε kWh
            self.annual_energy_savings_kwh = self.current_lighting_consumption * (self.energy_savings_percentage / 100)
            
            # Ετήσια εξοικονόμηση ενέργειας σε ευρώ
            self.annual_energy_savings = self.annual_energy_savings_kwh * self.energy_cost_kwh
            
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
            self.annual_energy_savings_kwh = None
            self.annual_energy_savings = None
            self.annual_economic_benefit = None
            self.payback_period = None
            self.net_present_value = None
            self.internal_rate_of_return = None
    
    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός οικονομικών δεικτών πριν την αποθήκευση"""
        self._calculate_economics()
        super().save(*args, **kwargs)
