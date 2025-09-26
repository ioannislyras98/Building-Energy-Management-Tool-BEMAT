import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
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

// TabPanel component για τα tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`automatic-lighting-tabpanel-${index}`}
      aria-labelledby={`automatic-lighting-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AutomaticLightingControlTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorField, setErrorField] = useState(null); // Αποθήκευση του πεδίου που έχει error
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    lighting_area: "",
    cost_per_m2: "",
    installation_cost: "",
    maintenance_cost: "",
    lighting_energy_savings: "",
    energy_cost_kwh: "0.15",
    time_period: "20",
    discount_rate: "5.0",
  });

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.AutomaticLightingControlTabContent || {}
      : greek_text.AutomaticLightingControlTabContent || {};

  const cookies = new Cookies();
  const token = cookies.get("token");

  // Validation για υποχρεωτικά πεδία
  const validateRequiredFields = () => {
    const requiredFields = {
      lighting_area: {
        label: translations.lightingArea || "Επιφάνεια φωτισμού",
        errorKey: "lightingAreaRequired",
      },
      cost_per_m2: {
        label: translations.costPerM2 || "Κόστος ανά m²",
        errorKey: "costPerM2Required",
      },
      lighting_energy_savings: {
        label:
          translations.lightingEnergySavings ||
          "Εξοικονόμηση ενέργειας φωτισμού",
        errorKey: "lightingEnergySavingsRequired",
      },
    };

    for (const [field, config] of Object.entries(requiredFields)) {
      const value = formData[field];
      if (!value || value === "" || parseFloat(value) <= 0) {
        // Αποθήκευση του πεδίου που έχει error για δυναμική ανανέωση
        setErrorField(config.errorKey);
        const errorMessage = translations[config.errorKey];
        setError(errorMessage);
        return false;
      }
    }
    return true;
  };

  // Δυναμική ανανέωση error message όταν αλλάζει η γλώσσα
  useEffect(() => {
    if (errorField && translations[errorField]) {
      setError(translations[errorField]);
    }
  }, [language, errorField, translations]);

  // Φόρτωση δεδομένων κατά την αρχικοποίηση
  useEffect(() => {
    fetchAutomaticLightingControlData();
  }, [buildingUuid, projectUuid]);

  const fetchAutomaticLightingControlData = async () => {
    if (!buildingUuid || !projectUuid) return;

    setLoading(true);
    try {
      // Χρήση fetch αντί για jQuery για καλύτερο έλεγχο του error handling
      const response = await fetch(
        `http://127.0.0.1:8000/automatic_lighting_control/building/${buildingUuid}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({
          lighting_area: data.lighting_area || "",
          cost_per_m2: data.cost_per_m2 || "",
          installation_cost: data.installation_cost || "",
          maintenance_cost: data.maintenance_cost || "",
          lighting_energy_savings: data.lighting_energy_savings || "",
          energy_cost_kwh: data.energy_cost_kwh || "0.15",
          time_period: data.time_period || "20",
          discount_rate: data.discount_rate || "5.0",
          // Προσθήκη των υπολογιζόμενων πεδίων
          total_investment_cost: data.total_investment_cost,
          annual_energy_savings: data.annual_energy_savings,
          annual_economic_benefit: data.annual_economic_benefit,
          payback_period: data.payback_period,
          net_present_value: data.net_present_value,
          internal_rate_of_return: data.internal_rate_of_return,
        });
      } else if (response.status === 404) {
        // Αν δεν υπάρχει record, κρατάμε τις default τιμές για νέο record
        // Δε χρειάζεται να κάνουμε τίποτα - οι default τιμές είναι ήδη στο state
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error.message && !error.message.includes("404")) {
        console.error("Error fetching automatic lighting control data:", error);
        setError("Σφάλμα κατά την φόρτωση των δεδομένων");
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

    // Έλεγχος υποχρεωτικών πεδίων
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

      const response = await $.ajax({
        url: "http://127.0.0.1:8000/automatic_lighting_control/create/",
        type: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(dataToSend),
      });

      if (response) {
        // Ενημέρωση των υπολογιζόμενων πεδίων
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
      console.error("Error saving automatic lighting control data:", error);
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

  const renderLightingSystemData = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {translations.lightingSystemData || "Στοιχεία Συστήματος Φωτισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.lightingArea || "Επιφάνεια φωτισμού"} (m²){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.lighting_area}
            onChange={(e) => handleInputChange("lighting_area", e.target.value)}
            variant="outlined"
            inputProps={{ step: 0.1, min: 0.1 }}
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
                {translations.costPerM2 || "Κόστος ανά m²"} (€){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.cost_per_m2}
            onChange={(e) => handleInputChange("cost_per_m2", e.target.value)}
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

        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.maintenanceCost || "Ετήσιο κόστος συντήρησης") +
              " (€)"
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
                {translations.lightingEnergySavings ||
                  "Εξοικονόμηση ενέργειας φωτισμού"}{" "}
                (kWh/έτος) <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.lighting_energy_savings}
            onChange={(e) =>
              handleInputChange("lighting_energy_savings", e.target.value)
            }
            variant="outlined"
            inputProps={{ step: 0.1, min: 0 }}
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
              (translations.discountRate || "Προεξοφλητικός συντελεστής") +
              " (%)"
            }
            type="number"
            value={formData.discount_rate}
            onChange={(e) => handleInputChange("discount_rate", e.target.value)}
            variant="outlined"
            inputProps={{ step: 0.1, min: 0, max: 30 }}
            helperText={
              translations.discountRateHelper ||
              "Σταθερή τιμή 5% για τους υπολογισμούς NPV"
            }
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
              "Αυτόματος υπολογισμός: (Επιφάνεια × Κόστος/m²) + Κόστος εγκατάστασης"
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
              formData.annual_energy_savings
                ? parseFloat(formData.annual_energy_savings).toLocaleString()
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.annualEnergySavingsHelper ||
              "Αυτόματος υπολογισμός: Εξοικονόμηση kWh × Κόστος ενέργειας"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: "green",
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
              formData.annual_economic_benefit
                ? parseFloat(formData.annual_economic_benefit).toLocaleString()
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
                color: "green",
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
              formData.payback_period
                ? parseFloat(formData.payback_period).toFixed(1)
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
                color: "var(--color-primary)",
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
              formData.net_present_value
                ? parseFloat(formData.net_present_value).toLocaleString()
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
              formData.internal_rate_of_return
                ? parseFloat(formData.internal_rate_of_return).toFixed(2)
                : ""
            }
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText={
              translations.irrHelper ||
              "Αυτόματος υπολογισμός IRR (απλοποιημένος)"
            }
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
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

  if (loading && !formData.lighting_area) {
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title ||
                  "Εγκατάσταση Συστήματος Αυτόματου Ελέγχου Φωτισμού"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Οικονομική ανάλυση συστήματος αυτόματου ελέγχου φωτισμού"}
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
          <Tab
            label={
              translations.lightingSystemDataTab ||
              "Στοιχεία Συστήματος Φωτισμού"
            }
          />
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

        {/* Tab 1: Στοιχεία Συστήματος Φωτισμού */}
        <TabPanel value={tabValue} index={0}>
          {renderLightingSystemData()}
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

export default AutomaticLightingControlTabContent;
