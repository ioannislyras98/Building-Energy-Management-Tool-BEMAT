import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from building.models import Building
from project.models import Project


class NaturalGasNetwork(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='natural_gas_networks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='natural_gas_networks', null=True, blank=True)
    
    burner_replacement_quantity = models.FloatField(default=2, help_text="Quantity of burner replacements")
    burner_replacement_unit_price = models.FloatField(default=1800.0, help_text="Unit price for burner replacement (€)")
    
    gas_pipes_quantity = models.FloatField(default=1, help_text="Quantity of gas pipes")
    gas_pipes_unit_price = models.FloatField(default=700.0, help_text="Unit price for gas pipes (€)")
    
    gas_detection_systems_quantity = models.FloatField(default=7, help_text="Quantity of gas detection systems")
    gas_detection_systems_unit_price = models.FloatField(default=200.0, help_text="Unit price for gas detection systems (€)")
    
    boiler_cleaning_quantity = models.FloatField(default=1, help_text="Quantity of boiler cleaning services")
    boiler_cleaning_unit_price = models.FloatField(default=364.0, help_text="Unit price for boiler cleaning (€)")
    
    current_energy_cost_per_year = models.FloatField(null=True, blank=True, help_text="Annual heating oil energy cost (€)")
    natural_gas_cost_per_year = models.FloatField(null=True, blank=True, help_text="Annual natural gas cost (€)")
    annual_energy_savings = models.FloatField(null=True, blank=True, help_text="Annual energy savings (€)")
    lifespan_years = models.IntegerField(default=15, help_text="Project lifespan in years")
    discount_rate = models.FloatField(default=5.0, help_text="Discount rate (%)")
    annual_operating_expenses = models.FloatField(default=0.0, help_text="Annual operating expenses (€)")
    
    new_system_efficiency = models.FloatField(default=0.90, help_text="Efficiency of new natural gas system (0.0-1.0)", validators=[MinValueValidator(0.1), MaxValueValidator(1.0)])
    natural_gas_price_per_kwh = models.FloatField(null=True, blank=True, help_text="Natural gas price per kWh (€/kWh)")
    
    burner_replacement_subtotal = models.FloatField(default=0.0, help_text="Burner replacement subtotal (€)")
    gas_pipes_subtotal = models.FloatField(default=0.0, help_text="Gas pipes subtotal (€)")
    gas_detection_systems_subtotal = models.FloatField(default=0.0, help_text="Gas detection systems subtotal (€)")
    boiler_cleaning_subtotal = models.FloatField(default=0.0, help_text="Boiler cleaning subtotal (€)")
    total_investment_cost = models.FloatField(default=0.0, help_text="Total investment cost (€)")
    annual_economic_benefit = models.FloatField(default=0.0, help_text="Annual economic benefit (€)")
    payback_period = models.FloatField(default=0.0, help_text="Payback period (years)")
    discounted_payback_period = models.FloatField(default=0.0, help_text="Discounted payback period (years)")
    net_present_value = models.FloatField(default=0.0, help_text="Net Present Value (€)")
    internal_rate_of_return = models.FloatField(default=0.0, help_text="Internal Rate of Return (%)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'natural_gas_network'
        verbose_name = "Δίκτυο Φυσικού Αερίου"
        verbose_name_plural = "Δίκτυα Φυσικού Αερίου"
        unique_together = [['building', 'project']]
        verbose_name = 'Natural Gas Network'
        verbose_name_plural = 'Natural Gas Networks'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Natural Gas Network for {self.building.name if self.building else 'Unknown Building'} - Total Cost: €{self.total_investment_cost:.2f}"
    
    def _calculate_natural_gas_cost(self):
        """
        Calculate natural gas cost per year using formula:
        1. Get kWh from heating oil only
        2. Apply new system efficiency
        3. Convert kWh to m³ (1 m³ = 10 kWh)
        4. Multiply by natural gas price per m³
        """
        try:
            from energyConsumption.models import EnergyConsumption
            
            # Παίρνουμε μόνο το πετρέλαιο θέρμανσης
            heating_consumptions = EnergyConsumption.objects.filter(
                building=self.building,
                energy_source='heating_oil'
            )
            
            if not heating_consumptions.exists():
                return
            
            total_thermal_kwh = 0
            for consumption in heating_consumptions:
                kwh_equivalent = float(consumption.kwh_equivalent or 0)
                total_thermal_kwh += kwh_equivalent
            
            if total_thermal_kwh == 0:
                return
            
            # Τιμή φυσικού αερίου ανά m³
            gas_price_per_m3 = self.natural_gas_price_per_kwh
            if not gas_price_per_m3:
                if self.project and self.project.natural_gas_price_per_m3:
                    gas_price_per_m3 = float(self.project.natural_gas_price_per_m3)
                elif self.building.project and self.building.project.natural_gas_price_per_m3:
                    gas_price_per_m3 = float(self.building.project.natural_gas_price_per_m3)
                else:
                    gas_price_per_m3 = 1.0  # Προεπιλογή σε €/m³

            # Εφαρμογή απόδοσης νέου συστήματος
            efficiency = self.new_system_efficiency or 0.90
            natural_gas_consumption_kwh = total_thermal_kwh / efficiency
            
            # Μετατροπή kWh σε m³ (1 m³ = 10 kWh)
            natural_gas_consumption_m3 = natural_gas_consumption_kwh / 10.0
            
            # Υπολογισμός κόστους: m³ × τιμή/m³ (στρογγυλοποιημένο σε 2 δεκαδικά)
            self.natural_gas_cost_per_year = round(natural_gas_consumption_m3 * gas_price_per_m3, 2)
            
        except Exception as e:
            pass
    
    def save(self, *args, **kwargs):
        # Ενημέρωση τιμής φυσικού αερίου από το Project
        project = self.project or (self.building.project if self.building else None)
        if project and project.natural_gas_price_per_m3:
            self.natural_gas_price_per_kwh = float(project.natural_gas_price_per_m3)
        
        # Επαναϋπολογισμός τρέχοντος κόστους πετρελαίου
        if self.building:
            from energyConsumption.models import EnergyConsumption
            
            energy_consumptions = EnergyConsumption.objects.filter(
                building=self.building,
                energy_source='heating_oil'
            )
            
            if energy_consumptions.exists():
                total_annual_cost = 0
                oil_price_per_liter = 1.0
                
                if project and project.oil_price_per_liter:
                    oil_price_per_liter = float(project.oil_price_per_liter)
                
                for consumption in energy_consumptions:
                    liters = float(consumption.quantity or 0)
                    total_annual_cost += liters * oil_price_per_liter
                
                self.current_energy_cost_per_year = round(total_annual_cost, 2)
        
        # Επαναϋπολογισμός κόστους φυσικού αερίου (πάντα)
        if self.building:
            self._calculate_natural_gas_cost()
        
        self.burner_replacement_subtotal = self.burner_replacement_quantity * self.burner_replacement_unit_price
        self.gas_pipes_subtotal = self.gas_pipes_quantity * self.gas_pipes_unit_price
        self.gas_detection_systems_subtotal = self.gas_detection_systems_quantity * self.gas_detection_systems_unit_price
        self.boiler_cleaning_subtotal = self.boiler_cleaning_quantity * self.boiler_cleaning_unit_price
        
        self.total_investment_cost = (
            self.burner_replacement_subtotal + 
            self.gas_pipes_subtotal + 
            self.gas_detection_systems_subtotal + 
            self.boiler_cleaning_subtotal
        )
        
        # Υπολογισμός εξοικονόμησης
        if self.current_energy_cost_per_year and self.natural_gas_cost_per_year:
            savings = self.current_energy_cost_per_year - self.natural_gas_cost_per_year
            self.annual_energy_savings = round(savings, 2)
        elif self.annual_energy_savings:
            savings = self.annual_energy_savings
        else:
            savings = 0.0
        
        operating_expenses = float(self.annual_operating_expenses or 0)
        self.annual_economic_benefit = round(savings - operating_expenses, 2)
        
        if self.annual_economic_benefit > 0 and self.total_investment_cost > 0:
            self.payback_period = round(self.total_investment_cost / self.annual_economic_benefit, 2)
        else:
            self.payback_period = 0.0
        
        discount_rate_decimal = float(self.discount_rate or 5) / 100.0
        years = self.lifespan_years
        npv = 0.0
        cumulative_discounted_cash_flow = 0.0
        self.discounted_payback_period = years + 1  # Default: δεν αποπληρώνεται
        
        if self.annual_economic_benefit > 0:
            for year in range(1, years + 1):
                discounted_cash_flow = self.annual_economic_benefit / ((1 + discount_rate_decimal) ** year)
                cumulative_discounted_cash_flow += discounted_cash_flow
                npv += discounted_cash_flow
                
                # Έλεγχος αν έχει αποπληρωθεί η επένδυση
                if cumulative_discounted_cash_flow >= self.total_investment_cost and self.discounted_payback_period > years:
                    previous_cumulative = cumulative_discounted_cash_flow - discounted_cash_flow
                    fraction_of_year = (self.total_investment_cost - previous_cumulative) / discounted_cash_flow
                    self.discounted_payback_period = (year - 1) + fraction_of_year
                    
            npv -= self.total_investment_cost
        else:
            npv = -self.total_investment_cost
            self.discounted_payback_period = 0
        
        self.net_present_value = round(npv, 2)
        
        # IRR υπολογισμός με Newton-Raphson
        if self.total_investment_cost > 0 and self.annual_economic_benefit > 0:
            initial_investment = float(self.total_investment_cost)
            annual_benefit = float(self.annual_economic_benefit)
            years = int(self.lifespan_years)
            
            # Έλεγχος αν το συνολικό όφελος υπερβαίνει την επένδυση
            total_benefit = annual_benefit * years
            if total_benefit <= initial_investment:
                # Αν το συνολικό όφελος δεν καλύπτει την επένδυση, IRR είναι αρνητικό
                self.internal_rate_of_return = -100.0
            else:
                # Αρχική εκτίμηση IRR βασισμένη στο απλό ROI
                simple_roi = annual_benefit / initial_investment
                irr = simple_roi * 0.8  # Πιο συντηρητική αρχική εκτίμηση
                
                tolerance = 0.00001
                max_iterations = 1000
                
                for iteration in range(max_iterations):
                    # Υπολογισμός NPV με το τρέχον IRR
                    npv_calc = -initial_investment
                    npv_derivative = 0
                    
                    for year in range(1, years + 1):
                        factor = (1 + irr) ** year
                        npv_calc += annual_benefit / factor
                        npv_derivative -= year * annual_benefit / (factor * (1 + irr))
                    
                    # Έλεγχος σύγκλισης
                    if abs(npv_calc) < tolerance:
                        break
                    
                    # Newton-Raphson update
                    if abs(npv_derivative) > 0.000001:
                        delta = npv_calc / npv_derivative
                        irr = irr - delta
                        
                        # Όρια για σταθερότητα
                        if irr < -0.99:
                            irr = -0.99
                        elif irr > 10.0:  # 1000% ως ανώτατο όριο
                            irr = 10.0
                    else:
                        break
                
                self.internal_rate_of_return = round(irr * 100, 2)
        else:
            self.internal_rate_of_return = 0.0
        
        super().save(*args, **kwargs)
