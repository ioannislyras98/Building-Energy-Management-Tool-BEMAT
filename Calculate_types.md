# Τύποι Υπολογισμών στο BEMAT (Building Energy Management Tool)

Αυτό το έγγραφο περιγράφει όλους τους τύπους υπολογισμών που υποστηρίζονται στο εργαλείο διαχείρισης ενέργειας κτιρίων BEMAT.

## 1. Θερμομόνωση Εξωτερικής Τοιχοποιίας

### Περιγραφή

Υπολογισμός οφελών από την εγκατάσταση ή αναβάθμιση θερμομόνωσης στους εξωτερικούς τοίχους κτιρίου.

### Μαθηματικοί Τύποι

#### Θερμικές Απώλειες

- **Απώλειες πριν τη θερμομόνωση**: `Q_before = U_before × A × ΔΤ × t`
- **Απώλειες μετά τη θερμομόνωση**: `Q_after = U_after × A × ΔΤ × t`
- **Εξοικονόμηση ενέργειας**: `Energy_savings = Q_before - Q_after`

Όπου:

- `U_before/after`: Συντελεστής θερμοπερατότητας πριν/μετά (W/m²K)
- `A`: Επιφάνεια τοίχου (m²)
- `ΔΤ`: Διαφορά θερμοκρασίας (°C)
- `t`: Χρόνος (h)

#### Οικονομικοί Δείκτες

- **Συνολικό κόστος**: `Total_cost = Material_cost + Installation_cost`
- **Ετήσια εξοικονόμηση**: `Annual_savings = Energy_savings × Energy_cost`
- **Περίοδος αποπληρωμής**: `Payback = Total_cost / Annual_savings`
- **NPV**: `NPV = Σ(Annual_savings / (1+r)^t) - Total_cost`

### Υλοποίηση

- **Backend**: `thermalInsulation/models.py`
- **Frontend**: `ThermalInsulationTabContent.jsx`
- **API Endpoints**: `/thermal_insulations/`

---

## 2. Θερμομόνωση Οροφής

### Περιγραφή

Υπολογισμός οφελών από την εγκατάσταση ή αναβάθμιση θερμομόνωσης στην οροφή κτιρίου.

### Μαθηματικοί Τύποι

Οι τύποι είναι όμοιοι με την εξωτερική θερμομόνωση, αλλά με διαφορετικούς συντελεστές για την οροφή.

### Υλοποίηση

- **Backend**: `roofThermalInsulation/models.py`
- **Frontend**: `RoofThermalInsulationTabContent.jsx`
- **API Endpoints**: `/roof_thermal_insulations/`

---

## 3. Φωτοβολταϊκά Συστήματα

### Περιγραφή

Υπολογισμός οικονομικών και ενεργειακών οφελών από την εγκατάσταση φωτοβολταϊκών συστημάτων.

### Μαθηματικοί Τύποι

#### Ενεργειακή Παραγωγή

- **Ετήσια παραγωγή**: `Annual_production = Panel_power × Peak_hours × Days × Efficiency`
- **Εξοικονόμηση CO₂**: `CO2_savings = Annual_production × CO2_factor`

#### Οικονομικοί Υπολογισμοί

- **Εξοικονόμηση από αυτοκατανάλωση**: `Self_consumption_savings = Self_consumption × Energy_price`
- **Έσοδα από πώληση**: `Feed_in_revenue = Excess_production × Feed_in_tariff`
- **Συνολικά ετήσια οφέλη**: `Total_annual_benefits = Self_consumption_savings + Feed_in_revenue`

### Υλοποίηση

- **Backend**: `photovoltaicSystem/models.py`
- **Frontend**: `PhotovoltaicSystemTabContent.jsx`
- **API Endpoints**: `/photovoltaic_systems/`

---

## 4. Αντικατάσταση Παλαιών Υαλοπινάκων

### Περιγραφή

Υπολογισμός οφελών από την αντικατάσταση παλαιών υαλοπινάκων με νέους ενεργειακά αποδοτικούς.

### Μαθηματικοί Τύποι

#### Θερμικές Απώλειες

- **Απώλειες παλαιών υαλοπινάκων**: `Q_old = U_old × A_windows × ΔΤ × t`
- **Απώλειες νέων υαλοπινάκων**: `Q_new = U_new × A_windows × ΔΤ × t`
- **Εξοικονόμηση**: `Energy_savings = Q_old - Q_new`

#### Οικονομικοί Δείκτες

- **Κόστος αντικατάστασης**: `Total_cost = Window_area × Cost_per_m2`
- **Ετήσια εξοικονόμηση**: `Annual_savings = Energy_savings × Energy_cost`

### Υλοποίηση

- **Backend**: `windowReplacement/models.py`
- **Frontend**: `WindowReplacementTabContent.jsx`
- **API Endpoints**: `/window_replacements/`

---

## 5. Αντικατάσταση Λαμπτήρων Πυράκτωσης

### Περιγραφή

Υπολογισμός οφελών από την αντικατάσταση λαμπτήρων πυράκτωσης με LED.

### Μαθηματικοί Τύποι

#### Κατανάλωση Ενέργειας

- **Παλαιά κατανάλωση**: `Old_consumption = (Old_power × Old_count × Operating_hours) / 1000`
- **Νέα κατανάλωση**: `New_consumption = (New_power × New_count × Operating_hours) / 1000`
- **Εξοικονόμηση**: `Energy_savings = Old_consumption - New_consumption`

#### Οικονομικοί Υπολογισμοί

- **Κόστος επένδυσης**: `Investment_cost = New_count × Cost_per_bulb + Installation_cost`
- **Ετήσια εξοικονόμηση**: `Annual_savings = Energy_savings × Energy_cost_kwh`
- **Περίοδος αποπληρωμής**: `Payback_period = Investment_cost / Annual_savings`

### Υλοποίηση

- **Backend**: `bulbReplacement/models.py`
- **Frontend**: `BulbReplacementTabContent.jsx`
- **API Endpoints**: `/bulb_replacements/`

---

## 6. Αντικατάσταση Κλιματιστικών

### Περιγραφή

Υπολογισμός οφελών από την αντικατάσταση παλαιών κλιματιστικών με νέα ενεργειακά αποδοτικά.

### Μαθηματικοί Τύποι

#### Κατανάλωση Ενέργειας

- **Ισχύς σε Watts**: `Power_watts = BTU × 0.293`
- **Κατανάλωση θέρμανσης**: `Heating_consumption = (Power_watts / (COP/100)) × Heating_hours × Quantity / 1000`
- **Κατανάλωση ψύξης**: `Cooling_consumption = (Power_watts / (EER/100)) × Cooling_hours × Quantity / 1000`
- **Συνολική κατανάλωση**: `Total_consumption = Heating_consumption + Cooling_consumption`

#### Οικονομικοί Υπολογισμοί

- **Συνολικό κόστος**: `Total_cost = Quantity × Cost_per_unit + Installation_cost`
- **Ενεργειακή εξοικονόμηση**: `Energy_savings = Old_total_consumption - New_total_consumption`
- **Ετήσια εξοικονόμηση**: `Annual_savings = Energy_savings × Energy_cost_kwh`

#### Οικονομικοί Δείκτες

- **NPV**: `NPV = Σ((Annual_savings - Maintenance_cost) / (1+r)^t) - Total_cost`
- **IRR**: `IRR = (Annual_savings / Total_cost) × 100`
- **Περίοδος αποπληρωμής**: `Payback = Total_cost / Annual_savings`

### Υλοποίηση

- **Backend**: `airConditioningReplacement/models.py`
- **Frontend**: `AirConditioningReplacementTabContent.jsx`
- **API Endpoints**: `/air_conditioning_replacements/`

### Χαρακτηριστικά

- **Δύο ξεχωριστά tables**: Ένα για παλαιά και ένα για νέα κλιματιστικά
- **Modal dialogs**: Για προσθήκη/επεξεργασία κλιματιστικών
- **BTU επιλογές**: 7000, 9000, 10000, 12000, 15000, 18000, 24000, 30000, 36000
- **Αυτόματοι υπολογισμοί**: Κατανάλωση και κόστος υπολογίζονται αυτόματα

---

## 7. Κατανάλωση Ενέργειας

### Περιγραφή

Καταγραφή και ανάλυση ενεργειακής κατανάλωσης κτιρίου.

### Μαθηματικοί Τύποι

- **Μηνιαία κατανάλωση**: Άμεση καταγραφή από μετρητές
- **Ετήσια κατανάλωση**: `Annual_consumption = Σ(Monthly_consumption)`
- **Μέσος όρος κατανάλωσης**: `Average = Total_consumption / Number_of_months`

### Υλοποίηση

- **Backend**: `energyConsumption/models.py`
- **Frontend**: `EnergyConsumptionTabContent.jsx`
- **API Endpoints**: `/energy_consumptions/`

---

