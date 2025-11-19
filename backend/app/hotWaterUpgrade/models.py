from django.db import models
from django.contrib.auth.models import User


class HotWaterUpgrade(models.Model):
    building = models.CharField(max_length=255)
    project = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    solar_collectors_quantity = models.IntegerField(default=0)
    solar_collectors_unit_price = models.FloatField(default=0.0)
    
    metal_support_bases_quantity = models.IntegerField(default=0)
    metal_support_bases_unit_price = models.FloatField(default=0.0)
    
    solar_system_quantity = models.IntegerField(default=1)
    solar_system_unit_price = models.FloatField(default=0.0)
    
    insulated_pipes_quantity = models.IntegerField(default=0)
    insulated_pipes_unit_price = models.FloatField(default=0.0)
    
    central_heater_installation_quantity = models.IntegerField(default=1)
    central_heater_installation_unit_price = models.FloatField(default=0.0)
    
    electric_heater_power = models.FloatField(default=0.0)
    operating_hours_per_year = models.FloatField(default=0.0)
    solar_utilization_percentage = models.FloatField(default=80.0)
    energy_cost_kwh = models.FloatField(default=0.0)
    lifespan_years = models.IntegerField(default=10)
    discount_rate = models.FloatField(default=5.0)
    annual_operating_expenses = models.FloatField(default=0.0)
    
    solar_collectors_subtotal = models.FloatField(default=0.0)
    metal_support_bases_subtotal = models.FloatField(default=0.0)
    solar_system_subtotal = models.FloatField(default=0.0)
    insulated_pipes_subtotal = models.FloatField(default=0.0)
    central_heater_installation_subtotal = models.FloatField(default=0.0)
    total_investment_cost = models.FloatField(default=0.0)
    
    annual_energy_consumption_kwh = models.FloatField(default=0.0)
    annual_solar_savings_kwh = models.FloatField(default=0.0)
    annual_economic_benefit = models.FloatField(default=0.0)
    payback_period = models.FloatField(default=0.0)
    net_present_value = models.FloatField(default=0.0)
    internal_rate_of_return = models.FloatField(default=0.0)

    class Meta:
        db_table = 'hot_water_upgrade'
        ordering = ['-created_at']
        verbose_name = "Αναβάθμιση Ζεστού Νερού"
        verbose_name_plural = "Αναβαθμίσεις Ζεστού Νερού"
        unique_together = [['building', 'project']]

    def save(self, *args, **kwargs):
        self.solar_collectors_subtotal = self.solar_collectors_quantity * self.solar_collectors_unit_price
        self.metal_support_bases_subtotal = self.metal_support_bases_quantity * self.metal_support_bases_unit_price
        self.solar_system_subtotal = self.solar_system_quantity * self.solar_system_unit_price
        self.insulated_pipes_subtotal = self.insulated_pipes_quantity * self.insulated_pipes_unit_price
        self.central_heater_installation_subtotal = self.central_heater_installation_quantity * self.central_heater_installation_unit_price
        
        self.total_investment_cost = (
            self.solar_collectors_subtotal +
            self.metal_support_bases_subtotal +
            self.solar_system_subtotal +
            self.insulated_pipes_subtotal +
            self.central_heater_installation_subtotal
        )
        
        self.annual_energy_consumption_kwh = (self.electric_heater_power * self.operating_hours_per_year) / 1000
        self.annual_solar_savings_kwh = self.annual_energy_consumption_kwh * (self.solar_utilization_percentage / 100)
        
        self.annual_economic_benefit = self.annual_solar_savings_kwh * self.energy_cost_kwh
        
        if self.annual_economic_benefit > 0:
            self.payback_period = self.total_investment_cost / self.annual_economic_benefit
        else:
            self.payback_period = 0
            
        discount_rate_decimal = self.discount_rate / 100.0
        if self.lifespan_years > 0 and self.annual_economic_benefit > 0:
            npv = 0
            for year in range(1, self.lifespan_years + 1):
                # Subtract annual operating expenses from the benefit
                net_annual_benefit = self.annual_economic_benefit - self.annual_operating_expenses
                npv += net_annual_benefit / ((1 + discount_rate_decimal) ** year)
            self.net_present_value = npv - self.total_investment_cost
        else:
            self.net_present_value = -self.total_investment_cost
            
        # Calculate IRR using Newton-Raphson method
        net_annual_benefit = self.annual_economic_benefit - self.annual_operating_expenses
        
        if self.total_investment_cost > 0 and net_annual_benefit > 0 and self.lifespan_years > 0:
            guess = 0.1  # Initial guess 10%
            max_iterations = 1000
            tolerance = 0.00001
            
            for i in range(max_iterations):
                npv_at_guess = -self.total_investment_cost
                derivative_npv = 0
                
                for year in range(1, self.lifespan_years + 1):
                    discount_factor = (1 + guess) ** year
                    npv_at_guess += net_annual_benefit / discount_factor
                    derivative_npv -= (year * net_annual_benefit) / ((1 + guess) ** (year + 1))
                
                # Check for convergence
                if abs(npv_at_guess) < tolerance:
                    self.internal_rate_of_return = guess * 100
                    break
                
                # Newton-Raphson update
                if abs(derivative_npv) > 0.000001:
                    guess = guess - npv_at_guess / derivative_npv
                else:
                    self.internal_rate_of_return = 0
                    break
                
                # Keep guess within reasonable bounds
                if guess < -0.99:
                    guess = -0.99
                if guess > 10:
                    guess = 10
            else:
                self.internal_rate_of_return = guess * 100 if guess > -0.99 else 0
        else:
            self.internal_rate_of_return = 0
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Hot Water Upgrade - Building: {self.building} - Total Cost: €{self.total_investment_cost:.2f}"
