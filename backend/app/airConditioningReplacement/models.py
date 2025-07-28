import uuid
from django.db import models
from building.models import Building
from project.models import Project


class OldAirConditioning(models.Model):
    """Μοντέλο για παλαιό κλιματιστικό"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='old_air_conditionings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='old_air_conditionings')
    
    # Στοιχεία παλαιού κλιματιστικού
    btu_type = models.IntegerField(help_text="Τύπος σε BTU")
    cop_percentage = models.FloatField(help_text="Συντελεστής απόδοσης θέρμανσης (COP) %")
    eer_percentage = models.FloatField(help_text="Συντελεστής απόδοσης ψύξης (EER) %")
    heating_hours_per_year = models.IntegerField(help_text="Ώρες λειτουργίας θέρμανσης ανά έτος")
    cooling_hours_per_year = models.IntegerField(help_text="Ώρες λειτουργίας ψύξης ανά έτος")
    quantity = models.IntegerField(help_text="Πλήθος κλιματιστικών")
    
    # Υπολογιζόμενα πεδία
    heating_consumption_kwh = models.FloatField(default=0, help_text="Κατανάλωση θέρμανσης kWh")
    cooling_consumption_kwh = models.FloatField(default=0, help_text="Κατανάλωση ψύξης kWh")
    total_consumption_kwh = models.FloatField(default=0, help_text="Συνολική κατανάλωση kWh")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'old_air_conditioning'
        verbose_name = 'Παλαιό Κλιματιστικό'
        verbose_name_plural = 'Παλαιά Κλιματιστικά'

    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός κατανάλωσης"""
        self.calculate_consumption()
        super().save(*args, **kwargs)

    def calculate_consumption(self):
        """Υπολογισμός κατανάλωσης ενέργειας"""
        if self.btu_type and self.cop_percentage and self.eer_percentage:
            # Μετατροπή BTU σε Watts (1 BTU/hr ≈ 0.293 Watts)
            watts = self.btu_type * 0.293
            
            # Υπολογισμός κατανάλωσης θέρμανσης
            if self.cop_percentage > 0:
                heating_power_consumption = watts / (self.cop_percentage / 100)
                self.heating_consumption_kwh = (heating_power_consumption * self.heating_hours_per_year * self.quantity) / 1000
            
            # Υπολογισμός κατανάλωσης ψύξης
            if self.eer_percentage > 0:
                cooling_power_consumption = watts / (self.eer_percentage / 100)
                self.cooling_consumption_kwh = (cooling_power_consumption * self.cooling_hours_per_year * self.quantity) / 1000
            
            # Συνολική κατανάλωση
            self.total_consumption_kwh = self.heating_consumption_kwh + self.cooling_consumption_kwh

    def __str__(self):
        return f"Παλαιό Κλιματιστικό {self.btu_type} BTU - {self.building.name}"


class NewAirConditioning(models.Model):
    """Μοντέλο για νέο κλιματιστικό"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='new_air_conditionings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='new_air_conditionings')
    
    # Στοιχεία νέου κλιματιστικού
    btu_type = models.IntegerField(help_text="Τύπος σε BTU")
    cop_percentage = models.FloatField(help_text="Συντελεστής απόδοσης θέρμανσης (COP) %")
    eer_percentage = models.FloatField(help_text="Συντελεστής απόδοσης ψύξης (EER) %")
    heating_hours_per_year = models.IntegerField(help_text="Ώρες λειτουργίας θέρμανσης ανά έτος")
    cooling_hours_per_year = models.IntegerField(help_text="Ώρες λειτουργίας ψύξης ανά έτος")
    quantity = models.IntegerField(help_text="Πλήθος κλιματιστικών")
    
    # Οικονομικά στοιχεία
    cost_per_unit = models.FloatField(default=0, help_text="Κόστος ανά μονάδα (€)")
    installation_cost = models.FloatField(default=0, help_text="Κόστος εγκατάστασης (€)")
    
    # Υπολογιζόμενα πεδία
    heating_consumption_kwh = models.FloatField(default=0, help_text="Κατανάλωση θέρμανσης kWh")
    cooling_consumption_kwh = models.FloatField(default=0, help_text="Κατανάλωση ψύξης kWh")
    total_consumption_kwh = models.FloatField(default=0, help_text="Συνολική κατανάλωση kWh")
    total_cost = models.FloatField(default=0, help_text="Συνολικό κόστος (€)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'new_air_conditioning'
        verbose_name = 'Νέο Κλιματιστικό'
        verbose_name_plural = 'Νέα Κλιματιστικά'

    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός κατανάλωσης και κόστους"""
        self.calculate_consumption()
        self.calculate_cost()
        super().save(*args, **kwargs)

    def calculate_consumption(self):
        """Υπολογισμός κατανάλωσης ενέργειας"""
        if self.btu_type and self.cop_percentage and self.eer_percentage:
            # Μετατροπή BTU σε Watts (1 BTU/hr ≈ 0.293 Watts)
            watts = self.btu_type * 0.293
            
            # Υπολογισμός κατανάλωσης θέρμανσης
            if self.cop_percentage > 0:
                heating_power_consumption = watts / (self.cop_percentage / 100)
                self.heating_consumption_kwh = (heating_power_consumption * self.heating_hours_per_year * self.quantity) / 1000
            
            # Υπολογισμός κατανάλωσης ψύξης
            if self.eer_percentage > 0:
                cooling_power_consumption = watts / (self.eer_percentage / 100)
                self.cooling_consumption_kwh = (cooling_power_consumption * self.cooling_hours_per_year * self.quantity) / 1000
            
            # Συνολική κατανάλωση
            self.total_consumption_kwh = self.heating_consumption_kwh + self.cooling_consumption_kwh

    def calculate_cost(self):
        """Υπολογισμός συνολικού κόστους"""
        unit_cost = self.cost_per_unit * self.quantity
        self.total_cost = unit_cost + self.installation_cost

    def __str__(self):
        return f"Νέο Κλιματιστικό {self.btu_type} BTU - {self.building.name}"


class AirConditioningAnalysis(models.Model):
    """Μοντέλο για ανάλυση αντικατάστασης κλιματιστικών"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='ac_analyses')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ac_analyses')
    
    # Οικονομικά στοιχεία
    energy_cost_kwh = models.FloatField(default=0, help_text="Κόστος ενέργειας (€/kWh)")
    maintenance_cost_annual = models.FloatField(default=0, help_text="Ετήσιο κόστος συντήρησης (€)")
    lifespan_years = models.IntegerField(default=15, help_text="Διάρκεια ζωής (έτη)")
    discount_rate = models.FloatField(default=5.0, help_text="Επιτόκιο αναγωγής (%)")
    
    # Υπολογιζόμενα αποτελέσματα
    total_old_consumption = models.FloatField(default=0, help_text="Συνολική παλαιά κατανάλωση kWh")
    total_new_consumption = models.FloatField(default=0, help_text="Συνολική νέα κατανάλωση kWh")
    energy_savings_kwh = models.FloatField(default=0, help_text="Ενεργειακή εξοικονόμηση kWh")
    total_investment_cost = models.FloatField(default=0, help_text="Συνολικό κόστος επένδυσης (€)")
    annual_cost_savings = models.FloatField(default=0, help_text="Ετήσια οικονομική εξοικονόμηση (€)")
    payback_period = models.FloatField(default=0, help_text="Περίοδος αποπληρωμής (έτη)")
    net_present_value = models.FloatField(default=0, help_text="Καθαρή παρούσα αξία (€)")
    internal_rate_of_return = models.FloatField(default=0, help_text="Εσωτερικός βαθμός απόδοσης (%)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'air_conditioning_analysis'
        verbose_name = 'Ανάλυση Κλιματιστικών'
        verbose_name_plural = 'Αναλύσεις Κλιματιστικών'

    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός αποτελεσμάτων"""
        self.calculate_results()
        super().save(*args, **kwargs)

    def calculate_results(self):
        """Υπολογισμός όλων των αποτελεσμάτων"""
        # Υπολογισμός συνολικών καταναλώσεων
        old_acs = OldAirConditioning.objects.filter(building=self.building, project=self.project)
        new_acs = NewAirConditioning.objects.filter(building=self.building, project=self.project)
        
        self.total_old_consumption = sum(ac.total_consumption_kwh for ac in old_acs)
        self.total_new_consumption = sum(ac.total_consumption_kwh for ac in new_acs)
        self.energy_savings_kwh = self.total_old_consumption - self.total_new_consumption
        
        # Υπολογισμός συνολικού κόστους επένδυσης
        self.total_investment_cost = sum(ac.total_cost for ac in new_acs)
        
        # Υπολογισμός ετήσιων οικονομικών εξοικονομήσεων
        if self.energy_savings_kwh > 0 and self.energy_cost_kwh > 0:
            self.annual_cost_savings = self.energy_savings_kwh * self.energy_cost_kwh
        
        # Υπολογισμός περιόδου αποπληρωμής
        if self.annual_cost_savings > 0 and self.total_investment_cost > 0:
            self.payback_period = self.total_investment_cost / self.annual_cost_savings
        
        # Υπολογισμός NPV
        if self.annual_cost_savings > 0:
            discount_rate_decimal = self.discount_rate / 100
            pv_savings = 0
            
            for year in range(1, self.lifespan_years + 1):
                annual_net_savings = self.annual_cost_savings - self.maintenance_cost_annual
                pv_savings += annual_net_savings / ((1 + discount_rate_decimal) ** year)
            
            self.net_present_value = pv_savings - self.total_investment_cost
        
        # Υπολογισμός IRR (απλοποιημένος)
        if self.total_investment_cost > 0:
            self.internal_rate_of_return = (self.annual_cost_savings / self.total_investment_cost) * 100

    def __str__(self):
        return f"Ανάλυση Κλιματιστικών - {self.building.name}"
