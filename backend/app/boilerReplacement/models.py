import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from building.models import Building
from project.models import Project


class BoilerReplacement(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    
    # Στοιχεία παλιού λέβητα
    old_boiler_efficiency = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Συντελεστής απόδοσης παλιού λέβητα (%)",
        validators=[MinValueValidator(0.1), MaxValueValidator(100)],
        default=80.0,
        help_text="Συντελεστής απόδοσης του υπάρχοντος λέβητα σε %"
    )
    
    # Στοιχεία νέου λέβητα
    new_boiler_efficiency = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Συντελεστής απόδοσης νέου λέβητα (%)",
        validators=[MinValueValidator(0.1), MaxValueValidator(100)],
        default=95.0,
        help_text="Συντελεστής απόδοσης του νέου λέβητα σε %"
    )
    boiler_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Κόστος νέου λέβητα (€)",
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
    
    annual_heating_consumption_liters = models.FloatField(
        verbose_name="Ετήσια κατανάλωση θέρμανσης (λίτρα/έτος)",
        validators=[MinValueValidator(0)],
        default=1000.0,
        help_text="Ετήσια κατανάλωση πετρελαίου για θέρμανση του κτιρίου σε λίτρα"
    )
    heating_oil_savings_liters = models.FloatField(
        verbose_name="Εξοικονόμηση πετρελαίου θέρμανσης (λίτρα/έτος)",
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Εξοικονόμηση πετρελαίου από τη βελτίωση απόδοσης"
    )
    oil_price_per_liter = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        verbose_name="Τιμή πετρελαίου (€/λίτρο)",
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Τιμή πετρελαίου ανά λίτρο (από τα στοιχεία του έργου)"
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
        """Υπολογισμός οικονομικών δεικτών με βάση την εξοικονόμηση πετρελαίου"""
        try:
            # Υπολογισμός συνολικού κόστους επένδυσης
            self.total_investment_cost = (
                float(self.boiler_cost) + float(self.installation_cost)
            )
            
            # Εάν δεν έχει οριστεί τιμή πετρελαίου, πάρτη από το έργο
            if not self.oil_price_per_liter and self.project:
                self.oil_price_per_liter = self.project.oil_price_per_liter
            
            # Υπολογισμός εξοικονόμησης πετρελαίου με βάση τους συντελεστές απόδοσης
            old_efficiency = float(self.old_boiler_efficiency) / 100
            new_efficiency = float(self.new_boiler_efficiency) / 100
            annual_consumption_liters = float(self.annual_heating_consumption_liters)
            
            # Η εξοικονόμηση υπολογίζεται από τη διαφορά απόδοσης
            # Αν ο παλιός λέβητας καταναλώνει X λίτρα με απόδοση 80%
            # και ο νέος έχει απόδοση 95%, τότε ο νέος θα καταναλώνει:
            # new_consumption = old_consumption * (old_efficiency / new_efficiency)
            if old_efficiency > 0 and new_efficiency > 0:
                new_consumption_liters = annual_consumption_liters * (old_efficiency / new_efficiency)
                self.heating_oil_savings_liters = annual_consumption_liters - new_consumption_liters
            else:
                self.heating_oil_savings_liters = 0
            
            # Υπολογισμός ετήσιας οικονομικής εξοικονόμησης σε € (μπορεί να είναι αρνητική)
            oil_price = float(self.oil_price_per_liter or 0)
            self.annual_energy_savings = (
                float(self.heating_oil_savings_liters) * oil_price
            )
            
            # Υπολογισμός ετήσιου οικονομικού οφέλους (μπορεί να είναι αρνητικό)
            self.annual_economic_benefit = (
                float(self.annual_energy_savings) - float(self.maintenance_cost)
            )
            
            # Υπολογισμός περιόδου αποπληρωμής (μόνο αν το όφελος είναι θετικό)
            if float(self.annual_economic_benefit) > 0:
                self.payback_period = (
                    float(self.total_investment_cost) / float(self.annual_economic_benefit)
                )
            else:
                self.payback_period = 0
            
            # NPV υπολογισμός (υπολογίζεται και για αρνητικές τιμές)
            discount_rate_decimal = float(self.discount_rate) / 100
            years = int(self.time_period)
            annual_benefit = float(self.annual_economic_benefit)
            
            if annual_benefit != 0:
                if discount_rate_decimal > 0:
                    # NPV = Σ[Annual_Benefit / (1 + r)^t] - Initial_Investment
                    npv_sum = 0
                    for year in range(1, years + 1):
                        npv_sum += annual_benefit / ((1 + discount_rate_decimal) ** year)
                    self.net_present_value = npv_sum - float(self.total_investment_cost)
                else:
                    # Αν δεν υπάρχει προεξοφλητικός συντελεστής
                    self.net_present_value = (annual_benefit * years) - float(self.total_investment_cost)
            else:
                self.net_present_value = -float(self.total_investment_cost)
            
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
            # Σε περίπτωση σφάλματος
            self.total_investment_cost = 0
            self.heating_oil_savings_liters = 0
            self.annual_energy_savings = 0
            self.annual_economic_benefit = 0
            self.payback_period = None
            self.net_present_value = 0
            self.internal_rate_of_return = 0

    def save(self, *args, **kwargs):
        self._calculate_economics()
        super().save(*args, **kwargs)
