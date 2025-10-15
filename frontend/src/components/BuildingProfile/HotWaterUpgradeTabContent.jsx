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
import API_BASE_URL from "../../config/api";

// TabPanel component για τα tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hot-water-tabpanel-${index}`}
      aria-labelledby={`hot-water-tab-${index}`}
      {...other}
    >
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
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.HotWaterUpgradeTabContent || {}
      : greek_text.HotWaterUpgradeTabContent || {};

  // Fetch existing data on component mount
  useEffect(() => {
    if (buildingUuid && token) {
      fetchExistingData();
    }
  }, [buildingUuid, token]);

  const fetchExistingData = () => {
    $.ajax({
      url: `${API_BASE_URL}/hot_water_upgrades/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0]; // Get the first (latest) entry
          setFormData({
            solar_collectors_quantity: data.solar_collectors_quantity || "",
            solar_collectors_unit_price: data.solar_collectors_unit_price || "",
            metal_support_bases_quantity: data.metal_support_bases_quantity || "",
            metal_support_bases_unit_price: data.metal_support_bases_unit_price || "",
            solar_system_quantity: data.solar_system_quantity || 1,
            solar_system_unit_price: data.solar_system_unit_price || "",
            insulated_pipes_quantity: data.insulated_pipes_quantity || "",
            insulated_pipes_unit_price: data.insulated_pipes_unit_price || "",
            central_heater_installation_quantity: data.central_heater_installation_quantity || 1,
            central_heater_installation_unit_price: data.central_heater_installation_unit_price || "",
            electric_heater_power: data.electric_heater_power || "",
            operating_hours_per_year: data.operating_hours_per_year || "",
            solar_utilization_percentage: data.solar_utilization_percentage || 80,
            energy_cost_kwh: data.energy_cost_kwh || "",
            lifespan_years: data.lifespan_years || 10,
          });
        }
      },
      error: (jqXHR) => {
        // Silently fail - it's okay if no data exists yet
        console.log("No existing hot water upgrade data found");
      },
    });
  };

  const [formData, setFormData] = useState({
    // System Components
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
    
    // Economic Data
    electric_heater_power: "",
    operating_hours_per_year: "",
    solar_utilization_percentage: 80,
    energy_cost_kwh: "",
    lifespan_years: 10,
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

  // Auto-save with debouncing
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const autoSave = useCallback(() => {
    if (!buildingUuid || !token || !formData.solar_collectors_quantity || !formData.electric_heater_power) {
      return;
    }

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
        console.log("Hot water upgrade data auto-saved:", response);
        setSuccess(translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς");
        setTimeout(() => setSuccess(null), 3000);
      },
      error: (jqXHR) => {
        console.error("Error auto-saving hot water upgrade data:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
      },
    });
  }, [buildingUuid, projectUuid, token, formData, calculatedResults, translations]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-save with 1 second debouncing
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      autoSave();
    }, 1000);
    
    setDebounceTimeout(newTimeout);
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
    } = formData;

    // Calculate subtotals
    const solarCollectorsSubtotal = parseFloat(solar_collectors_quantity || 0) * parseFloat(solar_collectors_unit_price || 0);
    const metalSupportBasesSubtotal = parseFloat(metal_support_bases_quantity || 0) * parseFloat(metal_support_bases_unit_price || 0);
    const solarSystemSubtotal = parseFloat(solar_system_quantity || 0) * parseFloat(solar_system_unit_price || 0);
    const insulatedPipesSubtotal = parseFloat(insulated_pipes_quantity || 0) * parseFloat(insulated_pipes_unit_price || 0);
    const centralHeaterSubtotal = parseFloat(central_heater_installation_quantity || 0) * parseFloat(central_heater_installation_unit_price || 0);

    // Calculate total investment cost
    const totalInvestmentCost = solarCollectorsSubtotal + metalSupportBasesSubtotal + solarSystemSubtotal + insulatedPipesSubtotal + centralHeaterSubtotal;

    // Calculate energy consumption and savings
    const annualEnergyConsumption = electric_heater_power && operating_hours_per_year
      ? (parseFloat(electric_heater_power) * parseFloat(operating_hours_per_year)) / 1000
      : 0;

    const annualSolarSavings = annualEnergyConsumption * (parseFloat(solar_utilization_percentage || 0) / 100);

    // Calculate economic benefit
    const annualEconomicBenefit = annualSolarSavings * parseFloat(energy_cost_kwh || 0);

    // Calculate payback period
    let paybackPeriod = 0;
    if (annualEconomicBenefit > 0 && totalInvestmentCost > 0) {
      paybackPeriod = totalInvestmentCost / annualEconomicBenefit;
    }

    // Calculate NPV
    const discountRate = 0.05; // 5%
    const years = parseInt(lifespan_years) || 10;
    let npv = 0;

    if (annualEconomicBenefit > 0) {
      for (let year = 1; year <= years; year++) {
        npv += annualEconomicBenefit / Math.pow(1 + discountRate, year);
      }
      npv -= totalInvestmentCost;
    } else {
      npv = -totalInvestmentCost;
    }

    // Calculate IRR (simplified)
    const irr = totalInvestmentCost > 0 ? (annualEconomicBenefit / totalInvestmentCost) * 100 : 0;

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleSubmit = () => {
    if (!buildingUuid || !token) {
      setError(translations.errorAuth || "Authentication required");
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
        console.log("Hot water upgrade data saved:", response);
        setSuccess(
          translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error saving hot water upgrade data:", jqXHR);
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
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.systemComponents || "Στοιχεία Συστήματος"}
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "var(--color-primary)" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                {translations.itemType || "Είδος"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }} align="center">
                {translations.quantity || "Ποσότητα"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }} align="center">
                {translations.unitPrice || "Τιμή Μονάδας (€)"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }} align="center">
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
                  value={formData.solar_collectors_quantity}
                  onChange={(e) =>
                    handleInputChange("solar_collectors_quantity", e.target.value)
                  }
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
                  value={formData.solar_collectors_unit_price}
                  onChange={(e) =>
                    handleInputChange("solar_collectors_unit_price", e.target.value)
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
                  value={formData.metal_support_bases_quantity}
                  onChange={(e) =>
                    handleInputChange("metal_support_bases_quantity", e.target.value)
                  }
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
                  value={formData.metal_support_bases_unit_price}
                  onChange={(e) =>
                    handleInputChange("metal_support_bases_unit_price", e.target.value)
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
                  value={formData.solar_system_quantity}
                  onChange={(e) =>
                    handleInputChange("solar_system_quantity", e.target.value)
                  }
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
                  value={formData.solar_system_unit_price}
                  onChange={(e) =>
                    handleInputChange("solar_system_unit_price", e.target.value)
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
                {calculatedResults.solar_system_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Insulated Pipes */}
            <TableRow>
              <TableCell>
                {translations.insulatedPipes || "Σωληνώσεις με μόνωση πάχους 9 mm"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.insulated_pipes_quantity}
                  onChange={(e) =>
                    handleInputChange("insulated_pipes_quantity", e.target.value)
                  }
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
                  value={formData.insulated_pipes_unit_price}
                  onChange={(e) =>
                    handleInputChange("insulated_pipes_unit_price", e.target.value)
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
                {calculatedResults.insulated_pipes_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Central Heater Installation */}
            <TableRow>
              <TableCell>
                {translations.centralHeaterInstallation || "Εγκατάσταση κεντρικού θερμαντήρα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.central_heater_installation_quantity}
                  onChange={(e) =>
                    handleInputChange("central_heater_installation_quantity", e.target.value)
                  }
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
                  value={formData.central_heater_installation_unit_price}
                  onChange={(e) =>
                    handleInputChange("central_heater_installation_unit_price", e.target.value)
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
                {calculatedResults.central_heater_installation_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

  const renderEconomicData = () => (
    <div className="space-y-4">
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.economicData || "Οικονομικά Στοιχεία"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.electricHeaterPower || "Ηλεκτρικός θερμοσίφωνας, ισχύς") + " (W)"
            }
            type="number"
            value={formData.electric_heater_power}
            onChange={(e) =>
              handleInputChange("electric_heater_power", e.target.value)
            }
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
              (translations.operatingHoursPerYear || "Ώρες λειτουργίας ανά έτος")
            }
            type="number"
            value={formData.operating_hours_per_year}
            onChange={(e) =>
              handleInputChange("operating_hours_per_year", e.target.value)
            }
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
              (translations.solarUtilizationPercentage || "Ποσοστό αξιοποίησης ηλιακού θερμοσίφωνα") + " (%)"
            }
            type="number"
            value={formData.solar_utilization_percentage}
            onChange={(e) =>
              handleInputChange("solar_utilization_percentage", e.target.value)
            }
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
              (translations.energyCostKwh || "Κόστος ενέργειας") + " (€/kWh)"
            }
            type="number"
            value={formData.energy_cost_kwh}
            onChange={(e) =>
              handleInputChange("energy_cost_kwh", e.target.value)
            }
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
              (translations.lifespanYears || "Χρονικό διάστημα") + " (έτη)"
            }
            type="number"
            value={formData.lifespan_years}
            onChange={(e) =>
              handleInputChange("lifespan_years", e.target.value)
            }
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
      </Grid>
    </div>
  );

  const renderEconomicAnalysis = () => (
    <div className="space-y-4">
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
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

        {/* Annual Energy Consumption */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.annualEnergyConsumption || "Ετήσια κατανάλωση ενέργειας (kWh)"}
            value={calculatedResults.annual_energy_consumption_kwh.toFixed(2)}
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

        {/* Annual Solar Savings */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.annualSolarSavings || "Ετήσια ηλιακή εξοικονόμηση (kWh)"}
            value={calculatedResults.annual_solar_savings_kwh.toFixed(2)}
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

        {/* Energy Savings Percentage */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={translations.energySavingsPercentage || "Ποσοστό ενεργειακής εξοικονόμησης (%)"}
            value={formData.solar_utilization_percentage}
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
            }}
          >
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
        <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
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
          }}
        >
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
