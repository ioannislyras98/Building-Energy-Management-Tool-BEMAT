import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
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
  Divider,
} from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
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
      id={`hot-water-tabpanel-${index}`}
      aria-labelledby={`hot-water-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HotWaterUpgradeTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingUuid, setExistingUuid] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.HotWaterUpgradeTabContent || {}
      : greek_text.HotWaterUpgradeTabContent || {};
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
            energy_cost_kwh: response.data.cost_per_kwh_electricity || "",
          }));
        }
      },
      error: (jqXHR) => {
        console.error("Error fetching project data:", jqXHR);
      },
    });
  };

  const fetchExistingData = () => {
    $.ajax({
      url: `${API_BASE_URL}/hot_water_upgrades/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0];
          setExistingUuid(data.uuid);
          setFormData({
            solar_collectors_quantity: data.solar_collectors_quantity || "",
            solar_collectors_unit_price: data.solar_collectors_unit_price || "",
            metal_support_bases_quantity:
              data.metal_support_bases_quantity || "",
            metal_support_bases_unit_price:
              data.metal_support_bases_unit_price || "",
            solar_system_quantity: data.solar_system_quantity || 1,
            solar_system_unit_price: data.solar_system_unit_price || "",
            insulated_pipes_quantity: data.insulated_pipes_quantity || "",
            insulated_pipes_unit_price: data.insulated_pipes_unit_price || "",
            central_heater_installation_quantity:
              data.central_heater_installation_quantity || 1,
            central_heater_installation_unit_price:
              data.central_heater_installation_unit_price || "",
            electric_heater_power: data.electric_heater_power || "",
            operating_hours_per_year: data.operating_hours_per_year || "",
            solar_utilization_percentage:
              data.solar_utilization_percentage || 80,
            energy_cost_kwh: data.energy_cost_kwh || "",
            lifespan_years: data.lifespan_years || 10,
            discount_rate: data.discount_rate || 5,
            annual_operating_expenses: data.annual_operating_expenses || "",
          });

          // Update calculated results with values from backend
          setCalculatedResults({
            solar_collectors_subtotal: data.solar_collectors_subtotal || 0,
            metal_support_bases_subtotal:
              data.metal_support_bases_subtotal || 0,
            solar_system_subtotal: data.solar_system_subtotal || 0,
            insulated_pipes_subtotal: data.insulated_pipes_subtotal || 0,
            central_heater_installation_subtotal:
              data.central_heater_installation_subtotal || 0,
            total_investment_cost: data.total_investment_cost || 0,
            annual_energy_consumption_kwh:
              data.annual_energy_consumption_kwh || 0,
            annual_solar_savings_kwh: data.annual_solar_savings_kwh || 0,
            annual_economic_benefit: data.annual_economic_benefit || 0,
            payback_period: data.payback_period || 0,
            net_present_value: data.net_present_value || 0,
            internal_rate_of_return: data.internal_rate_of_return || 0,
          });
        }
      },
      error: (jqXHR) => {},
    });
  };

  const [formData, setFormData] = useState({
    solar_collectors_quantity: "",
    solar_collectors_unit_price: "",
    metal_support_bases_quantity: "",
    metal_support_bases_unit_price: "",
    solar_system_quantity: 1,
    solar_system_unit_price: "",
    insulated_pipes_quantity: "",
    insulated_pipes_unit_price: "",
    central_heater_installation_quantity: 1,
    central_heater_installation_unit_price: "",
    electric_heater_power: "",
    operating_hours_per_year: "",
    solar_utilization_percentage: 80,
    energy_cost_kwh: "",
    lifespan_years: 10,
    discount_rate: 5,
    annual_operating_expenses: "",
  });

  const [calculatedResults, setCalculatedResults] = useState({
    solar_collectors_subtotal: 0,
    metal_support_bases_subtotal: 0,
    solar_system_subtotal: 0,
    insulated_pipes_subtotal: 0,
    central_heater_installation_subtotal: 0,
    total_investment_cost: 0,
    annual_energy_consumption_kwh: 0,
    annual_solar_savings_kwh: 0,
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

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const calculateResults = useCallback(() => {
    const {
      solar_collectors_quantity,
      solar_collectors_unit_price,
      metal_support_bases_quantity,
      metal_support_bases_unit_price,
      solar_system_quantity,
      solar_system_unit_price,
      insulated_pipes_quantity,
      insulated_pipes_unit_price,
      central_heater_installation_quantity,
      central_heater_installation_unit_price,
      electric_heater_power,
      operating_hours_per_year,
      solar_utilization_percentage,
      energy_cost_kwh,
      lifespan_years,
      discount_rate,
      annual_operating_expenses,
    } = formData;
    const solarCollectorsSubtotal =
      parseFloat(solar_collectors_quantity || 0) *
      parseFloat(solar_collectors_unit_price || 0);
    const metalSupportBasesSubtotal =
      parseFloat(metal_support_bases_quantity || 0) *
      parseFloat(metal_support_bases_unit_price || 0);
    const solarSystemSubtotal =
      parseFloat(solar_system_quantity || 0) *
      parseFloat(solar_system_unit_price || 0);
    const insulatedPipesSubtotal =
      parseFloat(insulated_pipes_quantity || 0) *
      parseFloat(insulated_pipes_unit_price || 0);
    const centralHeaterSubtotal =
      parseFloat(central_heater_installation_quantity || 0) *
      parseFloat(central_heater_installation_unit_price || 0);
    const totalInvestmentCost =
      solarCollectorsSubtotal +
      metalSupportBasesSubtotal +
      solarSystemSubtotal +
      insulatedPipesSubtotal +
      centralHeaterSubtotal;
    const annualEnergyConsumption =
      electric_heater_power && operating_hours_per_year
        ? (parseFloat(electric_heater_power) *
            parseFloat(operating_hours_per_year)) /
          1000
        : 0;

    const annualSolarSavings =
      annualEnergyConsumption *
      (parseFloat(solar_utilization_percentage || 0) / 100);
    const annualEconomicBenefit =
      annualSolarSavings * parseFloat(energy_cost_kwh || 0);
    let paybackPeriod = 0;
    if (annualEconomicBenefit > 0 && totalInvestmentCost > 0) {
      paybackPeriod = totalInvestmentCost / annualEconomicBenefit;
    }
    const discountRateDecimal = parseFloat(discount_rate || 5) / 100.0;
    const years = parseInt(lifespan_years) || 10;
    const operatingExpenses = parseFloat(annual_operating_expenses || 0);
    let npv = 0;

    if (annualEconomicBenefit > 0) {
      for (let year = 1; year <= years; year++) {
        const netAnnualBenefit = annualEconomicBenefit - operatingExpenses;
        npv += netAnnualBenefit / Math.pow(1 + discountRateDecimal, year);
      }
      npv -= totalInvestmentCost;
    } else {
      npv = -totalInvestmentCost;
    }

    // Calculate IRR using Newton-Raphson method
    let irr = 0;
    const netAnnualBenefit = annualEconomicBenefit - operatingExpenses;

    if (totalInvestmentCost > 0 && netAnnualBenefit > 0 && years > 0) {
      let guess = 0.1; // Initial guess 10%
      const maxIterations = 1000;
      const tolerance = 0.00001;

      for (let i = 0; i < maxIterations; i++) {
        let npvAtGuess = -totalInvestmentCost;
        let derivativeNpv = 0;

        for (let year = 1; year <= years; year++) {
          const discountFactor = Math.pow(1 + guess, year);
          npvAtGuess += netAnnualBenefit / discountFactor;
          derivativeNpv -=
            (year * netAnnualBenefit) / Math.pow(1 + guess, year + 1);
        }

        // Check for convergence
        if (Math.abs(npvAtGuess) < tolerance) {
          irr = guess * 100;
          break;
        }

        // Newton-Raphson update
        if (Math.abs(derivativeNpv) > 0.000001) {
          guess = guess - npvAtGuess / derivativeNpv;
        } else {
          break;
        }

        // Keep guess within reasonable bounds
        if (guess < -0.99) guess = -0.99;
        if (guess > 10) guess = 10;
      }
    }

    setCalculatedResults({
      solar_collectors_subtotal: solarCollectorsSubtotal,
      metal_support_bases_subtotal: metalSupportBasesSubtotal,
      solar_system_subtotal: solarSystemSubtotal,
      insulated_pipes_subtotal: insulatedPipesSubtotal,
      central_heater_installation_subtotal: centralHeaterSubtotal,
      total_investment_cost: totalInvestmentCost,
      annual_energy_consumption_kwh: annualEnergyConsumption,
      annual_solar_savings_kwh: annualSolarSavings,
      annual_economic_benefit: annualEconomicBenefit,
      payback_period: paybackPeriod,
      net_present_value: npv,
      internal_rate_of_return: irr,
    });
  }, [formData]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // Update error message when language changes
  useEffect(() => {
    if (error && Object.values(validationErrors).some((err) => err)) {
      // If there's a validation error, update the message with the new language
      setError(
        translations.requiredFieldsError ||
          "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία στα Στοιχεία Συστήματος με τιμές μεγαλύτερες από 0"
      );
    }
  }, [language, translations]);

  const handleSubmit = () => {
    if (!buildingUuid || !token) {
      setError(translations.errorAuth || "Authentication required");
      return;
    }

    // Validate all required fields
    const newValidationErrors = {
      solar_collectors_quantity:
        !formData.solar_collectors_quantity ||
        parseFloat(formData.solar_collectors_quantity) <= 0,
      solar_collectors_unit_price:
        !formData.solar_collectors_unit_price ||
        parseFloat(formData.solar_collectors_unit_price) <= 0,
      metal_support_bases_quantity:
        !formData.metal_support_bases_quantity ||
        parseFloat(formData.metal_support_bases_quantity) <= 0,
      metal_support_bases_unit_price:
        !formData.metal_support_bases_unit_price ||
        parseFloat(formData.metal_support_bases_unit_price) <= 0,
      solar_system_quantity:
        !formData.solar_system_quantity ||
        parseFloat(formData.solar_system_quantity) <= 0,
      solar_system_unit_price:
        !formData.solar_system_unit_price ||
        parseFloat(formData.solar_system_unit_price) <= 0,
      insulated_pipes_quantity:
        !formData.insulated_pipes_quantity ||
        parseFloat(formData.insulated_pipes_quantity) <= 0,
      insulated_pipes_unit_price:
        !formData.insulated_pipes_unit_price ||
        parseFloat(formData.insulated_pipes_unit_price) <= 0,
      central_heater_installation_quantity:
        !formData.central_heater_installation_quantity ||
        parseFloat(formData.central_heater_installation_quantity) <= 0,
      central_heater_installation_unit_price:
        !formData.central_heater_installation_unit_price ||
        parseFloat(formData.central_heater_installation_unit_price) <= 0,
      electric_heater_power:
        !formData.electric_heater_power ||
        parseFloat(formData.electric_heater_power) <= 0,
      operating_hours_per_year:
        !formData.operating_hours_per_year ||
        parseFloat(formData.operating_hours_per_year) <= 0,
      solar_utilization_percentage:
        !formData.solar_utilization_percentage ||
        parseFloat(formData.solar_utilization_percentage) <= 0,
      lifespan_years:
        !formData.lifespan_years || parseFloat(formData.lifespan_years) <= 0,
      discount_rate:
        !formData.discount_rate || parseFloat(formData.discount_rate) <= 0,
      annual_operating_expenses:
        !formData.annual_operating_expenses ||
        parseFloat(formData.annual_operating_expenses) < 0,
    };

    setValidationErrors(newValidationErrors);

    // Check if there are any validation errors
    if (Object.values(newValidationErrors).some((error) => error)) {
      // Check which tab has errors
      const systemComponentsErrors = [
        "solar_collectors_quantity",
        "solar_collectors_unit_price",
        "metal_support_bases_quantity",
        "metal_support_bases_unit_price",
        "solar_system_quantity",
        "solar_system_unit_price",
        "insulated_pipes_quantity",
        "insulated_pipes_unit_price",
        "central_heater_installation_quantity",
        "central_heater_installation_unit_price",
      ].some((key) => newValidationErrors[key]);

      const economicDataErrors = [
        "electric_heater_power",
        "operating_hours_per_year",
        "solar_utilization_percentage",
        "lifespan_years",
        "discount_rate",
        "annual_operating_expenses",
      ].some((key) => newValidationErrors[key]);

      if (systemComponentsErrors && economicDataErrors) {
        setError(
          translations.requiredFieldsErrorBoth ||
            "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία στα Στοιχεία Συστήματος και Τα Οικονομικά Στοιχεία"
        );
        setTabValue(0);
      } else if (systemComponentsErrors) {
        setError(
          translations.requiredFieldsError ||
            "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία στα Στοιχεία Συστήματος με τιμές μεγαλύτερες από 0"
        );
        setTabValue(0);
      } else if (economicDataErrors) {
        setError(
          translations.requiredFieldsErrorEconomic ||
            "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία στα Οικονομικά Στοιχεία"
        );
        setTabValue(1);
      }
      return;
    }

    setLoading(true);
    setError(null);

    const submitData = {
      building: buildingUuid,
      project: projectUuid,
      ...formData,
      ...calculatedResults,
    };

    $.ajax({
      url: `${API_BASE_URL}/hot_water_upgrades/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (response) => {
        setSuccess(
          translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
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
                {translations.subtotal || "Υποσύνολο (€)"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Solar Collectors */}
            <TableRow>
              <TableCell>
                {translations.solarCollectors || "Ηλιακοί συλλέκτες"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  required
                  value={formData.solar_collectors_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "solar_collectors_quantity",
                      e.target.value
                    )
                  }
                  error={validationErrors.solar_collectors_quantity}
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
                  required
                  value={formData.solar_collectors_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "solar_collectors_unit_price",
                      e.target.value
                    )
                  }
                  error={validationErrors.solar_collectors_unit_price}
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
                {calculatedResults.solar_collectors_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Metal Support Bases */}
            <TableRow>
              <TableCell>
                {translations.metalSupportBases || "Μεταλλικές βάσεις στήριξης"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  required
                  value={formData.metal_support_bases_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "metal_support_bases_quantity",
                      e.target.value
                    )
                  }
                  error={validationErrors.metal_support_bases_quantity}
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
                  required
                  value={formData.metal_support_bases_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "metal_support_bases_unit_price",
                      e.target.value
                    )
                  }
                  error={validationErrors.metal_support_bases_unit_price}
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
                {calculatedResults.metal_support_bases_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Solar System */}
            <TableRow>
              <TableCell>
                {translations.solarSystem || "Ηλιακό σύστημα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  required
                  value={formData.solar_system_quantity}
                  onChange={(e) =>
                    handleInputChange("solar_system_quantity", e.target.value)
                  }
                  error={validationErrors.solar_system_quantity}
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
                  required
                  value={formData.solar_system_unit_price}
                  onChange={(e) =>
                    handleInputChange("solar_system_unit_price", e.target.value)
                  }
                  error={validationErrors.solar_system_unit_price}
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
                {calculatedResults.solar_system_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Insulated Pipes */}
            <TableRow>
              <TableCell>
                {translations.insulatedPipes ||
                  "Σωληνώσεις με μόνωση πάχους 9 mm"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  required
                  value={formData.insulated_pipes_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "insulated_pipes_quantity",
                      e.target.value
                    )
                  }
                  error={validationErrors.insulated_pipes_quantity}
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
                  required
                  value={formData.insulated_pipes_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "insulated_pipes_unit_price",
                      e.target.value
                    )
                  }
                  error={validationErrors.insulated_pipes_unit_price}
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
                {calculatedResults.insulated_pipes_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Central Heater Installation */}
            <TableRow>
              <TableCell>
                {translations.centralHeaterInstallation ||
                  "Εγκατάσταση κεντρικού θερμαντήρα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  required
                  value={formData.central_heater_installation_quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "central_heater_installation_quantity",
                      e.target.value
                    )
                  }
                  error={validationErrors.central_heater_installation_quantity}
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
                  required
                  value={formData.central_heater_installation_unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "central_heater_installation_unit_price",
                      e.target.value
                    )
                  }
                  error={
                    validationErrors.central_heater_installation_unit_price
                  }
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
                {calculatedResults.central_heater_installation_subtotal.toFixed(
                  2
                )}
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
              <>
                {translations.electricHeaterPower ||
                  "Ηλεκτρικός θερμοσίφωνας, ισχύς"}{" "}
                (W) <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.electric_heater_power}
            onChange={(e) =>
              handleInputChange("electric_heater_power", e.target.value)
            }
            variant="outlined"
            error={validationErrors.electric_heater_power}
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
                {translations.operatingHoursPerYear ||
                  "Ώρες λειτουργίας ανά έτος"}{" "}
                <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.operating_hours_per_year}
            onChange={(e) =>
              handleInputChange("operating_hours_per_year", e.target.value)
            }
            variant="outlined"
            error={validationErrors.operating_hours_per_year}
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
                {translations.solarUtilizationPercentage ||
                  "Ποσοστό αξιοποίησης ηλιακού θερμοσίφωνα"}{" "}
                (%) <span style={{ color: "red" }}>*</span>
              </>
            }
            type="number"
            value={formData.solar_utilization_percentage}
            onChange={(e) =>
              handleInputChange("solar_utilization_percentage", e.target.value)
            }
            variant="outlined"
            error={validationErrors.solar_utilization_percentage}
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
              (translations.energyCostKwh || "Κόστος ενέργειας") + " (€/kWh)"
            }
            type="number"
            value={formData.energy_cost_kwh}
            variant="outlined"
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
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
            helperText={
              translations.energyCostFromProject ||
              "Η τιμή προέρχεται από το έργο"
            }
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
            variant="outlined"
            error={validationErrors.lifespan_years}
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
            variant="outlined"
            error={validationErrors.discount_rate}
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
            variant="outlined"
            error={validationErrors.annual_operating_expenses}
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
              <WaterDropIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Αναβάθμιση συστήματος παραγωγής Ζ.Ν.Χ."}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την αναβάθμιση του συστήματος ζεστού νερού χρήσης"}
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
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          className="mb-4"
          onClose={() => setSuccess(null)}>
          {success}
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

export default HotWaterUpgradeTabContent;
