import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import axios from "axios";
import {
  Button,
  Card,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  TextField,
  Alert,
  CardContent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
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
      id={`boiler-replacement-tabpanel-${index}`}
      aria-labelledby={`boiler-replacement-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BoilerReplacementTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorField, setErrorField] = useState(null); 
  const [success, setSuccess] = useState(null);
  const [hasBoilerSystemEfficiency, setHasBoilerSystemEfficiency] = useState(false);
  const [formData, setFormData] = useState({
    // Συντελεστές απόδοσης
    old_boiler_efficiency: "",
    new_boiler_efficiency: "",
    // Κόστη λέβητα
    boiler_cost: "",
    installation_cost: "",
    maintenance_cost: "",
    // Ενεργειακά στοιχεία
    annual_heating_consumption_liters: "",
    heating_oil_savings_liters: "",
    oil_price_per_liter: "",
    time_period: "20",
    discount_rate: "5.0",
  });

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.BoilerReplacementTabContent || {}
      : greek_text.BoilerReplacementTabContent || {};

  const cookies = new Cookies();
  const token = cookies.get("token");
  const validateRequiredFields = () => {
    const requiredFields = {
      old_boiler_efficiency: {
        label: translations.oldBoilerEfficiency || "Απόδοση παλιού λέβητα",
        errorKey: "oldBoilerEfficiencyRequired",
      },
      new_boiler_efficiency: {
        label: translations.newBoilerEfficiency || "Απόδοση νέου λέβητα",
        errorKey: "newBoilerEfficiencyRequired",
      },
      boiler_cost: {
        label: translations.boilerCost || "Κόστος λέβητα",
        errorKey: "boilerCostRequired",
      },
      annual_heating_consumption_liters: {
        label: translations.annualHeatingConsumptionLiters || "Ετήσια κατανάλωση θέρμανσης",
        errorKey: "annualHeatingConsumptionLitersRequired",
      },
    };

    for (const [field, config] of Object.entries(requiredFields)) {
      const value = formData[field];
      if (!value || value === "" || parseFloat(value) <= 0) {
        setErrorField(config.errorKey);
        const errorMessage = translations[config.errorKey] || `Το πεδίο "${config.label}" είναι υποχρεωτικό`;
        setError(errorMessage);
        return false;
      }
    }

    // Έλεγχος ότι η απόδοση του νέου λέβητα είναι καλύτερη
    const oldEfficiency = parseFloat(formData.old_boiler_efficiency);
    const newEfficiency = parseFloat(formData.new_boiler_efficiency);
    if (newEfficiency <= oldEfficiency) {
      setError(translations.efficiencyImprovementRequired || "Η απόδοση του νέου λέβητα πρέπει να είναι μεγαλύτερη από την απόδοση του παλιού");
      return false;
    }

    return true;
  };
  useEffect(() => {
    if (errorField && translations[errorField]) {
      setError(translations[errorField]);
    }
  }, [language, errorField, translations]);
  useEffect(() => {
    fetchBoilerReplacementData();
  }, [buildingUuid, projectUuid]);

  // Παίρνουμε την απόδοση του παλιού λέβητα από το σύστημα λέβητα
  useEffect(() => {
    if (buildingData?.heating_system?.efficiency && !formData.old_boiler_efficiency) {
      setFormData(prev => ({
        ...prev,
        old_boiler_efficiency: buildingData.heating_system.efficiency
      }));
      setHasBoilerSystemEfficiency(true);
    } else if (buildingData?.heating_system?.efficiency) {
      setHasBoilerSystemEfficiency(true);
    }
  }, [buildingData]);

  const fetchBoilerReplacementData = async () => {
    if (!buildingUuid || !projectUuid) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/boiler_replacement/building/${buildingUuid}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      setFormData({
        // Συντελεστές απόδοσης
        old_boiler_efficiency: data.old_boiler_efficiency || "",
        new_boiler_efficiency: data.new_boiler_efficiency || "",
        // Κόστη λέβητα
        boiler_cost: data.boiler_cost || "",
        installation_cost: data.installation_cost || "",
        maintenance_cost: data.maintenance_cost || "",
        // Ενεργειακά στοιχεία
        annual_heating_consumption_liters: data.annual_heating_consumption_liters || "",
        heating_oil_savings_liters: data.heating_oil_savings_liters || "",
        oil_price_per_liter: data.oil_price_per_liter || params?.oil_price_per_liter || "",
        time_period: data.time_period || "20",
        discount_rate: data.discount_rate || "5.0",
        // Υπολογιζόμενα πεδία
        total_investment_cost: data.total_investment_cost,
        annual_energy_savings: data.annual_energy_savings,
        annual_economic_benefit: data.annual_economic_benefit,
        payback_period: data.payback_period,
        net_present_value: data.net_present_value,
        internal_rate_of_return: data.internal_rate_of_return,
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        setError("Σφάλμα κατά την φόρτωση των δεδομένων");
      } else {
        // Αν δεν υπάρχουν αποθηκευμένα δεδομένα, συμπλήρωσε την τιμή πετρελαίου από το project
        setFormData(prev => ({
          ...prev,
          oil_price_per_liter: params?.oil_price_per_liter || ""
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (showMessage = true) => {
    if (!buildingUuid || !projectUuid) {
      setError("Λείπουν απαραίτητα δεδομένα κτιρίου ή έργου");
      return;
    }
    if (!validateRequiredFields()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        building: buildingUuid,
        project: projectUuid,
        ...formData,
      };

      // Remove empty string fields to let backend use defaults
      if (dataToSend.installation_cost === "") {
        delete dataToSend.installation_cost;
      }
      if (dataToSend.maintenance_cost === "") {
        delete dataToSend.maintenance_cost;
      }

      const response = await $.ajax({
        url: `${API_BASE_URL}/boiler_replacement/create/`,
        type: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(dataToSend),
      });

      if (response) {
        setFormData((prev) => ({
          ...prev,
          total_investment_cost: response.total_investment_cost,
          annual_energy_savings: response.annual_energy_savings,
          annual_economic_benefit: response.annual_economic_benefit,
          payback_period: response.payback_period,
          net_present_value: response.net_present_value,
          internal_rate_of_return: response.internal_rate_of_return,
        }));

        if (showMessage) {
          setSuccess("Τα δεδομένα αποθηκεύτηκαν επιτυχώς!");
          setTimeout(() => setSuccess(null), 3000);
        }
        setError(null);
        setErrorField(null);
      }
    } catch (error) {
      if (showMessage) {
        setError("Σφάλμα κατά την αποθήκευση των δεδομένων");
        setTimeout(() => {
          setError(null);
          setErrorField(null);
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBoilerData = () => {
    return (
      <Grid container spacing={3}>
        {/* Συντελεστές Απόδοσης */}
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {translations.efficiencyData || "Συντελεστές Απόδοσης"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.oldBoilerEfficiency || "Απόδοση παλιού λέβητα"} (%){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.old_boiler_efficiency}
            onChange={(e) => handleInputChange("old_boiler_efficiency", e.target.value)}
            variant="outlined"
            InputProps={{ readOnly: hasBoilerSystemEfficiency }}
            helperText={hasBoilerSystemEfficiency ? "Αυτόματη ανάκτηση από το σύστημα λέβητα" : ""}
            inputProps={{ step: 0.1, min: 0.1, max: 100 }}
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
              <span>
                {translations.newBoilerEfficiency || "Απόδοση νέου λέβητα"} (%){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.new_boiler_efficiency}
            onChange={(e) => handleInputChange("new_boiler_efficiency", e.target.value)}
            variant="outlined"
            inputProps={{ step: 0.1, min: 0.1, max: 100 }}
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

        {/* Κόστη Λέβητα */}
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4 mt-4">
            {translations.boilerCostData || "Κόστη Λέβητα"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.boilerCost || "Κόστος νέου λέβητα"} (€){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.boiler_cost}
            onChange={(e) => handleInputChange("boiler_cost", e.target.value)}
            variant="outlined"
            inputProps={{ step: 0.01, min: 0 }}
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

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={
              (translations.installationCost || "Κόστος εγκατάστασης") + " (€)"
            }
            type="number"
            value={formData.installation_cost}
            onChange={(e) =>
              handleInputChange("installation_cost", e.target.value)
            }
            variant="outlined"
            inputProps={{ step: 0.01, min: 0 }}
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

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={
              (translations.maintenanceCost || "Ετήσιο κόστος συντήρησης") +
              " (€/έτος)"
            }
            type="number"
            value={formData.maintenance_cost}
            onChange={(e) =>
              handleInputChange("maintenance_cost", e.target.value)
            }
            variant="outlined"
            inputProps={{ step: 0.01, min: 0 }}
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
    );
  };

  const renderEnergyData = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className="font-semibold text-green-700 mb-4">
            {translations.energyData || "Ενεργειακά Στοιχεία"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.annualHeatingConsumptionLiters || "Ετήσια κατανάλωση θέρμανσης"} (λίτρα/έτος){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.annual_heating_consumption_liters}
            onChange={(e) =>
              handleInputChange("annual_heating_consumption_liters", e.target.value)
            }
            variant="outlined"
            inputProps={{ step: 1, min: 0 }}
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
              (translations.heatingOilSavingsLiters || "Εξοικονόμηση πετρελαίου") + " (λίτρα/έτος)"
            }
            type="number"
            value={formData.heating_oil_savings_liters}
            variant="outlined"
            helperText="Αυτόματος υπολογισμός με βάση τους συντελεστές απόδοσης"
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
              (translations.oilPricePerLiter || "Τιμή πετρελαίου") + " (€/λίτρο)"
            }
            type="number"
            value={formData.oil_price_per_liter}
            variant="outlined"
            helperText="Αυτόματη ανάκτηση από τα στοιχεία του έργου"
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
    );
  };

  const renderEvaluationParameters = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-primary">
            {translations.evaluationParameters || "Παράμετροι Αξιολόγησης"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={(translations.timePeriod || "Χρονικό διάστημα") + " (έτη)"}
            type="number"
            value={formData.time_period}
            onChange={(e) => handleInputChange("time_period", e.target.value)}
            variant="outlined"
            inputProps={{ step: 1, min: 1, max: 50 }}
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
              (translations.discountRate || "Επιτόκιο αναγωγής") +
              " (%)"
            }
            type="number"
            value={formData.discount_rate}
            onChange={(e) => handleInputChange("discount_rate", e.target.value)}
            variant="outlined"
            inputProps={{ step: 0.1, min: 0, max: 30 }}
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
    );
  };

  const renderEconomicAnalysis = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className="font-semibold text-green-700 mb-4">
            {translations.economicAnalysis || "Οικονομική Ανάλυση"}
          </Typography>
        </Grid>

        {/* Κόστος Επένδυσης */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              translations.totalInvestmentCost ||
              "Συνολικό κόστος επένδυσης (€)"
            }
            type="text"
            value={
              formData.total_investment_cost
                ? parseFloat(formData.total_investment_cost).toLocaleString()
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.totalInvestmentCostHelper ||
              "Αυτόματος υπολογισμός: Κόστος λέβητα + Κόστος εγκατάστασης"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: "red",
                fontWeight: "bold",
              },
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

        {/* Ετήσια Ενεργειακή Εξοικονόμηση */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              translations.annualEnergySavings ||
              "Ετήσια ενεργειακή εξοικονόμηση (€)"
            }
            type="text"
            value={
              formData.annual_energy_savings !== undefined && formData.annual_energy_savings !== null
                ? parseFloat(formData.annual_energy_savings).toLocaleString() + ' €'
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.annualEnergySavingsHelper ||
              "Αυτόματος υπολογισμός: Εξοικονόμηση λιτρών × Τιμή πετρελαίου"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: formData.annual_energy_savings >= 0 ? "green" : "red",
                fontWeight: "bold",
              },
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

        {/* Ετήσιο Οικονομικό Όφελος */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              translations.annualEconomicBenefit ||
              "Ετήσιο οικονομικό όφελος (€)"
            }
            type="text"
            value={
              formData.annual_economic_benefit !== undefined && formData.annual_economic_benefit !== null
                ? parseFloat(formData.annual_economic_benefit).toLocaleString() + ' €'
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.annualEconomicBenefitHelper ||
              "Αυτόματος υπολογισμός: Εξοικονόμηση - Κόστος συντήρησης"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: formData.annual_economic_benefit >= 0 ? "green" : "red",
                fontWeight: "bold",
              },
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

        {/* Περίοδος Αποπληρωμής */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={translations.paybackPeriod || "Περίοδος αποπληρωμής (έτη)"}
            type="text"
            value={
              formData.payback_period !== undefined && formData.payback_period !== null
                ? (parseFloat(formData.payback_period) > 0
                    ? parseFloat(formData.payback_period).toFixed(1) + ' έτη'
                    : 'Δεν αποπληρώνεται')
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.paybackPeriodHelper ||
              "Αυτόματος υπολογισμός: Κόστος επένδυσης ÷ Ετήσιο όφελος"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: formData.payback_period > 0 ? "var(--color-primary)" : "red",
                fontWeight: "bold",
              },
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

        {/* NPV */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              translations.netPresentValue || "Καθαρή παρούσα αξία - NPV (€)"
            }
            type="text"
            value={
              formData.net_present_value !== undefined && formData.net_present_value !== null
                ? parseFloat(formData.net_present_value).toLocaleString() + ' €'
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.npvHelper ||
              "Αυτόματος υπολογισμός NPV με προεξοφλητικό συντελεστή"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: formData.net_present_value >= 0 ? "green" : "red",
                fontWeight: "bold",
              },
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

        {/* IRR */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              translations.internalRateOfReturn ||
              "Εσωτερικός βαθμός απόδοσης - IRR (%)"
            }
            type="text"
            value={
              formData.internal_rate_of_return !== undefined && formData.internal_rate_of_return !== null
                ? (parseFloat(formData.internal_rate_of_return) > 0
                    ? parseFloat(formData.internal_rate_of_return).toFixed(2) + '%'
                    : 'Μη κερδοφόρα επένδυση')
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.irrHelper ||
              "Αυτόματος υπολογισμός IRR"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: formData.internal_rate_of_return > 0 ? "var(--color-primary)" : "red",
                fontWeight: "bold",
              },
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
    );
  };

  if (loading && !formData.boiler_cost) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">
            {translations.loading || "Φόρτωση..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Αντικατάσταση Λέβητα"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Οικονομική ανάλυση αντικατάστασης λέβητα"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(true)}
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

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => {
            setError(null);
            setErrorField(null);
          }}
          sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}>
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
          <Tab label={translations.boilerDataTab || "Σύστημα Λέβητα"} />
          <Tab label={translations.energyDataTab || "Ενεργειακά Στοιχεία"} />
          <Tab
            label={
              translations.evaluationParametersTab || "Παράμετροι Αξιολόγησης"
            }
          />
          <Tab
            label={translations.economicAnalysisTab || "Οικονομική Ανάλυση"}
          />
        </Tabs>

        {/* Tab 1: Στοιχεία Νέου Λέβητα */}
        <TabPanel value={tabValue} index={0}>
          {renderBoilerData()}
        </TabPanel>

        {/* Tab 2: Ενεργειακά Στοιχεία */}
        <TabPanel value={tabValue} index={1}>
          {renderEnergyData()}
        </TabPanel>

        {/* Tab 3: Παράμετροι Αξιολόγησης */}
        <TabPanel value={tabValue} index={2}>
          {renderEvaluationParameters()}
        </TabPanel>

        {/* Tab 4: Οικονομική Ανάλυση */}
        <TabPanel value={tabValue} index={3}>
          {renderEconomicAnalysis()}
        </TabPanel>
      </div>
    </div>
  );
};

export default BoilerReplacementTabContent;
