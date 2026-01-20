import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import API_BASE_URL from "../../config/api.js";
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`natural-gas-tabpanel-${index}`}
      aria-labelledby={`natural-gas-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const NaturalGasNetworkTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const [successKey, setSuccessKey] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.NaturalGasNetworkTabContent || {}
      : greek_text.NaturalGasNetworkTabContent || {};

  const [formData, setFormData] = useState({
    burner_replacement_quantity: "",
    burner_replacement_unit_price: "",
    gas_pipes_quantity: "",
    gas_pipes_unit_price: "",
    gas_detection_systems_quantity: "",
    gas_detection_systems_unit_price: "",
    boiler_cleaning_quantity: "",
    boiler_cleaning_unit_price: "",
    oil_price_per_liter: "",
    natural_gas_price_per_m3: "",
    current_energy_cost_per_year: "",
    natural_gas_cost_per_year: "",
    annual_energy_savings: "",
    lifespan_years: 15,
    discount_rate: 5,
    annual_operating_expenses: "",
    new_system_efficiency: 0.9,
    natural_gas_price_per_kwh: "",
  });

  const [networkUuid, setNetworkUuid] = useState(null);
  useEffect(() => {
    if (buildingUuid && token) {
      fetchExistingData();
    }
  }, [buildingUuid, token]);

  useEffect(() => {
    if (projectUuid && token) {
      fetchProjectData();
    }
  }, [projectUuid, token]);

  const fetchProjectData = () => {
    $.ajax({
      url: `${API_BASE_URL}/projects/get/${projectUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.data) {
          setFormData((prev) => ({
            ...prev,
            natural_gas_price_per_kwh:
              response.data.natural_gas_price_per_m3 || "",
            oil_price_per_liter: response.data.oil_price_per_liter || "",
          }));
        }
      },
      error: (jqXHR) => {
        console.error("Error fetching project data:", jqXHR);
      },
    });
  };

  useEffect(() => {
    if (buildingData && buildingData.annual_energy_cost) {
      setFormData((prev) => ({
        ...prev,
        current_energy_cost_per_year: buildingData.annual_energy_cost,
      }));
    } else if (buildingUuid && token) {
      fetchEnergyConsumptions();
    }
  }, [buildingData, buildingUuid, token]);
  useEffect(() => {
    if (!formData.current_energy_cost_per_year && buildingUuid && token) {
      fetchEnergyConsumptions();
    }
  }, [formData, buildingUuid, token]);

  // Επαναϋπολογισμός κόστους πετρελαίου όταν αλλάζει η τιμή
  useEffect(() => {
    if (formData.oil_price_per_liter && buildingUuid && token) {
      fetchEnergyConsumptions();
    }
  }, [formData.oil_price_per_liter]);

  useEffect(() => {
    const currentCost = parseFloat(formData.current_energy_cost_per_year || 0);
    const gasCost = parseFloat(formData.natural_gas_cost_per_year || 0);

    if (currentCost > 0 && gasCost > 0) {
      const savings = currentCost - gasCost;
      if (savings !== parseFloat(formData.annual_energy_savings || 0)) {
        setFormData((prev) => ({
          ...prev,
          annual_energy_savings: savings.toFixed(2),
        }));
      }
    }
  }, [
    formData.current_energy_cost_per_year,
    formData.natural_gas_cost_per_year,
  ]);

  const fetchEnergyConsumptions = () => {
    $.ajax({
      url: `${API_BASE_URL}/energy_consumptions/get_by_building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response && response.length > 0) {
          // Υπολογίζουμε λίτρα πετρελαίου × τιμή ανά λίτρο
          const totalAnnualCost = response.reduce((sum, consumption) => {
            // Φιλτράρουμε μόνο το πετρέλαιο θέρμανσης
            if (consumption.energy_source !== "heating_oil") {
              return sum;
            }

            const liters = consumption.quantity || 0;
            let oilPricePerLiter = 1.0;

            // Χρησιμοποιούμε την τιμή από το formData αν υπάρχει
            if (formData.oil_price_per_liter) {
              oilPricePerLiter = parseFloat(formData.oil_price_per_liter);
            } else if (params && params.oil_price_per_liter) {
              oilPricePerLiter = parseFloat(params.oil_price_per_liter);
            } else if (
              buildingData &&
              buildingData.project &&
              buildingData.project.oil_price_per_liter
            ) {
              oilPricePerLiter = parseFloat(
                buildingData.project.oil_price_per_liter,
              );
            }

            return sum + liters * oilPricePerLiter;
          }, 0);

          if (totalAnnualCost > 0) {
            setFormData((prev) => ({
              ...prev,
              current_energy_cost_per_year: totalAnnualCost.toFixed(2),
            }));
          }
        }
      },
      error: (jqXHR) => {},
    });
  };

  const fetchExistingData = () => {
    $.ajax({
      url: `${API_BASE_URL}/natural_gas_networks/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0];
          setNetworkUuid(data.uuid); // Αποθήκευση του UUID για το refresh

          setFormData((prev) => ({
            ...prev,
            burner_replacement_quantity: data.burner_replacement_quantity || "",
            burner_replacement_unit_price:
              data.burner_replacement_unit_price || "",
            gas_pipes_quantity: data.gas_pipes_quantity || "",
            gas_pipes_unit_price: data.gas_pipes_unit_price || "",
            gas_detection_systems_quantity:
              data.gas_detection_systems_quantity || "",
            gas_detection_systems_unit_price:
              data.gas_detection_systems_unit_price || "",
            boiler_cleaning_quantity: data.boiler_cleaning_quantity || "",
            boiler_cleaning_unit_price: data.boiler_cleaning_unit_price || "",
            current_energy_cost_per_year:
              data.current_energy_cost_per_year || "",
            natural_gas_cost_per_year: data.natural_gas_cost_per_year || "",
            annual_energy_savings: data.annual_energy_savings || "",
            lifespan_years: data.lifespan_years || 15,
            discount_rate: data.discount_rate || 5,
            annual_operating_expenses: data.annual_operating_expenses || "",
            new_system_efficiency: data.new_system_efficiency || 0.9,
            natural_gas_price_per_kwh: data.natural_gas_price_per_m3 || "",
            oil_price_per_liter: data.oil_price_per_liter || "",
          }));

          // Φόρτωση υπολογισμένων αποτελεσμάτων από το backend
          setCalculatedResults({
            burner_replacement_subtotal: parseFloat(
              data.burner_replacement_subtotal || 0,
            ),
            gas_pipes_subtotal: parseFloat(data.gas_pipes_subtotal || 0),
            gas_detection_systems_subtotal: parseFloat(
              data.gas_detection_systems_subtotal || 0,
            ),
            boiler_cleaning_subtotal: parseFloat(
              data.boiler_cleaning_subtotal || 0,
            ),
            total_investment_cost: parseFloat(data.total_investment_cost || 0),
            annual_economic_benefit: parseFloat(
              data.annual_economic_benefit || 0,
            ),
            payback_period: parseFloat(data.payback_period || 0),
            net_present_value: parseFloat(data.net_present_value || 0),
            internal_rate_of_return: parseFloat(
              data.internal_rate_of_return || 0,
            ),
          });
        } else if (
          response.success &&
          response.current_energy_cost_per_year !== undefined
        ) {
          setFormData((prev) => ({
            ...prev,
            current_energy_cost_per_year:
              response.current_energy_cost_per_year.toString(),
          }));
        }
      },
      error: (jqXHR) => {},
    });
  };

  const [calculatedResults, setCalculatedResults] = useState({
    burner_replacement_subtotal: 0,
    gas_pipes_subtotal: 0,
    gas_detection_systems_subtotal: 0,
    boiler_cleaning_subtotal: 0,
    total_investment_cost: 0,
    annual_economic_benefit: 0,
    payback_period: 0,
    net_present_value: 0,
    internal_rate_of_return: 0,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user enters a value
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const calculateResults = useCallback(() => {
    const {
      burner_replacement_quantity,
      burner_replacement_unit_price,
      gas_pipes_quantity,
      gas_pipes_unit_price,
      gas_detection_systems_quantity,
      gas_detection_systems_unit_price,
      boiler_cleaning_quantity,
      boiler_cleaning_unit_price,
      current_energy_cost_per_year,
      natural_gas_cost_per_year,
      annual_energy_savings,
      annual_operating_expenses,
      lifespan_years,
      discount_rate,
    } = formData;

    const burnerReplacementSubtotal =
      parseFloat(burner_replacement_quantity || 0) *
      parseFloat(burner_replacement_unit_price || 0);
    const gasPipesSubtotal =
      parseFloat(gas_pipes_quantity || 0) *
      parseFloat(gas_pipes_unit_price || 0);
    const gasDetectionSystemsSubtotal =
      parseFloat(gas_detection_systems_quantity || 0) *
      parseFloat(gas_detection_systems_unit_price || 0);
    const boilerCleaningSubtotal =
      parseFloat(boiler_cleaning_quantity || 0) *
      parseFloat(boiler_cleaning_unit_price || 0);
    const totalInvestmentCost =
      burnerReplacementSubtotal +
      gasPipesSubtotal +
      gasDetectionSystemsSubtotal +
      boilerCleaningSubtotal;

    // Υπολογισμός εξοικονόμησης
    let savings = 0;
    if (current_energy_cost_per_year && natural_gas_cost_per_year) {
      savings =
        parseFloat(current_energy_cost_per_year) -
        parseFloat(natural_gas_cost_per_year);
    } else if (annual_energy_savings) {
      savings = parseFloat(annual_energy_savings);
    }

    // Ετήσιο οικονομικό όφελος = εξοικονόμηση - λειτουργικά έξοδα
    const operatingExpenses = parseFloat(annual_operating_expenses || 0);
    const annualEconomicBenefit = savings - operatingExpenses;

    // Περίοδος απόσβεσης
    let paybackPeriod = 0;
    let discountedPaybackPeriod = 0;
    if (annualEconomicBenefit > 0 && totalInvestmentCost > 0) {
      paybackPeriod = totalInvestmentCost / annualEconomicBenefit;
    }

    // NPV με το discount_rate από τη φόρμα
    const discountRateDecimal = parseFloat(discount_rate || 5) / 100.0;
    const years = parseInt(lifespan_years) || 15;
    let npv = 0;

    if (annualEconomicBenefit > 0) {
      // Calculate Discounted Payback Period
      let cumulativeDiscountedCashFlow = 0;
      discountedPaybackPeriod = years + 1; // Default: δεν αποπληρώνεται
      for (let year = 1; year <= years; year++) {
        const discountedCashFlow =
          annualEconomicBenefit / Math.pow(1 + discountRateDecimal, year);
        cumulativeDiscountedCashFlow += discountedCashFlow;
        npv += discountedCashFlow;

        if (
          cumulativeDiscountedCashFlow >= totalInvestmentCost &&
          discountedPaybackPeriod > years
        ) {
          const previousCumulative =
            cumulativeDiscountedCashFlow - discountedCashFlow;
          const fractionOfYear =
            (totalInvestmentCost - previousCumulative) / discountedCashFlow;
          discountedPaybackPeriod = year - 1 + fractionOfYear;
        }
      }
      npv -= totalInvestmentCost;
    } else {
      npv = -totalInvestmentCost;
    }

    // IRR υπολογισμός με Newton-Raphson (απλοποιημένος)
    let irr = 0;
    if (totalInvestmentCost > 0 && annualEconomicBenefit > 0) {
      const totalBenefit = annualEconomicBenefit * years;
      if (totalBenefit > totalInvestmentCost) {
        // Αρχική εκτίμηση
        irr = (annualEconomicBenefit / totalInvestmentCost) * 0.8;

        // Newton-Raphson για 20 επαναλήψεις
        for (let i = 0; i < 20; i++) {
          let npvCalc = -totalInvestmentCost;
          let derivative = 0;

          for (let year = 1; year <= years; year++) {
            const factor = Math.pow(1 + irr, year);
            npvCalc += annualEconomicBenefit / factor;
            derivative -= (year * annualEconomicBenefit) / (factor * (1 + irr));
          }

          if (Math.abs(npvCalc) < 0.001) break;

          if (Math.abs(derivative) > 0.000001) {
            irr = irr - npvCalc / derivative;
            if (irr < -0.99) irr = -0.99;
            if (irr > 10.0) irr = 10.0;
          }
        }
        irr = irr * 100; // Μετατροπή σε ποσοστό
      } else {
        irr = -100;
      }
    }

    setCalculatedResults({
      burner_replacement_subtotal: burnerReplacementSubtotal,
      gas_pipes_subtotal: gasPipesSubtotal,
      gas_detection_systems_subtotal: gasDetectionSystemsSubtotal,
      boiler_cleaning_subtotal: boilerCleaningSubtotal,
      total_investment_cost: totalInvestmentCost,
      annual_economic_benefit: annualEconomicBenefit,
      payback_period: paybackPeriod,
      discounted_payback_period: discountedPaybackPeriod,
      net_present_value: npv,
      internal_rate_of_return: irr,
    });
  }, [formData]);

  // Υπολογισμός μόνο των subtotals για τον πίνακα (όχι NPV/IRR)
  useEffect(() => {
    const {
      burner_replacement_quantity,
      burner_replacement_unit_price,
      gas_pipes_quantity,
      gas_pipes_unit_price,
      gas_detection_systems_quantity,
      gas_detection_systems_unit_price,
      boiler_cleaning_quantity,
      boiler_cleaning_unit_price,
    } = formData;

    const burnerReplacementSubtotal =
      parseFloat(burner_replacement_quantity || 0) *
      parseFloat(burner_replacement_unit_price || 0);
    const gasPipesSubtotal =
      parseFloat(gas_pipes_quantity || 0) *
      parseFloat(gas_pipes_unit_price || 0);
    const gasDetectionSystemsSubtotal =
      parseFloat(gas_detection_systems_quantity || 0) *
      parseFloat(gas_detection_systems_unit_price || 0);
    const boilerCleaningSubtotal =
      parseFloat(boiler_cleaning_quantity || 0) *
      parseFloat(boiler_cleaning_unit_price || 0);
    const totalInvestmentCost =
      burnerReplacementSubtotal +
      gasPipesSubtotal +
      gasDetectionSystemsSubtotal +
      boilerCleaningSubtotal;

    setCalculatedResults((prev) => ({
      ...prev,
      burner_replacement_subtotal: burnerReplacementSubtotal,
      gas_pipes_subtotal: gasPipesSubtotal,
      gas_detection_systems_subtotal: gasDetectionSystemsSubtotal,
      boiler_cleaning_subtotal: boilerCleaningSubtotal,
      total_investment_cost: totalInvestmentCost,
    }));
  }, [
    formData.burner_replacement_quantity,
    formData.burner_replacement_unit_price,
    formData.gas_pipes_quantity,
    formData.gas_pipes_unit_price,
    formData.gas_detection_systems_quantity,
    formData.gas_detection_systems_unit_price,
    formData.boiler_cleaning_quantity,
    formData.boiler_cleaning_unit_price,
  ]);

  const handleSubmit = () => {
    if (!buildingUuid || !token) {
      setErrorKey("errorAuth");
      return;
    }

    // Validation for System Components
    const systemComponentsErrors = {};
    if (
      !formData.burner_replacement_quantity ||
      parseFloat(formData.burner_replacement_quantity) <= 0
    ) {
      systemComponentsErrors.burner_replacement_quantity = true;
    }
    if (
      !formData.burner_replacement_unit_price ||
      parseFloat(formData.burner_replacement_unit_price) <= 0
    ) {
      systemComponentsErrors.burner_replacement_unit_price = true;
    }
    if (
      !formData.gas_pipes_quantity ||
      parseFloat(formData.gas_pipes_quantity) <= 0
    ) {
      systemComponentsErrors.gas_pipes_quantity = true;
    }
    if (
      !formData.gas_pipes_unit_price ||
      parseFloat(formData.gas_pipes_unit_price) <= 0
    ) {
      systemComponentsErrors.gas_pipes_unit_price = true;
    }
    if (
      !formData.gas_detection_systems_quantity ||
      parseFloat(formData.gas_detection_systems_quantity) <= 0
    ) {
      systemComponentsErrors.gas_detection_systems_quantity = true;
    }
    if (
      !formData.gas_detection_systems_unit_price ||
      parseFloat(formData.gas_detection_systems_unit_price) <= 0
    ) {
      systemComponentsErrors.gas_detection_systems_unit_price = true;
    }
    if (
      !formData.boiler_cleaning_quantity ||
      parseFloat(formData.boiler_cleaning_quantity) <= 0
    ) {
      systemComponentsErrors.boiler_cleaning_quantity = true;
    }
    if (
      !formData.boiler_cleaning_unit_price ||
      parseFloat(formData.boiler_cleaning_unit_price) <= 0
    ) {
      systemComponentsErrors.boiler_cleaning_unit_price = true;
    }

    // Validation for Economic Data
    const economicDataErrors = {};
    if (!formData.lifespan_years || parseFloat(formData.lifespan_years) <= 0) {
      economicDataErrors.lifespan_years = true;
    }
    if (!formData.discount_rate || parseFloat(formData.discount_rate) <= 0) {
      economicDataErrors.discount_rate = true;
    }
    if (
      !formData.annual_operating_expenses ||
      parseFloat(formData.annual_operating_expenses) < 0
    ) {
      economicDataErrors.annual_operating_expenses = true;
    }
    if (
      !formData.new_system_efficiency ||
      parseFloat(formData.new_system_efficiency) <= 0
    ) {
      economicDataErrors.new_system_efficiency = true;
    }

    const hasSystemComponentsErrors =
      Object.keys(systemComponentsErrors).length > 0;
    const hasEconomicDataErrors = Object.keys(economicDataErrors).length > 0;

    if (hasSystemComponentsErrors || hasEconomicDataErrors) {
      setValidationErrors({ ...systemComponentsErrors, ...economicDataErrors });
      if (hasSystemComponentsErrors && hasEconomicDataErrors) {
        setErrorKey("requiredFieldsErrorBoth");
        setTabValue(0);
      } else if (hasSystemComponentsErrors) {
        setErrorKey("requiredFieldsError");
        setTabValue(0);
      } else if (hasEconomicDataErrors) {
        setErrorKey("requiredFieldsErrorEconomic");
        setTabValue(1);
      }
      return;
    }

    setLoading(true);
    setErrorKey(null);

    const submitData = {
      building: buildingUuid,
      project: projectUuid,
      ...formData,
      ...calculatedResults,
    };

    $.ajax({
      url: `${API_BASE_URL}/natural_gas_networks/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (response) => {
        if (response.success && response.data) {
          const data = response.data;

          // Ενημέρωση του UUID αν είναι νέα εγγραφή
          if (data.uuid && !networkUuid) {
            setNetworkUuid(data.uuid);
          }

          // Ενημέρωση formData με τα αποθηκευμένα δεδομένα
          setFormData((prev) => ({
            ...prev,
            current_energy_cost_per_year:
              data.current_energy_cost_per_year ||
              prev.current_energy_cost_per_year,
            natural_gas_cost_per_year:
              data.natural_gas_cost_per_year || prev.natural_gas_cost_per_year,
            annual_energy_savings:
              data.annual_energy_savings || prev.annual_energy_savings,
            lifespan_years: data.lifespan_years || prev.lifespan_years,
            discount_rate: data.discount_rate || prev.discount_rate,
          }));

          // Ενημέρωση calculatedResults με τα επαναϋπολογισμένα αποτελέσματα από το backend
          setCalculatedResults({
            burner_replacement_subtotal: parseFloat(
              data.burner_replacement_subtotal || 0,
            ),
            gas_pipes_subtotal: parseFloat(data.gas_pipes_subtotal || 0),
            gas_detection_systems_subtotal: parseFloat(
              data.gas_detection_systems_subtotal || 0,
            ),
            boiler_cleaning_subtotal: parseFloat(
              data.boiler_cleaning_subtotal || 0,
            ),
            total_investment_cost: parseFloat(data.total_investment_cost || 0),
            annual_economic_benefit: parseFloat(
              data.annual_economic_benefit || 0,
            ),
            payback_period: parseFloat(data.payback_period || 0),
            net_present_value: parseFloat(data.net_present_value || 0),
            internal_rate_of_return: parseFloat(
              data.internal_rate_of_return || 0,
            ),
          });
        }

        setSuccessKey("successSave");
        setLoading(false);
      },
      error: (jqXHR) => {
        setErrorKey("errorSave");
        setLoading(false);
      },
    });
  };

  const renderSystemComponents = () => (
    <div className="space-y-4">
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.systemComponents || "Στοιχεία Συστήματος"}
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "var(--color-primary)" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                {translations.itemType || "Είδος"}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white" }}
                align="center">
                {translations.quantity || "Ποσότητα"}{" "}
                <span style={{ color: "#ff4444" }}>*</span>
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white" }}
                align="center">
                {translations.unitPrice || "Τιμή Μονάδας (€)"}{" "}
                <span style={{ color: "#ff4444" }}>*</span>
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white" }}
                align="center">
                {translations.expense || "Δαπάνη (€)"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Burner Replacement */}
            <TableRow>
              <TableCell>
                {translations.burnerReplacement || "Αντικατάσταση καυστήρα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.burner_replacement_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "burner_replacement_quantity",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.burner_replacement_quantity}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.burner_replacement_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "burner_replacement_unit_price",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.burner_replacement_unit_price}
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {calculatedResults.burner_replacement_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Gas Pipes */}
            <TableRow>
              <TableCell>
                {translations.gasPipes ||
                  "Γαλβανισμένος σιδηροσωλήνας κατάλληλος για φυσικό αέριο μαζί με τα απαραίτητα μικρουλικά, βάνες, φίλτρα κ.λπ."}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_pipes_quantity}
                  onChange={(e) =>
                    handleInputChange("gas_pipes_quantity", e.target.value)
                  }
                  required
                  error={validationErrors.gas_pipes_quantity}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_pipes_unit_price}
                  onChange={(e) =>
                    handleInputChange("gas_pipes_unit_price", e.target.value)
                  }
                  required
                  error={validationErrors.gas_pipes_unit_price}
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {calculatedResults.gas_pipes_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Gas Detection Systems */}
            <TableRow>
              <TableCell>
                {translations.gasDetectionSystems ||
                  "Συστήματα Ανίχνευσης διαρροής φυσικού αερίου"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_detection_systems_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "gas_detection_systems_quantity",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.gas_detection_systems_quantity}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_detection_systems_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "gas_detection_systems_unit_price",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.gas_detection_systems_unit_price}
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {calculatedResults.gas_detection_systems_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Boiler Cleaning */}
            <TableRow>
              <TableCell>
                {translations.boilerCleaning ||
                  "Καθαρισμός λέβητα, ένωση και ρύθμιση καυστήρα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.boiler_cleaning_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "boiler_cleaning_quantity",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.boiler_cleaning_quantity}
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.boiler_cleaning_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "boiler_cleaning_unit_price",
                      e.target.value,
                    )
                  }
                  required
                  error={validationErrors.boiler_cleaning_unit_price}
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary)",
                      },
                    },
                  }}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {calculatedResults.boiler_cleaning_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

  const renderEconomicData = () => (
    <div className="space-y-4">
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.economicData || "Οικονομικά Στοιχεία"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.currentEnergyCostPerYear ||
                "Ετήσιο κόστος ενέργειας πετρελαίου") + " (€)"
            }
            type="number"
            value={formData.current_energy_cost_per_year}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText="Υπολογίζεται: Λίτρα × Τιμή πετρελαίου"
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.naturalGasCostPerYear ||
                "Ετήσιο κόστος φυσικού αερίου") + " (€)"
            }
            type="number"
            value={formData.natural_gas_cost_per_year}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText={
              translations.autoCalculatedHelperText ||
              "Υπολογίζεται αυτόματα από τη θερμική απαίτηση και την απόδοση του συστήματος"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.annualEnergySavings ||
                "Ετήσια ενεργειακή εξοικονόμηση") + " (€)"
            }
            type="number"
            value={formData.annual_energy_savings}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText={
              translations.autoCalculatedHelperText ||
              "Υπολογίζεται αυτόματα από τη διαφορά κόστους"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <>
                {translations.lifespanYears || "Χρονικό διάστημα"} (έτη){" "}
                <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.lifespan_years}
            onChange={(e) =>
              handleInputChange("lifespan_years", e.target.value)
            }
            error={validationErrors.lifespan_years}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <>
                {translations.discountRate || "Επιτόκιο αναγωγής"} (%){" "}
                <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.discount_rate}
            onChange={(e) => handleInputChange("discount_rate", e.target.value)}
            error={validationErrors.discount_rate}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <>
                {translations.annualOperatingExpenses ||
                  "Λειτουργικά έξοδα ανά έτος"}{" "}
                (€) <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.annual_operating_expenses}
            onChange={(e) =>
              handleInputChange("annual_operating_expenses", e.target.value)
            }
            error={validationErrors.annual_operating_expenses}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <>
                {translations.newSystemEfficiency || "Απόδοση νέου συστήματος"}{" "}
                (%) <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.new_system_efficiency * 100}
            onChange={(e) =>
              handleInputChange("new_system_efficiency", e.target.value / 100)
            }
            error={validationErrors.new_system_efficiency}
            variant="outlined"
            inputProps={{ min: 10, max: 100, step: 1 }}
            helperText="Απόδοση του νέου συστήματος φυσικού αερίου (10%-100%)"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Τιμή πετρελαίου (€/λίτρο)"
            type="number"
            value={formData.oil_price_per_liter}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText="Φορτώνεται αυτόματα από το έργο"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.naturalGasPricePerKwh || "Τιμή φυσικού αερίου") +
              " (€/m³)"
            }
            type="number"
            value={formData.natural_gas_price_per_kwh}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText="Φορτώνεται αυτόματα από το έργο"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </div>
  );

  const renderEconomicAnalysis = () => (
    <div className="space-y-4">
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.economicAnalysis || "Οικονομική Ανάλυση"}
      </Typography>

      <Grid container spacing={3}>
        {/* Total Investment Cost */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.totalCost || "Συνολικό κόστος επένδυσης (€)"}
            value={calculatedResults.total_investment_cost.toFixed(2)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        {/* Annual Economic Benefit */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.annualBenefit || "Ετήσιο οικονομικό όφελος (€)"}
            value={calculatedResults.annual_economic_benefit.toFixed(2)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        {/* Payback Period */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.paybackPeriod || "Περίοδος αποπληρωμής (έτη)"}
            value={calculatedResults.payback_period.toFixed(1)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        {/* Net Present Value */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.npv || "Καθαρή παρούσα αξία (€)"}
            value={calculatedResults.net_present_value.toFixed(2)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>

        {/* Internal Rate of Return */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.irr || "Εσωτερικός βαθμός απόδοσης (%)"}
            value={calculatedResults.internal_rate_of_return.toFixed(2)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-primary)",
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="bg-primary/10 p-2 rounded-full mr-3">
              <LocalGasStationIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Εγκατάσταση δικτύου φυσικού αερίου"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την εγκατάσταση δικτύου φυσικού αερίου"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              "&:hover": {
                backgroundColor: "var(--color-primary-dark)",
              },
            }}>
            {loading
              ? translations.saving || "Αποθήκευση..."
              : translations.save || "Αποθήκευση"}
          </Button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {errorKey && (
        <Alert
          severity="error"
          className="mb-4"
          onClose={() => setErrorKey(null)}>
          {translations[errorKey] || "Error"}
        </Alert>
      )}
      {successKey && (
        <Alert
          severity="success"
          className="mb-4"
          onClose={() => setSuccessKey(null)}>
          {translations[successKey] || "Success"}
        </Alert>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 3,
            pt: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            },
            "& .Mui-selected": {
              color: "var(--color-primary) !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-primary)",
            },
          }}>
          <Tab label={translations.systemComponents || "Στοιχεία Συστήματος"} />
          <Tab label={translations.economicData || "Οικονομικά Στοιχεία"} />
          <Tab label={translations.economicAnalysis || "Οικονομική Ανάλυση"} />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {renderSystemComponents()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderEconomicData()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderEconomicAnalysis()}
        </TabPanel>
      </div>
    </div>
  );
};

export default NaturalGasNetworkTabContent;
