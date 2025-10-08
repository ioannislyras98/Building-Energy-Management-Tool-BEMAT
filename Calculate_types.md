# Τύποι Υπολογισμών - Building Energy Management Tool (BEMAT)

## Περιεχόμενα

Το σύστημα BEMAT υποστηρίζει υπολογισμούς για **13 κατηγορίες** ενεργειακών επεμβάσεων:

1. **Θερμομόνωση Εξωτερικής Τοιχοποιίας**
2. **Θερμομόνωση Οροφής**
3. **Φωτοβολταϊκά Συστήματα**
4. **Αντικατάσταση Παλαιών Υαλοπινάκων**
5. **Αντικατάσταση Λαμπτήρων Πυράκτωσης**
6. **Αντικατάσταση Κλιματιστικών**
7. **Κατανάλωση Ενέργειας**
8. **Εγκατάσταση Δικτύου Φυσικού Αερίου**
9. **Αντικατάσταση Λέβητα**
10. **Αυτόματος Έλεγχος Φωτισμού**
11. **Εξωτερικές Περσίδες**
12. **Αναβάθμιση Συστήματος Ζεστού Νερού Χρήσης**
13. **Ηλιακοί Συλλέκτες**

---

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

## 8. Εγκατάσταση Δικτύου Φυσικού Αερίου

### Περιγραφή

Υπολογισμός οφελών και κόστους από την εγκατάσταση δικτύου φυσικού αερίου σε κτίριο που χρησιμοποιεί άλλες πηγές ενέργειας για θέρμανση.

### Μαθηματικοί Τύποι

#### Υπολογισμός Τρέχοντος Ετήσιου Κόστους Ενέργειας

**Αυτόματος υπολογισμός από Energy Consumptions:**

```
Current_annual_cost = Σ(Consumption_i × Cost_rate_i)
```

Όπου:

- `Consumption_i`: kWh ισοδύναμο κατανάλωσης για κάθε πηγή ενέργειας
- `Cost_rate_i`: Κόστος ανά kWh για κάθε πηγή (electricity ή fuel)

#### Υπολογισμός Ετήσιου Κόστους Φυσικού Αερίου

**Φόρμουλα υπολογισμού:**

```
Natural_gas_annual_cost = (Thermal_requirement ÷ New_system_efficiency) × Natural_gas_price_per_kwh
```

Όπου:

- `Thermal_requirement`: Θερμική απαίτηση από Energy Consumptions (μη-ηλεκτρικές πηγές)
- `New_system_efficiency`: Απόδοση νέου συστήματος φυσικού αερίου (0.1-1.0, default: 0.90)
- `Natural_gas_price_per_kwh`: Τιμή φυσικού αερίου ανά kWh (€/kWh)

#### Στοιχεία Συστήματος

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = Burner_replacement_cost + Gas_pipes_cost +
                       Gas_detection_systems_cost + Boiler_cleaning_cost
```

Όπου κάθε κόστος υπολογίζεται ως: `Quantity × Unit_price`

#### Οικονομικοί Δείκτες

**Ετήσια ενεργειακή εξοικονόμηση:**

```
Annual_energy_savings = Current_energy_cost_per_year - Natural_gas_cost_per_year
```

**Ετήσιο οικονομικό όφελος:**

```
Annual_economic_benefit = Annual_energy_savings
```

**Περίοδος αποπληρωμής:**

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
```

**Καθαρή Παρούσα Αξία (NPV):**

```
NPV = Σ(Annual_economic_benefit ÷ (1 + discount_rate)^year) - Total_investment_cost
```

**Εσωτερικός Βαθμός Απόδοσης (IRR) - απλοποιημένος:**

```
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### Δεδομένα Εισόδου

#### Στοιχεία Συστήματος

- **Αντικατάσταση καυστήρα**: Ποσότητα και τιμή μονάδας
- **Γαλβανισμένος σιδηροσωλήνας**: Ποσότητα και τιμή μονάδας
- **Συστήματα ανίχνευσης διαρροής**: Ποσότητα και τιμή μονάδας
- **Καθαρισμός λέβητα**: Ποσότητα και τιμή μονάδας

#### Οικονομικά Στοιχεία

- **Τρέχον ετήσιο κόστος ενέργειας**: Αυτόματος υπολογισμός (read-only)
- **Ετήσιο κόστος φυσικού αερίου**: Αυτόματος υπολογισμός (read-only)
- **Ετήσια ενεργειακή εξοικονόμηση**: Αυτόματος υπολογισμός
- **Χρονικό διάστημα**: Διάρκεια επένδυσης σε έτη (default: 15)
- **Απόδοση νέου συστήματος**: Ποσοστό απόδοσης (10%-100%, default: 90%)
- **Τιμή φυσικού αερίου**: Προαιρετικό (€/kWh), εάν δεν οριστεί χρησιμοποιείται η τιμή καυσίμου από το έργο

### Αυτοματοποιήσεις

1. **Τρέχον κόστος ενέργειας**: Υπολογίζεται από Energy Consumptions με διαφορετικά κόστη ανά πηγή
2. **Κόστος φυσικού αερίου**: Υπολογίζεται από θερμική απαίτηση και απόδοση συστήματος
3. **Εξοικονομήσεις**: Αυτόματη διαφορά των δύο κοστών
4. **Οικονομικοί δείκτες**: Αυτόματος υπολογισμός όλων των δεικτών

### Υλοποίηση

- **Backend**: `naturalGasNetwork/models.py`, `naturalGasNetwork/views.py`
- **Frontend**: `NaturalGasNetworkTabContent.jsx`
- **API Endpoints**: `/natural_gas_networks/`
- **Database**: Δύο νέα πεδία: `new_system_efficiency`, `natural_gas_price_per_kwh`

---

## 9. Αντικατάσταση Λέβητα

### Περιγραφή

Υπολογισμός οικονομικών οφελών από την αντικατάσταση παλαιού λέβητα με νέο υψηλής απόδοσης.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = New_boiler_cost + Installation_cost + Additional_equipment_cost
```

#### Ενεργειακές Εξοικονομήσεις

**Βελτίωση απόδοσης:**

```
Efficiency_improvement = New_boiler_efficiency - Old_boiler_efficiency
```

**Ετήσια εξοικονόμηση καυσίμου:**

```
Annual_fuel_savings = Current_fuel_consumption × (Efficiency_improvement ÷ Old_boiler_efficiency)
```

**Ετήσια οικονομική εξοικονόμηση:**

```
Annual_energy_savings = Annual_fuel_savings × Fuel_cost_per_unit
```

#### Οικονομικοί Δείκτες

**Ετήσιο οικονομικό όφελος:**

```
Annual_economic_benefit = Annual_energy_savings - Additional_maintenance_cost
```

**Περίοδος αποπληρωμής:**

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
```

**Καθαρή Παρούσα Αξία (NPV):**

```
NPV = Σ(Annual_economic_benefit ÷ (1 + discount_rate)^year) - Total_investment_cost
```

### Δεδομένα Εισόδου

- **Κόστος νέου λέβητα (€)**, **Κόστος εγκατάστασης (€)**, **Κόστος επιπλέον εξοπλισμού (€)**
- **Απόδοση παλαιού λέβητα (%)**, **Απόδοση νέου λέβητα (%)**
- **Τρέχουσα κατανάλωση καυσίμου**, **Κόστος καυσίμου ανά μονάδα (€)**
- **Επιπλέον κόστος συντήρησης (€/έτος)**
- **Χρονικό διάστημα (έτη)**: default 20, **Προεξοφλητικός συντελεστής (%)**: default 5%

### Υλοποίηση

- **Backend**: `boilerReplacement/models.py`, `boilerReplacement/views.py`
- **Frontend**: `BoilerReplacementTabContent.jsx`

---

## 10. Αυτόματος Έλεγχος Φωτισμού

### Περιγραφή

Υπολογισμός οφελών από την εγκατάσταση αυτόματου συστήματος ελέγχου φωτισμού.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = (Lighting_area × Cost_per_m2) + Installation_cost
```

#### Ενεργειακές Εξοικονομήσεις

**Εξοικονόμηση ενέργειας:**

```
Annual_energy_savings = Current_consumption × (Savings_percentage ÷ 100) × Energy_cost_kwh
```

#### Οικονομικοί Δείκτες

Χρήση των βασικών οικονομικών δεικτών (NPV, IRR, Payback Period).

### Δεδομένα Εισόδου

- **Επιφάνεια φωτισμού (m²)**, **Κόστος ανά m² (€/m²)**, **Κόστος εγκατάστασης (€)**
- **Τρέχουσα κατανάλωση (kWh)**, **Ποσοστό εξοικονόμησης (%)**, **Κόστος ενέργειας (€/kWh)**

### Υλοποίηση

- **Backend**: `automaticLightingControl/models.py`, `automaticLightingControl/views.py`
- **Frontend**: `AutomaticLightingControlTabContent.jsx`

---

## 11. Εξωτερικές Περσίδες

### Περιγραφή

Υπολογισμός οφελών από την εγκατάσταση εξωτερικών περσίδων για μείωση κατανάλωσης ψύξης.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = (Window_area × Cost_per_m2) + Installation_cost
```

#### Ενεργειακές Εξοικονομήσεις

**Ετήσια εξοικονόμηση:**

```
Annual_energy_savings = Cooling_energy_savings × Energy_cost_kwh - Maintenance_cost
```

### Δεδομένα Εισόδου

- **Επιφάνεια παραθύρων (m²)**, **Κόστος ανά m² (€/m²)**, **Κόστος εγκατάστασης (€)**
- **Εξοικονόμηση ψύξης (kWh)**, **Κόστος ενέργειας (€/kWh)**, **Κόστος συντήρησης (€)**

### Υλοποίηση

- **Backend**: `exteriorBlinds/models.py`, `exteriorBlinds/views.py`

---

## 12. Αναβάθμιση Συστήματος Ζεστού Νερού Χρήσης

### Περιγραφή

Υπολογισμός οικονομικών οφελών από την αναβάθμιση συστήματος ζεστού νερού χρήσης με ηλιακούς συλλέκτες.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης - Υπομερίσματα

```
Solar_collectors_subtotal = Solar_collectors_quantity × Solar_collectors_unit_price
Metal_support_bases_subtotal = Metal_support_bases_quantity × Metal_support_bases_unit_price
Solar_system_subtotal = Solar_system_quantity × Solar_system_unit_price
Insulated_pipes_subtotal = Insulated_pipes_quantity × Insulated_pipes_unit_price
Central_heater_installation_subtotal = Central_heater_installation_quantity × Central_heater_installation_unit_price

Total_investment_cost = Άθροισμα όλων των υπομερισμάτων
```

#### Ενεργειακοί Υπολογισμοί

```
Annual_energy_consumption_kwh = (Electric_heater_power ÷ 1000) × Operating_hours_per_year
Annual_solar_savings_kwh = Annual_energy_consumption_kwh × (Solar_utilization_percentage ÷ 100)
Annual_economic_benefit = Annual_solar_savings_kwh × Energy_cost_kwh
```

#### Οικονομικοί Δείκτες

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
NPV = (Annual_economic_benefit × Lifespan_years) - Total_investment_cost
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### Δεδομένα Εισόδου

- **Στοιχεία Συστήματος**: Ποσότητες και τιμές για ηλιακούς συλλέκτες, βάσεις στήριξης, ηλιακό σύστημα, μονωμένες σωληνώσεις, εγκατάσταση θερμοσίφωνα
- **Ενεργειακά Στοιχεία**: Ισχύς ηλεκτρικού θερμοσίφωνα, ώρες λειτουργίας, ποσοστό ηλιακής αξιοποίησης (default 80%), κόστος ενέργειας, διάρκεια ζωής (default 10 έτη)

### Υλοποίηση

- **Backend**: `hotWaterUpgrade/models.py`, `hotWaterUpgrade/views.py`
- **Frontend**: `HotWaterUpgradeTabContent.jsx`

---

## 13. Ηλιακοί Συλλέκτες

### Περιγραφή

Σύστημα καταγραφής και ανάλυσης ηλιακών συλλεκτών για ζεστό νερό και θέρμανση.

### Τεχνικά Χαρακτηριστικά

#### Τύπος και Χρήση

- **Χρήση ηλιακών συλλεκτών**: Προσδιορισμός χρήσης (ζεστό νερό, θέρμανση)
- **Τύπος ηλιακού συλλέκτη**: Κατηγορία συλλέκτη (επίπεδος, κενού αέρα κ.λπ.)

#### Γεωμετρικά Στοιχεία

- **Επιφάνεια ηλιακών συλλεκτών (m²)**: Συνολική επιφάνεια συλλογής
- **Χωρητικότητα δοχείου αποθήκευσης ΖΝΧ (L)**: Όγκος αποθήκευσης ζεστού νερού χρήσης
- **Χωρητικότητα δοχείου αποθήκευσης θέρμανσης (L)**: Όγκος αποθήκευσης για θέρμανση

#### Λειτουργικά Χαρακτηριστικά

- **Είδος αντιψυκτικού υγρού**, **Ποσοστό αντιψυκτικού (%)**, **Αποδοτικότητα συλλέκτη (%)**
- **Κλίση εγκατάστασης (μοίρες)**, **Προσανατολισμός (μοίρες)**

### Υλοποίηση

- **Backend**: `solarCollectors/models.py`, `solarCollectors/views.py`
- **Frontend**: `SolarCollectorsTabContent.jsx`

---

## Γενικές Φόρμουλες Backend

### 1. Οικονομικοί Δείκτες

**Περίοδος Αποπληρωμής:**

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
```

**Καθαρή Παρούσα Αξία (NPV):**

```
NPV = Σ[Annual_benefit ÷ (1 + discount_rate)^year] - Initial_investment
```

**Εσωτερικός Βαθμός Απόδοσης (IRR):**

```
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### 2. Ενεργειακοί Υπολογισμοί

**Κλιματιστικά - Μετατροπή BTU:**

```
Power_watts = BTU × 0.293
Heating_consumption = (Power_watts ÷ (COP ÷ 100)) × Heating_hours × Quantity ÷ 1000
Cooling_consumption = (Power_watts ÷ (EER ÷ 100)) × Cooling_hours × Quantity ÷ 1000
```

**Λαμπτήρες - Εξοικονόμηση:**

```
Energy_savings = ((Old_power × Old_count) - (New_power × New_count)) × Operating_hours ÷ 1000
```

### 3. Θερμικοί Υπολογισμοί

**Συντελεστής Θερμοπερατότητας (U-value):**

```
U = 1 ÷ Σ(Thickness_i ÷ Thermal_conductivity_i + Thermal_resistances)
```

**Θερμικές Απώλειες:**

```
Thermal_losses = U × Area × Temperature_difference × Time_hours
```

**Ενεργειακή Εξοικονόμηση Θερμομόνωσης:**

```
Energy_savings = (U_before - U_after) × Area × Degree_days × 24 ÷ 1000
```

### 4. Φωτοβολταϊκά Συστήματα

**Ετήσια Παραγωγή:**

```
Annual_production = Panel_capacity × Peak_sun_hours × 365 × System_efficiency
```

**Κόστος Συστήματος:**

```
Total_cost = Equipment_cost + (Equipment_cost × Unexpected_expenses_rate) +
            (Equipment_cost × (1 + Unexpected_expenses_rate) × Tax_rate)
```

### Αυτοματοποιήσεις Backend

1. **Αυτόματος υπολογισμός**: Όλα τα models καλούν calculation functions στο `save()` method
2. **Ασφαλής χειρισμός σφαλμάτων**: Try/except blocks για διαίρεση με μηδέν
3. **Στρογγυλοποίηση αποτελεσμάτων**: Συνήθως 2 δεκαδικά ψηφία
4. **Υπολογισμός NPV με προεξοφλητικό συντελεστή**: Πλήρης φόρμουλα παρούσας αξίας
5. **Έλεγχος εγκυρότητας δεδομένων**: Έλεγχος για μηδενικά ή αρνητικά κόστη

### Κοινά Πεδία Συστημάτων

- `created_at`: Αυτόματη ημερομηνία δημιουργίας
- `updated_at`: Αυτόματη ημερομηνία ενημέρωσης
- `user/created_by`: Σύνδεση με χρήστη που δημιούργησε
- `building`: Σύνδεση με κτίριο
- `project`: Σύνδεση με έργο
- `uuid`: Μοναδικό αναγνωριστικό για κάθε εγγραφή

---
