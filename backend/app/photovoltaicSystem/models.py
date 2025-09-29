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
    
    # Εγκατάσταση Φ/Β Συστήματος - Ποσότητα, Τιμή Μονάδας, Δαπάνη
    # Φωτοβολταϊκά πλαίσια
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
    
    # Μεταλλικές βάσεις στήριξης
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
    
    # Σωληνώσεις κ.λπ.
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
    
    # Καλωδιώσεις
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
    
    # Μετατροπέας ισχύος
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
    
    # Μεταφορά, εγκατάσταση και θέση σε λειτουργία
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
    
    # Οικονομικοί Δείκτες
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
    annual_savings = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ετήσια εξοικονόμηση (€)',
        validators=[MinValueValidator(0)]
    )
    investment_return = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Απόδοση επένδυσης (%)',
        validators=[MinValueValidator(0)]
    )
    net_present_value = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Καθαρή παρούσα αξία - NPV (€)',
        help_text='Αυτόματος υπολογισμός NPV με προεξοφλητικό συντελεστή'
    )
    
    # Ενεργειακοί Δείκτες
    power_per_panel = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Ισχύς ανά πλαίσιο (W)',
        validators=[MinValueValidator(0)]
    )
    collector_efficiency = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Βαθμός απόδοσης συλλεκτών (%)',
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    installation_angle = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Κλίση τοποθέτησης (°)',
        validators=[MinValueValidator(0), MaxValueValidator(90)]
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
        # Ensure one photovoltaic system per building
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
        """Υπολογισμός ετήσιων εξοικονομήσεων βάσει της ετήσιας παραγωγής ενέργειας"""
        try:
            # Default electricity cost per kWh in Greece (approx €0.15/kWh)
            electricity_cost_per_kwh = Decimal('0.15')
            
            # Annual energy production in kWh
            annual_energy_kwh = float(self.annual_energy_production or 0)
            
            if annual_energy_kwh <= 0:
                return Decimal('0')
            
            # Calculate annual savings: energy production × electricity cost
            annual_savings = Decimal(str(annual_energy_kwh)) * electricity_cost_per_kwh
            
            return round(annual_savings, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def calculate_payback_period(self):
        """Υπολογισμός περιόδου απόσβεσης σε έτη"""
        try:
            # Use total_cost if net_cost is negative (subsidy > total cost)
            initial_investment = float(self.net_cost or 0)
            if initial_investment <= 0:
                initial_investment = float(self.total_cost or 0)
                
            annual_savings = float(self.annual_savings or 0)
            
            if initial_investment <= 0 or annual_savings <= 0:
                return Decimal('0')
            
            # Payback Period = Initial Investment / Annual Savings
            payback_years = initial_investment / annual_savings
            
            return round(Decimal(str(payback_years)), 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')
    
    def calculate_investment_return(self):
        """Υπολογισμός απόδοσης επένδυσης (ROI) ως ποσοστό"""
        try:
            # Use total_cost if net_cost is negative (subsidy > total cost)
            initial_investment = float(self.net_cost or 0)
            if initial_investment <= 0:
                initial_investment = float(self.total_cost or 0)
                
            annual_savings = float(self.annual_savings or 0)
            
            if initial_investment <= 0:
                return Decimal('0')
            
            # Investment Return = (Annual Savings / Initial Investment) × 100
            roi_percentage = (annual_savings / initial_investment) * 100
            
            return round(Decimal(str(roi_percentage)), 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return Decimal('0')

    def calculate_net_present_value(self):
        """Υπολογισμός της Καθαρής Παρούσας Αξίας (NPV)"""
        try:
            # Required values for NPV calculation
            initial_investment = float(self.net_cost or self.total_cost or 0)
            annual_savings = float(self.annual_savings or 0)
            project_lifetime_years = 25  # Typical PV system lifetime
            discount_rate = 0.05  # 5% default discount rate
            
            if initial_investment <= 0 or annual_savings <= 0:
                return 0
            
            # Calculate NPV: NPV = -Initial_Investment + Σ(Annual_Savings / (1 + discount_rate)^year)
            npv = -initial_investment
            for year in range(1, project_lifetime_years + 1):
                npv += annual_savings / ((1 + discount_rate) ** year)
            
            return round(npv, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            return 0
    
    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός οικονομικών δεικτών κατά την αποθήκευση"""
        # Υπολογισμός κόστους για κάθε κατηγορία εξοπλισμού
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
        
        # Υπολογισμός οικονομικών δεικτών
        self.estimated_cost = self.calculate_total_equipment_cost()
        self.unexpected_expenses = self.calculate_unexpected_expenses()
        self.value_after_unexpected = self.calculate_value_after_unexpected()
        self.tax_burden = self.calculate_tax_burden()
        self.total_cost = self.calculate_total_cost()
        
        # Υπολογισμός καθαρού κόστους (συνολικό κόστος - επιδότηση)
        if self.total_cost and self.subsidy_amount:
            self.net_cost = self.total_cost - self.subsidy_amount
        elif self.total_cost:
            self.net_cost = self.total_cost
        
        # Υπολογισμός ετήσιων εξοικονομήσεων
        self.annual_savings = self.calculate_annual_savings()
        
        # Υπολογισμός περιόδου απόσβεσης
        self.payback_period = self.calculate_payback_period()
        
        # Υπολογισμός απόδοσης επένδυσης
        self.investment_return = self.calculate_investment_return()
        
        # Υπολογισμός NPV
        self.net_present_value = self.calculate_net_present_value()
        
        super().save(*args, **kwargs)
