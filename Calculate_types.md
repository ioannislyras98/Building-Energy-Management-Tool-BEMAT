# Τύποι Υπολογισμών στο BEMAT (Building Energy Management Tool)

Αυτό το έγγραφο περιγράφει όλους τους τύπους υπολογισμών που υποστηρίζονται στο εργαλείο διαχείρισης ενέργειας κτιρίων BEMAT.

## Συστήματα που υποστη## 8. Εγκατάσταση Δικτύου Φυσικού Αερίου

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

## 9. Εγκατάσταση Εξωτερικών Περσίδων

### Περιγραφή

Υπολογισμός οικονομικών οφελών από την εγκατάσταση εξωτερικών περσίδων για την βελτίωση της ενεργειακής απόδοσης κτιρίου μέσω μείωσης της κατανάλωσης ψύξης.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = (Window_area × Cost_per_m2) + Installation_cost
```

Όπου:
- `Window_area`: Επιφάνεια παραθύρων σε m²
- `Cost_per_m2`: Κόστος περσίδων ανά τετραγωνικό μέτρο
- `Installation_cost`: Επιπλέον κόστος εγκατάστασης

#### Ενεργειακές Εξοικονομήσεις

**Ετήσια ενεργειακή εξοικονόμηση:**

```
Annual_energy_savings = Cooling_energy_savings × Energy_cost_kwh
```

Όπου:
- `Cooling_energy_savings`: Εξοικονόμηση ενέργειας ψύξης σε kWh/έτος
- `Energy_cost_kwh`: Κόστος ενέργειας σε €/kWh

#### Οικονομικοί Δείκτες

**Ετήσιο οικονομικό όφελος:**

```
Annual_economic_benefit = Annual_energy_savings - Maintenance_cost
```

**Περίοδος αποπληρωμής:**

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
```

**Καθαρή Παρούσα Αξία (NPV):**

```
NPV = Σ(Annual_economic_benefit ÷ (1 + discount_rate)^year) - Total_investment_cost
```

**Εσωτερικός Βαθμός Απόδοσης (IRR):**

```
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### Δεδομένα Εισόδου

- **Επιφάνεια παραθύρων (m²)**: Συνολική επιφάνεια παραθύρων
- **Κόστος ανά m² (€)**: Κόστος περσίδων ανά τετραγωνικό μέτρο
- **Κόστος εγκατάστασης (€)**: Επιπλέον κόστος εγκατάστασης
- **Ετήσιο κόστος συντήρησης (€)**: Κόστος συντήρησης των περσίδων
- **Εξοικονόμηση ενέργειας ψύξης (kWh/έτος)**: Ετήσια εξοικονόμηση
- **Κόστος ενέργειας (€/kWh)**: Τιμή ενέργειας
- **Χρονικό διάστημα (έτη)**: Διάρκεια αξιολόγησης (default: 20)
- **Προεξοφλητικός συντελεστής (%)**: Για υπολογισμό NPV (default: 5%)

### Υλοποίηση

- **Backend**: `exteriorBlinds/models.py`, `exteriorBlinds/views.py`
- **Frontend**: `ExteriorBlindsTabContent.jsx`
- **API Endpoints**: `/exterior_blinds/`

---

## 10. Εγκατάσταση Συστήματος Αυτομάτου Ελέγχου Τεχνητού Φωτισμού

### Περιγραφή

Υπολογισμός οικονομικών οφελών από την εγκατάσταση συστήματος αυτομάτου ελέγχου φωτισμού που βελτιστοποιεί την κατανάλωση ενέργειας μέσω αισθητήρων κίνησης και φωτός.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = System_cost + Installation_cost
```

Όπου:
- `System_cost`: Κόστος συστήματος αυτομάτου ελέγχου
- `Installation_cost`: Κόστος εγκατάστασης του συστήματος

#### Ενεργειακές Εξοικονομήσεις

**Ετήσια εξοικονόμηση ενέργειας σε kWh:**

```
Annual_energy_savings_kwh = Current_lighting_consumption × (Energy_savings_percentage ÷ 100)
```

**Ετήσια εξοικονόμηση ενέργειας σε ευρώ:**

```
Annual_energy_savings = Annual_energy_savings_kwh × Energy_cost_kwh
```

Όπου:
- `Current_lighting_consumption`: Τρέχουσα κατανάλωση φωτισμού σε kWh/έτος
- `Energy_savings_percentage`: Ποσοστό εξοικονόμησης (default: 30%)
- `Energy_cost_kwh`: Κόστος ενέργειας σε €/kWh

#### Οικονομικοί Δείκτες

**Ετήσιο οικονομικό όφελος:**

```
Annual_economic_benefit = Annual_energy_savings - Maintenance_cost
```

**Περίοδος αποπληρωμής:**

```
Payback_period = Total_investment_cost ÷ Annual_economic_benefit
```

**Καθαρή Παρούσα Αξία (NPV):**

```
NPV = Σ(Annual_economic_benefit ÷ (1 + discount_rate)^year) - Total_investment_cost
```

**Εσωτερικός Βαθμός Απόδοσης (IRR):**

```
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### Δεδομένα Εισόδου

- **Κόστος συστήματος (€)**: Κόστος συστήματος αυτομάτου ελέγχου
- **Κόστος εγκατάστασης (€)**: Κόστος εγκατάστασης
- **Ετήσιο κόστος συντήρησης (€)**: Κόστος συντήρησης
- **Τρέχουσα κατανάλωση φωτισμού (kWh/έτος)**: Ετήσια κατανάλωση ενέργειας
- **Ποσοστό εξοικονόμησης (%)**: Αναμενόμενη εξοικονόμηση (default: 30%)
- **Κόστος ενέργειας (€/kWh)**: Τιμή ενέργειας
- **Χρονικό διάστημα (έτη)**: Διάρκεια αξιολόγησης (default: 15)
- **Προεξοφλητικός συντελεστής (%)**: Για υπολογισμό NPV (default: 5%)

### Υλοποίηση

- **Backend**: `automaticLightingControl/models.py`, `automaticLightingControl/views.py`
- **Frontend**: `AutomaticLightingControlTabContent.jsx`
- **API Endpoints**: `/automatic_lighting_controls/`

---

## 11. Αντικατάσταση Λέβητα

### Περιγραφή

Υπολογισμός οικονομικών οφελών από την αντικατάσταση παλαιού λέβητα με νέο υψηλής απόδοσης για βελτίωση της ενεργειακής απόδοσης συστήματος θέρμανσης.

### Μαθηματικοί Τύποι

#### Κόστος Επένδυσης

**Συνολικό κόστος επένδυσης:**

```
Total_investment_cost = New_boiler_cost + Installation_cost + Additional_equipment_cost
```

Όπου:
- `New_boiler_cost`: Κόστος νέου λέβητα
- `Installation_cost`: Κόστος εγκατάστασης
- `Additional_equipment_cost`: Κόστος επιπλέον εξοπλισμού

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

Όπου:
- `Old_boiler_efficiency`: Απόδοση παλαιού λέβητα (%)
- `New_boiler_efficiency`: Απόδοση νέου λέβητα (%)
- `Current_fuel_consumption`: Τρέχουσα κατανάλωση καυσίμου
- `Fuel_cost_per_unit`: Κόστος καυσίμου ανά μονάδα

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

**Εσωτερικός Βαθμός Απόδοσης (IRR):**

```
IRR = (Annual_economic_benefit ÷ Total_investment_cost) × 100
```

### Δεδομένα Εισόδου

- **Κόστος νέου λέβητα (€)**: Κόστος αγοράς νέου λέβητα
- **Κόστος εγκατάστασης (€)**: Κόστος εγκατάστασης
- **Κόστος επιπλέον εξοπλισμού (€)**: Πρόσθετα υλικά/εξοπλισμός
- **Απόδοση παλαιού λέβητα (%)**: Τρέχουσα απόδοση
- **Απόδοση νέου λέβητα (%)**: Απόδοση νέου λέβητα
- **Τρέχουσα κατανάλωση καυσίμου**: Ετήσια κατανάλωση
- **Κόστος καυσίμου ανά μονάδα (€)**: Τιμή καυσίμου
- **Επιπλέον κόστος συντήρησης (€/έτος)**: Διαφορά συντήρησης
- **Χρονικό διάστημα (έτη)**: Διάρκεια αξιολόγησης (default: 20)
- **Προεξοφλητικός συντελεστής (%)**: Για υπολογισμό NPV (default: 5%)

### Υλοποίηση

- **Backend**: `boilerReplacement/models.py`, `boilerReplacement/views.py`
- **Frontend**: `BoilerReplacementTabContent.jsx`
- **API Endpoints**: `/boiler_replacements/`

--- **Θερμομόνωση Εξωτερικής Τοιχοποιίας**
2. **Θερμομόνωση Οροφής**
3. **Φωτοβολταϊκά Συστήματα**
4. **Αντικατάσταση Παλαιών Υαλοπινάκων**
5. **Αντικατάσταση Λαμπτήρων Πυράκτωσης**
6. **Αντικατάσταση Κλιματιστικών**
7. **Κατανάλωση Ενέργειας**
8. **Εγκατάσταση Δικτύου Φυσικού Αερίου** *(Νέο)*

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

