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
import API_BASE_URL from "../../config/api";

// TabPanel component για τα tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`natural-gas-tabpanel-${index}`}
      aria-labelledby={`natural-gas-tab-${index}`}
      {...other}
    >
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.NaturalGasNetworkTabContent || {}
      : greek_text.NaturalGasNetworkTabContent || {};

  const [formData, setFormData] = useState({
    // System Components
    burner_replacement_quantity: "",
    burner_replacement_unit_price: "",
    gas_pipes_quantity: "",
    gas_pipes_unit_price: "",
    gas_detection_systems_quantity: "",
    gas_detection_systems_unit_price: "",
    boiler_cleaning_quantity: "",
    boiler_cleaning_unit_price: "",
    
    // Economic Data
    current_energy_cost_per_year: "",
    natural_gas_cost_per_year: "",
    annual_energy_savings: "",
    lifespan_years: 15,
    new_system_efficiency: 0.90,
    natural_gas_price_per_kwh: "",
  });

  // Fetch existing data on component mount
  useEffect(() => {
    if (buildingUuid && token) {
      fetchExistingData();
    }
  }, [buildingUuid, token]);

  // Always calculate energy cost when component mounts or building data changes
  useEffect(() => {
    if (buildingData && buildingData.annual_energy_cost) {
      setFormData(prev => ({
        ...prev,
        current_energy_cost_per_year: buildingData.annual_energy_cost
      }));
    } else if (buildingUuid && token) {
      // Always fetch energy consumptions to calculate current energy cost
      fetchEnergyConsumptions();
    }
  }, [buildingData, buildingUuid, token]);

  // Also fetch energy consumptions when existing data is loaded but no energy cost is set
  useEffect(() => {
    if (!formData.current_energy_cost_per_year && buildingUuid && token) {
      fetchEnergyConsumptions();
    }
  }, [formData, buildingUuid, token]);

  // Auto-calculate annual energy savings when current cost and natural gas cost are available
  useEffect(() => {
    const currentCost = parseFloat(formData.current_energy_cost_per_year || 0);
    const gasCost = parseFloat(formData.natural_gas_cost_per_year || 0);
    
    if (currentCost > 0 && gasCost > 0) {
      const savings = currentCost - gasCost;
      if (savings !== parseFloat(formData.annual_energy_savings || 0)) {
        setFormData(prev => ({
          ...prev,
          annual_energy_savings: savings.toFixed(2)
        }));
      }
    }
  }, [formData.current_energy_cost_per_year, formData.natural_gas_cost_per_year]);

  const fetchEnergyConsumptions = () => {
    $.ajax({
      url: `${API_BASE_URL}/energy_consumptions/get_by_building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response && response.length > 0) {
          // Calculate total annual energy cost from all energy consumptions
          const totalAnnualCost = response.reduce((sum, consumption) => {
            const kwhEquivalent = consumption.kwh_equivalent || 0;
            
            // Get energy cost per kWh based on energy source
            let energyCostPerKwh = 0.15; // Default fallback
            
            if (consumption.energy_source === 'electricity') {
              // Use electricity cost rate
              if (params && params.cost_per_kwh_electricity) {
                energyCostPerKwh = parseFloat(params.cost_per_kwh_electricity);
              } else if (buildingData && buildingData.project && buildingData.project.cost_per_kwh_electricity) {
                energyCostPerKwh = parseFloat(buildingData.project.cost_per_kwh_electricity);
              }
            } else {
              // Use fuel cost rate for natural gas, heating oil, biomass
              if (params && params.cost_per_kwh_fuel) {
                energyCostPerKwh = parseFloat(params.cost_per_kwh_fuel);
              } else if (buildingData && buildingData.project && buildingData.project.cost_per_kwh_fuel) {
                energyCostPerKwh = parseFloat(buildingData.project.cost_per_kwh_fuel);
              } else {
                energyCostPerKwh = 0.10; // Default fuel cost fallback
              }
            }
            
            return sum + (kwhEquivalent * energyCostPerKwh);
          }, 0);

          if (totalAnnualCost > 0) {
            setFormData(prev => ({
              ...prev,
              current_energy_cost_per_year: totalAnnualCost.toFixed(2)
            }));
          }
        }
      },
      error: (jqXHR) => {
        console.log("Could not fetch energy consumptions for cost calculation");
      },
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
          const data = response.data[0]; // Get the first (latest) entry
          setFormData(prev => ({
            ...prev,
            burner_replacement_quantity: data.burner_replacement_quantity || "",
            burner_replacement_unit_price: data.burner_replacement_unit_price || "",
            gas_pipes_quantity: data.gas_pipes_quantity || "",
            gas_pipes_unit_price: data.gas_pipes_unit_price || "",
            gas_detection_systems_quantity: data.gas_detection_systems_quantity || "",
            gas_detection_systems_unit_price: data.gas_detection_systems_unit_price || "",
            boiler_cleaning_quantity: data.boiler_cleaning_quantity || "",
            boiler_cleaning_unit_price: data.boiler_cleaning_unit_price || "",
            // Use the current_energy_cost_per_year from backend (already calculated with proper logic)
            current_energy_cost_per_year: data.current_energy_cost_per_year || "",
            natural_gas_cost_per_year: data.natural_gas_cost_per_year || "",
            annual_energy_savings: data.annual_energy_savings || "",
            lifespan_years: data.lifespan_years || 15,
            new_system_efficiency: data.new_system_efficiency || 0.90,
            natural_gas_price_per_kwh: data.natural_gas_price_per_kwh || "",
          }));
        } else if (response.success && response.current_energy_cost_per_year !== undefined) {
          // No existing natural gas network data, but we have calculated energy cost from backend
          setFormData(prev => ({
            ...prev,
            current_energy_cost_per_year: response.current_energy_cost_per_year.toString()
          }));
        }
      },
      error: (jqXHR) => {
        // Silently fail - it's okay if no data exists yet
        console.log("No existing natural gas network data found");
      },
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

  // Auto-save with debouncing
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const autoSave = useCallback(() => {
    if (!buildingUuid || !token) {
      return;
    }

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
        console.log("Natural gas network data auto-saved:", response);
        setSuccess(translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς");
        setTimeout(() => setSuccess(null), 3000);
      },
      error: (jqXHR) => {
        console.error("Error auto-saving natural gas network data:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
      },
    });
  }, [buildingUuid, projectUuid, token, formData, calculatedResults, translations]);

  // Trigger recalculation when efficiency or gas price changes
  useEffect(() => {
    if (buildingUuid && token && (formData.new_system_efficiency || formData.natural_gas_price_per_kwh)) {
      // Trigger auto-save to recalculate natural gas cost
      const timeout = setTimeout(() => {
        autoSave();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [formData.new_system_efficiency, formData.natural_gas_price_per_kwh, buildingUuid, token, autoSave]);

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
      lifespan_years,
    } = formData;

    // Calculate subtotals
    const burnerReplacementSubtotal = parseFloat(burner_replacement_quantity || 0) * parseFloat(burner_replacement_unit_price || 0);
    const gasPipesSubtotal = parseFloat(gas_pipes_quantity || 0) * parseFloat(gas_pipes_unit_price || 0);
    const gasDetectionSystemsSubtotal = parseFloat(gas_detection_systems_quantity || 0) * parseFloat(gas_detection_systems_unit_price || 0);
    const boilerCleaningSubtotal = parseFloat(boiler_cleaning_quantity || 0) * parseFloat(boiler_cleaning_unit_price || 0);

    // Calculate total investment cost
    const totalInvestmentCost = burnerReplacementSubtotal + gasPipesSubtotal + gasDetectionSystemsSubtotal + boilerCleaningSubtotal;

    // Calculate economic benefit
    let annualEconomicBenefit = 0;
    if (current_energy_cost_per_year && natural_gas_cost_per_year) {
      annualEconomicBenefit = parseFloat(current_energy_cost_per_year) - parseFloat(natural_gas_cost_per_year);
    } else if (annual_energy_savings) {
      annualEconomicBenefit = parseFloat(annual_energy_savings);
    }

    // Calculate payback period
    let paybackPeriod = 0;
    if (annualEconomicBenefit > 0 && totalInvestmentCost > 0) {
      paybackPeriod = totalInvestmentCost / annualEconomicBenefit;
    }

    // Calculate NPV
    const discountRate = 0.05; // 5%
    const years = parseInt(lifespan_years) || 15;
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
      burner_replacement_subtotal: burnerReplacementSubtotal,
      gas_pipes_subtotal: gasPipesSubtotal,
      gas_detection_systems_subtotal: gasDetectionSystemsSubtotal,
      boiler_cleaning_subtotal: boilerCleaningSubtotal,
      total_investment_cost: totalInvestmentCost,
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
      url: `${API_BASE_URL}/natural_gas_networks/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (response) => {
        console.log("Natural gas network data saved:", response);
        setSuccess(
          translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error saving natural gas network data:", jqXHR);
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
                    handleInputChange("burner_replacement_quantity", e.target.value)
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
                  value={formData.burner_replacement_unit_price}
                  onChange={(e) =>
                    handleInputChange("burner_replacement_unit_price", e.target.value)
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
                {calculatedResults.burner_replacement_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Gas Pipes */}
            <TableRow>
              <TableCell>
                {translations.gasPipes || "Γαλβανισμένος σιδηροσωλήνας κατάλληλος για φυσικό αέριο μαζί με τα απαραίτητα μικρουλικά, βάνες, φίλτρα κ.λπ."}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_pipes_quantity}
                  onChange={(e) =>
                    handleInputChange("gas_pipes_quantity", e.target.value)
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
                  value={formData.gas_pipes_unit_price}
                  onChange={(e) =>
                    handleInputChange("gas_pipes_unit_price", e.target.value)
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
                {calculatedResults.gas_pipes_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Gas Detection Systems */}
            <TableRow>
              <TableCell>
                {translations.gasDetectionSystems || "Συστήματα Ανίχνευσης διαρροής φυσικού αερίου"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.gas_detection_systems_quantity}
                  onChange={(e) =>
                    handleInputChange("gas_detection_systems_quantity", e.target.value)
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
                  value={formData.gas_detection_systems_unit_price}
                  onChange={(e) =>
                    handleInputChange("gas_detection_systems_unit_price", e.target.value)
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
                {calculatedResults.gas_detection_systems_subtotal.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Boiler Cleaning */}
            <TableRow>
              <TableCell>
                {translations.boilerCleaning || "Καθαρισμός λέβητα, ένωση και ρύθμιση καυστήρα"}
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  value={formData.boiler_cleaning_quantity}
                  onChange={(e) =>
                    handleInputChange("boiler_cleaning_quantity", e.target.value)
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
                  value={formData.boiler_cleaning_unit_price}
                  onChange={(e) =>
                    handleInputChange("boiler_cleaning_unit_price", e.target.value)
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
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--color-primary)", mb: 2 }}>
        {translations.economicData || "Οικονομικά Στοιχεία"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.currentEnergyCostPerYear || "Τρέχον ετήσιο κόστος ενέργειας") + " (€)"
            }
            type="number"
            value={formData.current_energy_cost_per_year}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText={translations.autoCalculatedHelperText || "Υπολογίζεται αυτόματα από τις ενεργειακές καταναλώσεις του κτιρίου"}
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
              (translations.naturalGasCostPerYear || "Ετήσιο κόστος φυσικού αερίου") + " (€)"
            }
            type="number"
            value={formData.natural_gas_cost_per_year}
            InputProps={{ readOnly: true }}
            variant="outlined"
            helperText={translations.autoCalculatedHelperText || "Υπολογίζεται αυτόματα από τη θερμική απαίτηση και την απόδοση του συστήματος"}
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
              (translations.annualEnergySavings || "Ετήσια ενεργειακή εξοικονόμηση") + " (€)"
            }
            type="number"
            value={formData.annual_energy_savings}
            onChange={(e) =>
              handleInputChange("annual_energy_savings", e.target.value)
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.newSystemEfficiency || "Απόδοση νέου συστήματος") + " (%)"
            }
            type="number"
            value={formData.new_system_efficiency * 100}
            onChange={(e) =>
              handleInputChange("new_system_efficiency", e.target.value / 100)
            }
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
            label={
              (translations.naturalGasPricePerKwh || "Τιμή φυσικού αερίου") + " (€/kWh)"
            }
            type="number"
            value={formData.natural_gas_price_per_kwh}
            onChange={(e) =>
              handleInputChange("natural_gas_price_per_kwh", e.target.value)
            }
            variant="outlined"
            helperText="Εάν δεν συμπληρωθεί, θα χρησιμοποιηθεί η τιμή καυσίμου από το έργο"
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

export default NaturalGasNetworkTabContent;
