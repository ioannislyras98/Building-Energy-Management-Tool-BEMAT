import uuid
from django.db import models
from django.conf import settings
from building.models import Building
from project.models import Project


class OldAirConditioning(models.Model):
    """Μοντέλο για παλαιό κλιματιστικό"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='old_air_conditionings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='old_air_conditionings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Χρήστης", null=True, blank=True)
    
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Χρήστης", null=True, blank=True)
    
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Χρήστης", null=True, blank=True)
    
    # Παράμετροι αξιολόγησης
    energy_cost_kwh = models.FloatField(default=0, null=True, blank=True, help_text="Κόστος ενέργειας (€/kWh) - Λαμβάνεται από το έργο")
    lifespan_years = models.IntegerField(default=20, help_text="Χρονικό διάστημα αξιολόγησης (έτη)")
    discount_rate = models.FloatField(default=5.0, help_text="Προεξοφλητικός συντελεστής (%)")
    
    # Υπολογιζόμενα αποτελέσματα
    total_old_consumption = models.FloatField(default=0, help_text="Συνολική παλαιά κατανάλωση kWh")
    total_new_consumption = models.FloatField(default=0, help_text="Συνολική νέα κατανάλωση kWh")
    energy_savings_kwh = models.FloatField(default=0, help_text="Ενεργειακή εξοικονόμηση kWh")
    total_investment_cost = models.FloatField(default=0, help_text="Συνολικό κόστος επένδυσης (€)")
    annual_energy_savings = models.FloatField(default=0, help_text="Ετήσια ενεργειακή εξοικονόμηση (€)")
    annual_economic_benefit = models.FloatField(default=0, help_text="Ετήσιο οικονομικό όφελος (€)")
    payback_period = models.FloatField(default=0, help_text="Περίοδος αποπληρωμής (έτη)")
    net_present_value = models.FloatField(default=0, help_text="Καθαρή παρούσα αξία (€)")
    internal_rate_of_return = models.FloatField(default=0, help_text="Εσωτερικός βαθμός απόδοσης (%)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'air_conditioning_analysis'
        verbose_name = 'Ανάλυση Κλιματιστικών'
        verbose_name_plural = 'Αναλύσεις Κλιματιστικών'
        unique_together = [['building', 'project', 'user']]

    def save(self, *args, **kwargs):
        """Αυτόματος υπολογισμός αποτελεσμάτων"""
        self.calculate_results()
        super().save(*args, **kwargs)

    def calculate_results(self):
        """Υπολογισμός όλων των αποτελεσμάτων"""
        # Υπολογισμός συνολικών καταναλώσεων
        if self.user:
            old_acs = OldAirConditioning.objects.filter(building=self.building, project=self.project, user=self.user)
            new_acs = NewAirConditioning.objects.filter(building=self.building, project=self.project, user=self.user)
        else:
            old_acs = OldAirConditioning.objects.filter(building=self.building, project=self.project)
            new_acs = NewAirConditioning.objects.filter(building=self.building, project=self.project)
        
        self.total_old_consumption = sum(ac.total_consumption_kwh for ac in old_acs)
        self.total_new_consumption = sum(ac.total_consumption_kwh for ac in new_acs)
        self.energy_savings_kwh = self.total_old_consumption - self.total_new_consumption
        
        # Υπολογισμός συνολικού κόστους επένδυσης
        self.total_investment_cost = sum(ac.total_cost for ac in new_acs)
        
        # Εάν δεν έχει οριστεί τιμή ενέργειας, πάρτη από το έργο
        if not self.energy_cost_kwh and self.project:
            self.energy_cost_kwh = float(self.project.cost_per_kwh_electricity or 0)
        
        # Υπολογισμός ετήσιας ενεργειακής εξοικονόμησης
        if self.energy_savings_kwh > 0 and self.energy_cost_kwh > 0:
            self.annual_energy_savings = self.energy_savings_kwh * self.energy_cost_kwh
        
        # Ετήσιο οικονομικό όφελος = Ετήσια ενεργειακή εξοικονόμηση (χωρίς αφαίρεση συντήρησης)
        self.annual_economic_benefit = self.annual_energy_savings
        
        # Υπολογισμός περιόδου αποπληρωμής
        if self.annual_economic_benefit > 0 and self.total_investment_cost > 0:
            self.payback_period = self.total_investment_cost / self.annual_economic_benefit
        
        # Υπολογισμός NPV
        if self.annual_economic_benefit > 0:
            discount_rate_decimal = self.discount_rate / 100
            pv_savings = 0
            
            if discount_rate_decimal > 0:
                # NPV = Σ[Annual_Benefit / (1 + r)^t] - Initial_Investment
                for year in range(1, self.lifespan_years + 1):
                    pv_savings += self.annual_economic_benefit / ((1 + discount_rate_decimal) ** year)
            else:
                # Αν δεν υπάρχει προεξοφλητικός συντελεστής
                pv_savings = self.annual_economic_benefit * self.lifespan_years
            
            self.net_present_value = pv_savings - self.total_investment_cost
        
        # Calculate IRR using Newton-Raphson method
        if self.total_investment_cost > 0 and self.annual_economic_benefit > 0 and self.lifespan_years > 0:
            guess = 0.1  # Initial guess 10%
            max_iterations = 1000
            tolerance = 0.00001
            
            for i in range(max_iterations):
                npv_at_guess = -self.total_investment_cost
                derivative_npv = 0
                
                for year in range(1, self.lifespan_years + 1):
                    discount_factor = (1 + guess) ** year
                    npv_at_guess += self.annual_economic_benefit / discount_factor
                    derivative_npv -= (year * self.annual_economic_benefit) / ((1 + guess) ** (year + 1))
                
                if abs(npv_at_guess) < tolerance:
                    self.internal_rate_of_return = guess * 100
                    break
                
                if abs(derivative_npv) > 0.000001:
                    guess = guess - npv_at_guess / derivative_npv
                else:
                    self.internal_rate_of_return = 0
                    break
                
                if guess < -0.99:
                    guess = -0.99
                if guess > 10:
                    guess = 10
            else:
                self.internal_rate_of_return = guess * 100 if guess > -0.99 else 0
        else:
            self.internal_rate_of_return = 0

    def __str__(self):
        return f"Ανάλυση Κλιματιστικών - {self.building.name}"
