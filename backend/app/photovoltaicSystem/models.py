from django.db import models
import uuid
from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class PhotovoltaicSystem(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='photovoltaic_systems',
        to_field='uuid',
        null=True,
        blank=True,
        verbose_name='Χρήστης'
    )
    building = models.ForeignKey('building.Building', on_delete=models.CASCADE, related_name='photovoltaic_systems')
    project = models.ForeignKey('project.Project', on_delete=models.CASCADE, related_name='photovoltaic_systems')
    
    pv_panels_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Φωτοβολταϊκών Πλαισίων',
        validators=[MinValueValidator(0)]
    )
    pv_panels_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Φωτοβολταϊκών Πλαισίων (€)',
        validators=[MinValueValidator(0)]
    )
    pv_panels_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Φωτοβολταϊκών Πλαισίων (€)',
        validators=[MinValueValidator(0)]
    )
    
    metal_bases_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Μεταλλικών Βάσεων Στήριξης',
        validators=[MinValueValidator(0)]
    )
    metal_bases_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Μεταλλικών Βάσεων Στήριξης (€)',
        validators=[MinValueValidator(0)]
    )
    metal_bases_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Μεταλλικών Βάσεων Στήριξης (€)',
        validators=[MinValueValidator(0)]
    )
    
    piping_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Σωληνώσεων',
        validators=[MinValueValidator(0)]
    )
    piping_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Σωληνώσεων (€)',
        validators=[MinValueValidator(0)]
    )
    piping_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Σωληνώσεων (€)',
        validators=[MinValueValidator(0)]
    )
    
    wiring_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Καλωδιώσεων',
        validators=[MinValueValidator(0)]
    )
    wiring_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Καλωδιώσεων (€)',
        validators=[MinValueValidator(0)]
    )
    wiring_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Καλωδιώσεων (€)',
        validators=[MinValueValidator(0)]
    )
    inverter_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Μετατροπέων Ισχύος',
        validators=[MinValueValidator(0)]
    )
    inverter_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Μετατροπέων Ισχύος (€)',
        validators=[MinValueValidator(0)]
    )
    inverter_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Μετατροπέων Ισχύος (€)',
        validators=[MinValueValidator(0)]
    )
    
    installation_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσότητα Εγκατάστασης',
        validators=[MinValueValidator(0)]
    )
    installation_unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Τιμή Μονάδας Εγκατάστασης (€)',
        validators=[MinValueValidator(0)]
    )
    installation_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Δαπάνη Εγκατάστασης (€)',
        validators=[MinValueValidator(0)]
    )
    
    estimated_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Εκτιμώμενο κόστος (€)',
        validators=[MinValueValidator(0)]
    )
    unexpected_expenses = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Απρόβλεπτες δαπάνες 9% (€)',
        validators=[MinValueValidator(0)]
    )
    value_after_unexpected = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Αξία μετά τις απρόβλεπτες δαπάνες (€)',
        validators=[MinValueValidator(0)]
    )
    tax_burden = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Επιβάρυνση φόρου 24% (€)',
        validators=[MinValueValidator(0)]
    )
    total_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Συνολικό κόστος (€)',
        validators=[MinValueValidator(0)]
    )
    subsidy_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ποσό επιδότησης (€)',
        validators=[MinValueValidator(0)]
    )
    net_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Καθαρό κόστος (€)',
        validators=[MinValueValidator(0)]
    )
    payback_period = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Περίοδος απόσβεσης (έτη)',
        validators=[MinValueValidator(0)]
    )
    discounted_payback_period = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Προεξοφλημένη περίοδος απόσβεσης (έτη)',
        validators=[MinValueValidator(0)]
    )
    annual_savings = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ετήσια εξοικονόμηση (€)',
        validators=[MinValueValidator(0)]
    )
    internal_rate_of_return = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name="Εσωτερικός βαθμός απόδοσης - IRR (%)",
        null=True,
        blank=True,
        help_text="Αυτόματος υπολογισμός IRR με Newton-Raphson"
    )
    net_present_value = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Καθαρή παρούσα αξία - NPV (€)',
        help_text='Αυτόματος υπολογισμός NPV με προεξοφλητικό συντελεστή'
    )
    discount_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Επιτόκιο αναγωγής (%)',
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Επιτόκιο αναγωγής για τον υπολογισμό NPV'
    )
    annual_operational_costs = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ετήσια λειτουργικά κόστη (€)',
        validators=[MinValueValidator(0)],
        help_text='Ετήσια κόστη συντήρησης και λειτουργίας'
    )
    
    power_per_panel = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=400.0,
        verbose_name='Ισχύς ανά πλαίσιο (W)',
        validators=[MinValueValidator(0)],
        help_text='Υποχρεωτικό πεδίο για τον υπολογισμό της ετήσιας παραγωγής'
    )
    collector_efficiency = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=20.0,
        verbose_name='Βαθμός απόδοσης συλλεκτών (%)',
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Υποχρεωτικό πεδίο για τον υπολογισμό της ετήσιας παραγωγής'
    )
    installation_angle = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=32.0,
        verbose_name='Κλίση τοποθέτησης (°)',
        validators=[MinValueValidator(0), MaxValueValidator(90)],
        help_text='Υποχρεωτικό πεδίο για τον υπολογισμό της ετήσιας παραγωγής'
    )
    pv_usage = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Χρήση Φ/Β',
        help_text='π.χ. Για ίδια κατανάλωση'
    )
    pv_system_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Τύπος Φ/Β συστήματος',
        help_text='π.χ. Μονοκρυσταλλικό'
    )
    annual_energy_production = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ετήσια παραγωγή ενέργειας (kWh)',
        validators=[MinValueValidator(0)]
    )
    carbon_footprint_reduction = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Μείωση αποτυπώματος άνθρακα (kg CO2/έτος)',
        validators=[MinValueValidator(0)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Εγκατάσταση Φωτοβολταϊκών'
        verbose_name_plural = 'Εγκαταστάσεις Φωτοβολταϊκών'
        unique_together = [['building', 'user']]
        
    def __str__(self):
        return f"Φωτοβολταϊκό σύστημα - {self.building.name if self.building else 'Χωρίς κτίριο'}"
    
    def calculate_total_equipment_cost(self):
        """Υπολογισμός συνολικού κόστους εξοπλισμού"""
        costs = [
            self.pv_panels_cost or 0,
            self.metal_bases_cost or 0,
            self.piping_cost or 0,
            self.wiring_cost or 0,
            self.inverter_cost or 0,
            self.installation_cost or 0,
        ]
        return sum(costs)
    
    def calculate_unexpected_expenses(self):
        """Υπολογισμός απρόβλεπτων δαπανών (9%)"""
        total_equipment = self.calculate_total_equipment_cost()
        return total_equipment * Decimal('0.09')
    
    def calculate_value_after_unexpected(self):
        """Υπολογισμός αξίας μετά τις απρόβλεπτες δαπάνες"""
        total_equipment = self.calculate_total_equipment_cost()
        unexpected = self.calculate_unexpected_expenses()
        return total_equipment + unexpected
    
    def calculate_tax_burden(self):
        """Υπολογισμός επιβάρυνσης φόρου (24%)"""
        value_after_unexpected = self.calculate_value_after_unexpected()
        return value_after_unexpected * Decimal('0.24')
    
    def calculate_total_cost(self):
        """Υπολογισμός συνολικού κόστους"""
        value_after_unexpected = self.calculate_value_after_unexpected()
        tax_burden = self.calculate_tax_burden()
        return value_after_unexpected + tax_burden
    
    def calculate_annual_savings(self):
        """Υπολογισμός ετήσιων εξοικονομήσεων βάσει της ετήσιας παραγωγής ενέργειας μείον τα λειτουργικά κόστη"""
        try:
            electricity_cost_per_kwh = Decimal('0.15')
            
            annual_energy_kwh = float(self.annual_energy_production or 0)
            
            if annual_energy_kwh <= 0:
                return Decimal('0')
            
            gross_savings = Decimal(str(annual_energy_kwh)) * electricity_cost_per_kwh
            
            # Αφαίρεση ετήσιων λειτουργικών κοστών
            operational_costs = self.annual_operational_costs or Decimal('0')
            annual_savings = gross_savings - operational_costs
            
            # Τα καθαρά savings δεν μπορούν να είναι αρνητικά
            return round(max(annual_savings, Decimal('0')), 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def calculate_payback_period(self):
        """Υπολογισμός περιόδου απόσβεσης σε έτη"""
        try:
            initial_investment = float(self.net_cost or 0)
            if initial_investment <= 0:
                initial_investment = float(self.total_cost or 0)
                
            annual_savings = float(self.annual_savings or 0)
            
            if initial_investment <= 0 or annual_savings <= 0:
                return Decimal('0')
            
            payback_years = initial_investment / annual_savings
            
            return round(Decimal(str(payback_years)), 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def calculate_discounted_payback_period(self):
        """
        Υπολογισμός προεξοφλημένης περιόδου απόσβεσης σε έτη
        Βρίσκει τον χρόνο όπου οι σωρευτικές προεξοφλημένες ροές ισούνται με την αρχική επένδυση
        """
        try:
            initial_investment = float(self.net_cost or self.total_cost or 0)
            annual_savings = float(self.annual_savings or 0)
            annual_operational_costs = float(self.annual_operational_costs or 0)
            discount_rate = float(self.discount_rate or 5) / 100
            project_lifetime_years = 25  # Τυπική διάρκεια ζωής φωτοβολταϊκού συστήματος
            
            if initial_investment <= 0 or annual_savings <= 0 or discount_rate <= 0:
                return Decimal('0')
            
            annual_net_benefit = annual_savings - annual_operational_costs
            if annual_net_benefit <= 0:
                return Decimal('0')
            
            cumulative_discounted_cash_flow = 0
            
            for year in range(1, project_lifetime_years + 1):
                discounted_cash_flow = annual_net_benefit / ((1 + discount_rate) ** year)
                cumulative_discounted_cash_flow += discounted_cash_flow
                
                if cumulative_discounted_cash_flow >= initial_investment:
                    # Linear interpolation for precise payback period
                    previous = cumulative_discounted_cash_flow - discounted_cash_flow
                    fraction = (initial_investment - previous) / discounted_cash_flow
                    return round(Decimal(str((year - 1) + fraction)), 2)
            
            # If payback not achieved within time period
            return Decimal(str(project_lifetime_years + 1))
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def calculate_internal_rate_of_return(self):
        """
        Υπολογισμός IRR με Newton-Raphson method
        IRR είναι το επιτόκιο όπου NPV = 0
        """
        try:
            initial_investment = float(self.net_cost or self.total_cost or 0)
            annual_savings = float(self.annual_savings or 0)
            annual_operational_costs = float(self.annual_operational_costs or 0)
            project_lifetime_years = 25  # Τυπική διάρκεια ζωής φωτοβολταϊκού συστήματος
            
            if initial_investment <= 0 or annual_savings <= 0:
                return Decimal('0')
            
            annual_net_benefit = annual_savings - annual_operational_costs
            
            if annual_net_benefit <= 0:
                return Decimal('0')
            
            # Αρχική εκτίμηση IRR
            irr = 0.1  # 10%
            tolerance = 0.00001
            max_iterations = 1000
            
            for _ in range(max_iterations):
                # Υπολογισμός NPV με το τρέχον IRR
                npv = -initial_investment
                npv_derivative = 0
                
                for year in range(1, project_lifetime_years + 1):
                    factor = (1 + irr) ** year
                    npv += annual_net_benefit / factor
                    npv_derivative -= year * annual_net_benefit / (factor * (1 + irr))
                
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
            
            return round(Decimal(str(irr * 100)), 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')

    def calculate_net_present_value(self):
        """Υπολογισμός της Καθαρής Παρούσας Αξίας (NPV)"""
        try:
            initial_investment = float(self.net_cost or self.total_cost or 0)
            annual_savings = float(self.annual_savings or 0)
            project_lifetime_years = 25
            
            # Χρήση του επιτοκίου αναγωγής από το πεδίο
            discount_rate_pct = float(self.discount_rate or 5.0)
            discount_rate = discount_rate_pct / 100.0
            
            if initial_investment <= 0 or annual_savings <= 0:
                return 0
            
            npv = -initial_investment
            for year in range(1, project_lifetime_years + 1):
                npv += annual_savings / ((1 + discount_rate) ** year)
            
            return round(npv, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return 0
    
    def calculate_annual_energy_production(self):
        """
        Αυτόματος υπολογισμός της ετήσιας παραγωγής ενέργειας (kWh/έτος)
        
        Τύπος: E = P × efficiency × n × H × PR
        Όπου:
        - E: Ετήσια παραγωγή ενέργειας (kWh/έτος)
        - P: Ονομαστική ισχύς ανά πλαίσιο (kW) - μετατροπή από W
        - efficiency: Απόδοση συλλέκτη (%)
        - n: Αριθμός πλαισίων
        - H: Ηλιακή ακτινοβολία (kWh/m²/έτος) - παίρνεται από τον νομό του κτιρίου
        - PR: Performance Ratio (Συντελεστής απόδοσης συστήματος) - τυπική τιμή: 0.8
        """
        try:
            if not self.pv_panels_quantity or not self.power_per_panel or not self.installation_angle or not self.collector_efficiency:
                return Decimal('0')
            
            power_per_panel_kw = float(self.power_per_panel) / 1000.0
            num_panels = float(self.pv_panels_quantity)
            collector_efficiency = float(self.collector_efficiency) / 100.0
            
            # Προσπάθεια να πάρουμε την ηλιακή ακτινοβολία από τον νομό του κτιρίου
            solar_irradiation = 1600.0  # Default value
            if self.building and hasattr(self.building, 'prefecture') and self.building.prefecture:
                if hasattr(self.building.prefecture, 'annual_solar_radiation') and self.building.prefecture.annual_solar_radiation:
                    solar_irradiation = float(self.building.prefecture.annual_solar_radiation)
            else:
                # Fallback στο NumericValue
                from numericValues.models import NumericValue
                solar_irradiation = NumericValue.get_value('Ηλιακή ακτινοβολία (kWh/m²/έτος)')
            
            from numericValues.models import NumericValue
            performance_ratio = NumericValue.get_value('Performance Ratio (PR)')
            
            angle = float(self.installation_angle)
            optimal_angle = 32.0
            angle_difference = abs(angle - optimal_angle)
            angle_loss_factor = max(0.90, 1.0 - (angle_difference * 0.005))
            performance_ratio *= angle_loss_factor
            
            annual_production = (
                power_per_panel_kw * 
                collector_efficiency *
                num_panels * 
                solar_irradiation * 
                performance_ratio
            )
            
            return round(Decimal(str(annual_production)), 2)
            
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός οικονομικών δεικτών κατά την αποθήκευση"""
        if self.pv_panels_quantity and self.pv_panels_unit_price:
            self.pv_panels_cost = self.pv_panels_quantity * self.pv_panels_unit_price
        
        if self.metal_bases_quantity and self.metal_bases_unit_price:
            self.metal_bases_cost = self.metal_bases_quantity * self.metal_bases_unit_price
        
        if self.piping_quantity and self.piping_unit_price:
            self.piping_cost = self.piping_quantity * self.piping_unit_price
        
        if self.wiring_quantity and self.wiring_unit_price:
            self.wiring_cost = self.wiring_quantity * self.wiring_unit_price
        
        if self.inverter_quantity and self.inverter_unit_price:
            self.inverter_cost = self.inverter_quantity * self.inverter_unit_price
        
        if self.installation_quantity and self.installation_unit_price:
            self.installation_cost = self.installation_quantity * self.installation_unit_price
        
        self.estimated_cost = self.calculate_total_equipment_cost()
        self.unexpected_expenses = self.calculate_unexpected_expenses()
        self.value_after_unexpected = self.calculate_value_after_unexpected()
        self.tax_burden = self.calculate_tax_burden()
        self.total_cost = self.calculate_total_cost()
        
        if self.total_cost and self.subsidy_amount:
            self.net_cost = self.total_cost - self.subsidy_amount
        elif self.total_cost:
            self.net_cost = self.total_cost
        
        # Αυτόματος υπολογισμός ετήσιας παραγωγής ενέργειας
        self.annual_energy_production = self.calculate_annual_energy_production()
        
        self.annual_savings = self.calculate_annual_savings()
        
        self.payback_period = self.calculate_payback_period()
        
        self.discounted_payback_period = self.calculate_discounted_payback_period()
        
        self.internal_rate_of_return = self.calculate_internal_rate_of_return()
        
        self.net_present_value = self.calculate_net_present_value()
        
        super().save(*args, **kwargs)
