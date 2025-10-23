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
            
        discount_rate = 0.05
        if self.lifespan_years > 0 and self.annual_economic_benefit > 0:
            npv = 0
            for year in range(1, self.lifespan_years + 1):
                npv += self.annual_economic_benefit / ((1 + discount_rate) ** year)
            self.net_present_value = npv - self.total_investment_cost
        else:
            self.net_present_value = -self.total_investment_cost
            
        if self.total_investment_cost > 0:
            self.internal_rate_of_return = (self.annual_economic_benefit / self.total_investment_cost) * 100
        else:
            self.internal_rate_of_return = 0
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Hot Water Upgrade - Building: {self.building} - Total Cost: €{self.total_investment_cost:.2f}"
