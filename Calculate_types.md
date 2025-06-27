# Thermal Insulation System - Calculation Types Documentation

This document provides comprehensive documentation of all calculations used in the Thermal Insulation System for External Walls in the Building Energy Management Tool (BEMAT).

## Table of Contents

1. [Thermal Resistance Calculations](#thermal-resistance-calculations)
2. [U-Coefficient (Thermal Transmittance) Calculations](#u-coefficient-thermal-transmittance-calculations)
3. [Heat Loss Calculations](#heat-loss-calculations)
4. [Surface Area Calculations](#surface-area-calculations)
5. [Cost Calculations](#cost-calculations)
6. [Annual Energy Benefit Calculations](#annual-energy-benefit-calculations)
7. [Economic Analysis Calculations](#economic-analysis-calculations)
8. [Constants and Parameters](#constants-and-parameters)
9. [Notes and Best Practices](#notes-and-best-practices)

---

## Thermal Resistance Calculations

### Individual Material Thermal Resistance (R)

**Formula:**
```
R = d / λ
```

**Where:**
- `R` = Thermal resistance (m²K/W)
- `d` = Material thickness (m)
- `λ` = Thermal conductivity of material (W/mK)

**Implementation:**
- **Backend:** Auto-calculated property in thermal insulation models
- **Frontend:** Real-time calculation during data entry

### Total Thermal Resistance (R_total)

**Formula:**
```
R_total = R_si + R_se + ΣR_materials
```

**Where:**
- `R_si` = Internal surface resistance = 0.13 m²K/W
- `R_se` = External surface resistance = 0.04 m²K/W
- `ΣR_materials` = Sum of thermal resistances of all material layers

**Implementation:**
- **Backend:** Used in `calculate_u_coefficient()` method
- **Frontend:** `calculateRTotal(materials)` function

---

## U-Coefficient (Thermal Transmittance) Calculations

### U-Coefficient Calculation

**Formula:**
```
U = 1 / R_total
```

**Where:**
- `U` = Thermal transmittance coefficient (W/m²K)
- `R_total` = Total thermal resistance (m²K/W)

**Important Notes:**
- U-coefficient is calculated **ONLY for NEW materials** in the backend
- Lower U-values indicate better insulation performance
- If R_total ≤ 0, U-coefficient defaults to 0

**Implementation:**
- **Backend:** `ExternalWallThermalInsulation.calculate_u_coefficient()` method
- **Frontend:** `calculateUCoefficient(materials)` function

---

## Heat Loss Calculations

### Hourly Heat Losses

**Formula:**
```
Q = (U × A × ΔT) / 1000
```

**Where:**
- `Q` = Hourly heat losses (kW)
- `U` = Thermal transmittance coefficient (W/m²K)
- `A` = Total surface area (m²)
- `ΔT` = Temperature difference (K or °C)
- Division by 1000 converts W to kW

### Temperature Differences Used

| Season | Temperature Difference (ΔT) | Usage |
|--------|----------------------------|-------|
| Winter | 72°C | Heating calculations |
| Summer | 12.5°C | Cooling calculations |

### Winter Hourly Losses

**Implementation:**
- **Backend:** `_calculate_hourly_losses(materials, 72)` helper method
- **Frontend:** `calculateWinterHourlyLosses(materials)` function

### Summer Hourly Losses

**Implementation:**
- **Backend:** `_calculate_hourly_losses(materials, 12.5)` helper method
- **Frontend:** `calculateSummerHourlyLosses(materials)` function

---

## Surface Area Calculations

### Total Surface Area

**Formula:**
```
A_total = ΣA_materials
```

**Where:**
- `A_total` = Total surface area (m²)
- `A_materials` = Surface area of each material layer (m²)

**Implementation:**
- **Frontend:** `calculateTotalSurfaceArea(materials)` function

---

## Cost Calculations

### Total Material Cost

**Formula:**
```
C_total = ΣC_materials
```

**Where:**
- `C_total` = Total cost (€)
- `C_materials` = Cost of each material layer (€)

**Important Notes:**
- Cost calculation applies **ONLY to NEW materials**
- Old materials do not have cost column in the interface
- Total cost field is read-only and auto-calculated
- **Automatically calculated from the sum of new materials costs** / **Υπολογίζεται αυτόματα από το άθροισμα των κοστών των νέων υλικών**

**Implementation:**
- **Frontend:** `calculateTotalCost(materials)` function

---

## Annual Energy Benefit Calculations

### Annual Energy Savings

**Formula:**
```
Annual_Energy_Savings = (ΔQ_winter × Hours_cooling) + (ΔQ_summer × Hours_heating)
```

**Where:**
- `ΔQ_winter` = Difference in winter hourly losses between old and new materials (kW)
- `ΔQ_summer` = Difference in summer hourly losses between old and new materials (kW)
- `Hours_cooling` = Cooling hours per year
- `Hours_heating` = Heating hours per year

### Annual Benefit Calculation

**Formula:**
```
Annual_Benefit = Annual_Energy_Savings × Electricity_Cost_per_kWh
```

**Where:**
- `Annual_Benefit` = Annual energy cost savings (€/year)
- `Annual_Energy_Savings` = Total energy savings (kWh/year)
- `Electricity_Cost_per_kWh` = Project electricity cost (€/kWh)

**Important Notes:**
- Annual benefit is auto-calculated and read-only
- Formula ensures energy savings (old materials should have higher losses than new materials)
- Minimum value is 0 (non-negative constraint)
- **Automatically calculated based on loss differences, operating hours and electricity cost** / **Υπολογίζεται αυτόματα βάσει διαφοράς απωλειών, ωρών λειτουργίας και κόστους ρεύματος**

**Implementation:**
- **Backend:** `calculate_annual_benefit()` method (auto-calculated on save)
- **Frontend:** `calculateAnnualBenefit()` function (display purposes)

---

## Economic Analysis Calculations

### Net Present Value (NPV)

**Formula:**
```
NPV = -Initial_Investment + Σ(Annual_Net_Benefit / (1 + discount_rate)^year)
```

**Where:**
- `Initial_Investment` = Total cost of materials and installation (€)
- `Annual_Net_Benefit` = Annual benefit - Annual operating costs (€/year)
- `discount_rate` = Discount rate as decimal (e.g., 5% = 0.05)
- `year` = Each year from 1 to time_period_years

**Implementation:**
- **Backend:** `calculate_npv()` method

---

## Constants and Parameters

### Surface Resistances

| Parameter | Value | Unit | Description |
|-----------|-------|------|-------------|
| R_si | 0.13 | m²K/W | Internal surface resistance |
| R_se | 0.04 | m²K/W | External surface resistance |

### Temperature Differences

| Parameter | Value | Unit | Description |
|-----------|-------|------|-------------|
| ΔT_winter | 72 | °C | Winter heating temperature difference |
| ΔT_summer | 12.5 | °C | Summer cooling temperature difference |

### Default Values

| Parameter | Default Value | Unit | Description |
|-----------|---------------|------|-------------|
| Time Period | 20 | years | Investment evaluation period |
| Discount Rate | 5 | % | NPV calculation discount rate |
| Min Hours | 0 | hours | Minimum heating/cooling hours |
| Max Hours | 8760 | hours | Maximum hours per year |

### Surface Types

- **Primary:** "Εξωτερικοί τοίχοι σε επαφή με τον εξωτερικό αέρα" (External walls in contact with outdoor air)
- **Other options:** Internal, External, Intermediate (legacy support)

---

## Calculation Flow

### Material Addition/Update Process

1. **Material Properties Input:**
   - Material selection (thermal conductivity λ)
   - Thickness (d)
   - Surface area (A)
   - Cost (for new materials only)

2. **Automatic Calculations:**
   - Individual thermal resistance: R = d/λ
   - Total thermal resistance: R_total = R_si + R_se + ΣR_materials
   - U-coefficient: U = 1/R_total
   - Hourly losses: Q = (U × A × ΔT) / 1000

3. **Economic Calculations:**
   - Total cost (new materials only)
   - Annual energy savings
   - Annual benefit
   - Net Present Value (NPV)

### Auto-Calculation Triggers

- **Frontend:** Real-time calculations during data entry
- **Backend:** Automatic recalculation on model save
- **Fields auto-calculated:** U-coefficient, Annual benefit, NPV, Total cost

---

## Notes and Best Practices

1. **Material Type Distinction:**
   - **Old and new thermal insulation materials management** / **Διαχείριση παλιών και νέων υλικών θερμομόνωσης**
   - Old materials: Used for baseline energy performance
   - New materials: Used for improved energy performance with cost analysis

2. **Data Validation:**
   - Thermal conductivity must be > 0
   - Thickness and surface area must be > 0
   - Hours per year: 0 ≤ hours ≤ 8760

3. **Units Consistency:**
   - All thermal calculations use SI units
   - Power conversions: W → kW (÷1000)
   - Economic calculations in Euros (€)

4. **Performance Optimization:**
   - Frontend calculations for immediate feedback
   - Backend calculations for data persistence
   - Calculations only triggered when necessary data is available
