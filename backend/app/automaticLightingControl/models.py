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
        validators=[MinValueValidator(0)],
        help_text="Επιπλέον κόστος εγκατάστασης (εργασία, υλικά κλπ)"
    )
    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Ετήσιο κόστος συντήρησης (€)",
        validators=[MinValueValidator(0)],
        help_text="Ετήσιο κόστος συντήρησης και λειτουργίας του συστήματος"
    )
    
    # Ενεργειακά Στοιχεία - Τρέχοντα Δεδομένα
    current_lighting_power_density = models.FloatField(
        verbose_name="Τρέχουσα ισχύς φωτισμού (W/m²)",
        default=10,
        validators=[MinValueValidator(0)],
        help_text="Μέση ισχύς φωτισμού ανά τετραγωνικό μέτρο πριν την εγκατάσταση"
    )
    operating_hours_per_day = models.FloatField(
        verbose_name="Ώρες λειτουργίας φωτισμού ανά ημέρα",
        default=8,
        validators=[MinValueValidator(0.1)],
        help_text="Μέσες ώρες που λειτουργεί ο φωτισμός ημερησίως"
    )
    operating_days_per_year = models.IntegerField(
        verbose_name="Ημέρες λειτουργίας ανά έτος",
        default=250,
        validators=[MinValueValidator(1)],
        help_text="Αριθμός ημερών που λειτουργεί το κτίριο ετησίως"
    )
    estimated_savings_percentage = models.FloatField(
        verbose_name="Εκτιμώμενο ποσοστό εξοικονόμησης (%)",
        default=30,
        validators=[MinValueValidator(0)],
        help_text="Ποσοστό εξοικονόμησης ενέργειας από αυτόματο έλεγχο (συνήθως 25-40%)"
    )
    
    # Αυτόματα υπολογιζόμενα ενεργειακά στοιχεία
    lighting_energy_savings = models.FloatField(
        verbose_name="Εξοικονόμηση ενέργειας φωτισμού (kWh/έτος)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός: Τρέχουσα κατανάλωση × Ποσοστό εξοικονόμησης"
    )
    energy_cost_kwh = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        verbose_name="Κόστος ενέργειας (€/kWh)",
        null=True,
        blank=True,
        help_text="Αυτόματη λήψη από το έργο - Τιμή ενέργειας ανά kWh"
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
        verbose_name="Επιτόκιο αναγωγής (%)",
        default=5.0,
        validators=[MinValueValidator(0)],
        help_text="Επιτόκιο αναγωγής για υπολογισμό NPV"
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
    discounted_payback_period = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Προεξοφλημένη περίοδος αποπληρωμής (έτη)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός προεξοφλημένης περιόδου αποπληρωμής"
    )
    net_present_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Καθαρή παρούσα αξία - NPV (€)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός NPV με επιτόκιο αναγωγής"
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
            # Υπολογισμός τρέχουσας ετήσιας κατανάλωσης
            current_annual_consumption = (
                float(self.lighting_area) * 
                float(self.current_lighting_power_density) / 1000 * 
                float(self.operating_hours_per_day) * 
                int(self.operating_days_per_year)
            )
            
            # Υπολογισμός εξοικονόμησης ενέργειας
            self.lighting_energy_savings = (
                current_annual_consumption * 
                (float(self.estimated_savings_percentage) / 100)
            )
            
            # Συνολικό κόστος επένδυσης
            self.total_investment_cost = (
                float(self.lighting_area) * float(self.cost_per_m2) + 
                float(self.installation_cost)
            )
            
            # Λήψη κόστους ενέργειας από το project
            if not self.energy_cost_kwh and self.project:
                self.energy_cost_kwh = float(self.project.cost_per_kwh_electricity or 0.150)
            elif not self.energy_cost_kwh:
                self.energy_cost_kwh = 0.150
            
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
            
            # Discounted Payback Period calculation
            if annual_benefit > 0 and discount_rate_decimal > 0:
                cumulative_discounted_cash_flow = 0
                self.discounted_payback_period = years + 1  # Default: δεν αποπληρώνεται
                
                for year in range(1, years + 1):
                    discounted_cash_flow = annual_benefit / ((1 + discount_rate_decimal) ** year)
                    cumulative_discounted_cash_flow += discounted_cash_flow
                    
                    if cumulative_discounted_cash_flow >= float(self.total_investment_cost) and self.discounted_payback_period > years:
                        # Linear interpolation for precise payback period
                        previous = cumulative_discounted_cash_flow - discounted_cash_flow
                        fraction = (float(self.total_investment_cost) - previous) / discounted_cash_flow
                        self.discounted_payback_period = (year - 1) + fraction
            else:
                self.discounted_payback_period = 0
            
            if discount_rate_decimal > 0:
                # NPV = Σ[Annual_Benefit / (1 + r)^t] - Initial_Investment
                npv_sum = 0
                for year in range(1, years + 1):
                    npv_sum += annual_benefit / ((1 + discount_rate_decimal) ** year)
                self.net_present_value = npv_sum - float(self.total_investment_cost)
            else:
                # Αν δεν υπάρχει επιτόκιο αναγωγής
                self.net_present_value = (annual_benefit * years) - float(self.total_investment_cost)
            
            # IRR υπολογισμός με Newton-Raphson
            # IRR είναι το επιτόκιο όπου NPV = 0
            # NPV = -Initial_Investment + Σ[(Annual_Savings - Maintenance_Cost) / (1 + IRR)^t] = 0
            if float(self.total_investment_cost) > 0 and annual_benefit > 0:
                initial_investment = float(self.total_investment_cost)
                
                # Αρχική εκτίμηση IRR (απλή προσέγγιση)
                simple_roi = annual_benefit / initial_investment
                irr = simple_roi if simple_roi < 1 else 0.1
                
                tolerance = 0.00001
                max_iterations = 1000
                
                for iteration in range(max_iterations):
                    # Υπολογισμός NPV και της παραγώγου του ως προς IRR
                    npv = -initial_investment
                    npv_derivative = 0
                    
                    for year in range(1, years + 1):
                        discount_factor = (1 + irr) ** year
                        # Cash flow για κάθε έτος (καθαρό όφελος)
                        cash_flow = annual_benefit
                        npv += cash_flow / discount_factor
                        # Παράγωγος του NPV ως προς IRR
                        npv_derivative -= year * cash_flow / (discount_factor * (1 + irr))
                    
                    # Έλεγχος σύγκλισης
                    if abs(npv) < tolerance:
                        break
                    
                    # Newton-Raphson update: IRR_new = IRR_old - f(IRR)/f'(IRR)
                    if abs(npv_derivative) > 1e-10:
                        irr_new = irr - npv / npv_derivative
                        
                        # Περιορισμός του IRR σε λογικά όρια (-99% έως 1000%)
                        irr_new = max(-0.99, min(irr_new, 10.0))
                        
                        # Έλεγχος για ταλάντωση
                        if abs(irr_new - irr) < tolerance:
                            irr = irr_new
                            break
                        
                        irr = irr_new
                    else:
                        break
                
                self.internal_rate_of_return = irr * 100
            else:
                self.internal_rate_of_return = 0
                
        except (ValueError, TypeError, ZeroDivisionError):
            # Σε περίπτωση σφάλματος, μηδενίζουμε τα υπολογιζόμενα πεδία
            self.total_investment_cost = 0
            self.annual_energy_savings = 0
            self.annual_economic_benefit = 0
            self.payback_period = None
            self.discounted_payback_period = 0
            self.net_present_value = 0
            self.internal_rate_of_return = 0

    def save(self, *args, **kwargs):
        self._calculate_economics()
        super().save(*args, **kwargs)
