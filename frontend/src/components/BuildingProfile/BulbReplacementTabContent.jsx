import React, { useState, useEffect, useCallback } from "react";
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
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
      id={`bulb-replacement-tabpanel-${index}`}
      aria-labelledby={`bulb-replacement-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BulbReplacementTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.BulbReplacementTabContent || {}
      : greek_text.BulbReplacementTabContent || {};

  // Fetch existing data on component mount
  useEffect(() => {
    if (buildingUuid && token) {
      fetchExistingData();
    }
  }, [buildingUuid, token]);

  const fetchExistingData = () => {
    $.ajax({
      url: `${API_BASE_URL}/bulb_replacements/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0]; // Get the first (latest) entry
          setFormData({
            old_bulb_type: data.old_bulb_type || "Λαμπτήρας Πυρακτώσεως",
            old_power_per_bulb: data.old_power_per_bulb || "",
            old_bulb_count: data.old_bulb_count || "",
            old_operating_hours: data.old_operating_hours || "",
            new_bulb_type: data.new_bulb_type || "LED Λαμπτήρας",
            new_power_per_bulb: data.new_power_per_bulb || "",
            new_bulb_count: data.new_bulb_count || "",
            new_operating_hours: data.new_operating_hours || "",
            cost_per_new_bulb: data.cost_per_new_bulb || "",
            installation_cost: data.installation_cost || "",
            energy_cost_kwh: data.energy_cost_kwh || "",
            maintenance_cost_annual: data.maintenance_cost_annual || "",
            lifespan_years: data.lifespan_years || "",
          });
        }
      },
      error: (jqXHR) => {
        // Silently fail - it's okay if no data exists yet
        console.log("No existing bulb replacement data found");
      },
    });
  };

  const [formData, setFormData] = useState({
    old_bulb_type: "Λαμπτήρας Πυρακτώσεως",
    old_power_per_bulb: "",
    old_bulb_count: "",
    old_operating_hours: "",
    new_bulb_type: "LED Λαμπτήρας",
    new_power_per_bulb: "",
    new_bulb_count: "",
    new_operating_hours: "",
    // Οικονομικά στοιχεία
    cost_per_new_bulb: "",
    installation_cost: "",
    energy_cost_kwh: "",
    maintenance_cost_annual: "",
    lifespan_years: "",
  });

  // Επιλογές τύπων λαμπτήρων
  const oldBulbTypes = [
    "Λαμπτήρας Πυρακτώσεως",
    "Αλογόνος Λαμπτήρας",
    "Λαμπτήρας Φθορισμού",
    "Συμπαγής Λαμπτήρας Φθορισμού (CFL)",
    "Λαμπτήρας Υδραργύρου",
  ];

  const newBulbTypes = [
    "LED Λαμπτήρας",
    "LED COB (Chip on Board)",
    "LED Filament",
    "OLED Λαμπτήρας",
    "Ενεργειακός Λαμπτήρας Φθορισμού",
  ];

  const [calculatedResults, setCalculatedResults] = useState({
    old_consumption_kwh: 0,
    new_consumption_kwh: 0,
    energy_savings_kwh: 0,
    total_investment_cost: 0,
    annual_cost_savings: 0,
    payback_period: 0,
    net_present_value: 0,
    internal_rate_of_return: 0,
  });

  // Auto-save with debouncing
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const autoSave = useCallback(() => {
    if (!buildingUuid || !token || !formData.old_power_per_bulb || !formData.old_bulb_count || !formData.new_power_per_bulb || !formData.new_bulb_count) {
      return;
    }

    const submitData = {
      building: buildingUuid,
      project: projectUuid,
      ...formData,
      ...calculatedResults,
    };

    $.ajax({
      url: `${API_BASE_URL}/bulb_replacements/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (response) => {
        console.log("Bulb replacement data auto-saved:", response);
        setSuccess(translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς");
        setTimeout(() => setSuccess(null), 3000);
      },
      error: (jqXHR) => {
        console.error("Error auto-saving bulb replacement data:", jqXHR);
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
      old_power_per_bulb,
      old_bulb_count,
      old_operating_hours,
      new_power_per_bulb,
      new_bulb_count,
      new_operating_hours,
      cost_per_new_bulb,
      installation_cost,
      energy_cost_kwh,
      maintenance_cost_annual,
      lifespan_years,
    } = formData;

    // Calculate consumption
    let oldConsumption = 0;
    let newConsumption = 0;

    if (old_power_per_bulb && old_bulb_count && old_operating_hours) {
      oldConsumption =
        (parseFloat(old_power_per_bulb) *
          parseFloat(old_bulb_count) *
          parseFloat(old_operating_hours)) /
        1000;
    }

    if (new_power_per_bulb && new_bulb_count && new_operating_hours) {
      newConsumption =
        (parseFloat(new_power_per_bulb) *
          parseFloat(new_bulb_count) *
          parseFloat(new_operating_hours)) /
        1000;
    }

    const energySavings = oldConsumption - newConsumption;

    let totalInvestmentCost = 0;
    let annualCostSavings = 0;
    let paybackPeriod = 0;
    let npv = 0;
    let irr = 0;

    // Calculate investment cost
    if (new_bulb_count && cost_per_new_bulb) {
      const bulbCost =
        parseFloat(new_bulb_count) * parseFloat(cost_per_new_bulb);
      const instCost = parseFloat(installation_cost || 0);
      totalInvestmentCost = bulbCost + instCost;
    }

    // Calculate annual savings
    if (energySavings > 0 && energy_cost_kwh) {
      annualCostSavings = energySavings * parseFloat(energy_cost_kwh);
    }

    // Calculate payback period
    if (annualCostSavings > 0 && totalInvestmentCost > 0) {
      paybackPeriod = totalInvestmentCost / annualCostSavings;

      // Calculate NPV
      const discountRate = 0.05; // 5%
      const years = parseFloat(lifespan_years) || 10;
      let pvSavings = 0;

      for (let year = 1; year <= years; year++) {
        pvSavings +=
          (annualCostSavings - parseFloat(maintenance_cost_annual || 0)) /
          Math.pow(1 + discountRate, year);
      }

      npv = pvSavings - totalInvestmentCost;

      // Calculate IRR (simplified)
      irr = (annualCostSavings / totalInvestmentCost) * 100;
    }

    setCalculatedResults({
      old_consumption_kwh: oldConsumption,
      new_consumption_kwh: newConsumption,
      energy_savings_kwh: energySavings,
      total_investment_cost: totalInvestmentCost,
      annual_cost_savings: annualCostSavings,
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
      url: `${API_BASE_URL}/bulb_replacements/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (response) => {
        console.log("Bulb replacement data saved:", response);
        setSuccess(
          translations.successSave || "Τα δεδομένα αποθηκεύτηκαν επιτυχώς"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error saving bulb replacement data:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
        setLoading(false);
      },
    });
  };

  const renderOldLightingSystem = () => (
    <div className="space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-red-700 mb-4">
            {translations.oldLightingSystem || "Παλαιό Σύστημα Φωτισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="old-bulb-type-label">
              {translations.oldBulbType || "Τύπος παλαιού φορτίου"}
            </InputLabel>
            <Select
              labelId="old-bulb-type-label"
              value={formData.old_bulb_type}
              label={translations.oldBulbType || "Τύπος παλαιού φορτίου"}
              onChange={(e) =>
                handleInputChange("old_bulb_type", e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
              }}>
              {oldBulbTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.oldPowerPerBulb || "Ισχύς παλαιού φορτίου") +
              " (W) *"
            }
            type="number"
            value={formData.old_power_per_bulb}
            onChange={(e) =>
              handleInputChange("old_power_per_bulb", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.oldBulbCount || "Πλήθος παλαιών λαμπτήρων") + " *"
            }
            type="number"
            value={formData.old_bulb_count}
            onChange={(e) =>
              handleInputChange("old_bulb_count", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.oldOperatingHours || "Ώρες λειτουργίας ανά έτος") +
              " *"
            }
            type="number"
            value={formData.old_operating_hours}
            onChange={(e) =>
              handleInputChange("old_operating_hours", e.target.value)
            }
            variant="outlined"
            required
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

      {/* Old System Calculation Card */}
      <Card sx={{ mt: 3, backgroundColor: "#fef2f2" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.calculatedConsumption || "Υπολογιζόμενη Κατανάλωση - Παλαιό Σύστημα"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.oldConsumption || "Κατανάλωση παλαιών λαμπτήρων"}
              </Typography>
              <Typography variant="h6" color="error">
                {calculatedResults.old_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Συνολική Ισχύς Παλαιού Συστήματος
              </Typography>
              <Typography variant="h6" color="error">
                {(formData.old_power_per_bulb * formData.old_bulb_count / 1000).toFixed(2)} kW
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

  const renderNewLightingSystem = () => (
    <div className="space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-green-700 mb-4">
            {translations.newLightingSystem || "Νέο Σύστημα Φωτισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="new-bulb-type-label">
              {translations.newBulbType || "Τύπος νέου φορτίου"}
            </InputLabel>
            <Select
              labelId="new-bulb-type-label"
              value={formData.new_bulb_type}
              label={translations.newBulbType || "Τύπος νέου φορτίου"}
              onChange={(e) =>
                handleInputChange("new_bulb_type", e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
              }}>
              {newBulbTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.newPowerPerBulb || "Ισχύς νέου φορτίου") + " (W) *"
            }
            type="number"
            value={formData.new_power_per_bulb}
            onChange={(e) =>
              handleInputChange("new_power_per_bulb", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.newBulbCount || "Πλήθος νέων λαμπτήρων") + " *"
            }
            type="number"
            value={formData.new_bulb_count}
            onChange={(e) =>
              handleInputChange("new_bulb_count", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.newOperatingHours || "Ώρες λειτουργίας ανά έτος") +
              " *"
            }
            type="number"
            value={formData.new_operating_hours}
            onChange={(e) =>
              handleInputChange("new_operating_hours", e.target.value)
            }
            variant="outlined"
            required
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

      {/* New System Calculation Card */}
      <Card sx={{ mt: 3, backgroundColor: "#f0fdf4" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.calculatedConsumption || "Υπολογιζόμενη Κατανάλωση - Νέο Σύστημα"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.newConsumption || "Κατανάλωση νέων λαμπτήρων"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.new_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Συνολική Ισχύς Νέου Συστήματος
              </Typography>
              <Typography variant="h6" color="success.main">
                {(formData.new_power_per_bulb * formData.new_bulb_count / 1000).toFixed(2)} kW
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.energySavings || "Ενεργειακή εξοικονόμηση"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.energy_savings_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

  const renderEconomicData = () => (
    <div className="space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-blue-700 mb-4">
            {translations.economicData || "Οικονομικά Στοιχεία"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.costPerNewBulb || "Κόστος ανά νέο λαμπτήρα") +
              " (€)"
            }
            type="number"
            value={formData.cost_per_new_bulb}
            onChange={(e) =>
              handleInputChange("cost_per_new_bulb", e.target.value)
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
              (translations.installationCost || "Κόστος εγκατάστασης") + " (€)"
            }
            type="number"
            value={formData.installation_cost}
            onChange={(e) =>
              handleInputChange("installation_cost", e.target.value)
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
              (translations.lifespanYears || "Διάρκεια ζωής") +
              " (" +
              (translations.years || "έτη") +
              ")"
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
              (translations.maintenanceCostAnnual ||
                "Ετήσιο κόστος συντήρησης") + " (€)"
            }
            type="number"
            value={formData.maintenance_cost_annual}
            onChange={(e) =>
              handleInputChange("maintenance_cost_annual", e.target.value)
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

  // Old function removed - content split into separate tab functions
    <div className="space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {translations.bulbReplacementData ||
              "Στοιχεία αντικατάστασης λαμπτήρων"}
          </Typography>
        </Grid>

        {/* Old Lighting System */}
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-red-700 mb-4">
            {translations.oldLightingSystem || "Παλαιό Σύστημα Φωτισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="old-bulb-type-label">
              {translations.oldBulbType || "Τύπος παλαιού φορτίου"}
            </InputLabel>
            <Select
              labelId="old-bulb-type-label"
              value={formData.old_bulb_type}
              label={translations.oldBulbType || "Τύπος παλαιού φορτίου"}
              onChange={(e) =>
                handleInputChange("old_bulb_type", e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
              }}>
              {oldBulbTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.oldPowerPerBulb || "Ισχύς παλαιού φορτίου") +
              " (W) *"
            }
            type="number"
            value={formData.old_power_per_bulb}
            onChange={(e) =>
              handleInputChange("old_power_per_bulb", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.oldBulbCount || "Πλήθος παλαιών λαμπτήρων") + " *"
            }
            type="number"
            value={formData.old_bulb_count}
            onChange={(e) =>
              handleInputChange("old_bulb_count", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.oldOperatingHours || "Ώρες λειτουργίας ανά έτος") +
              " *"
            }
            type="number"
            value={formData.old_operating_hours}
            onChange={(e) =>
              handleInputChange("old_operating_hours", e.target.value)
            }
            variant="outlined"
            required
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

        {/* New Lighting System */}
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className="font-semibold text-green-700 mb-4 mt-6">
            {translations.newLightingSystem || "Νέο Σύστημα Φωτισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="new-bulb-type-label">
              {translations.newBulbType || "Τύπος νέου φορτίου"}
            </InputLabel>
            <Select
              labelId="new-bulb-type-label"
              value={formData.new_bulb_type}
              label={translations.newBulbType || "Τύπος νέου φορτίου"}
              onChange={(e) =>
                handleInputChange("new_bulb_type", e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-primary)",
                },
              }}>
              {newBulbTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.newPowerPerBulb || "Ισχύς νέου φορτίου") + " (W) *"
            }
            type="number"
            value={formData.new_power_per_bulb}
            onChange={(e) =>
              handleInputChange("new_power_per_bulb", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.newBulbCount || "Πλήθος νέων λαμπτήρων") + " *"
            }
            type="number"
            value={formData.new_bulb_count}
            onChange={(e) =>
              handleInputChange("new_bulb_count", e.target.value)
            }
            variant="outlined"
            required
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
              (translations.newOperatingHours || "Ώρες λειτουργίας ανά έτος") +
              " *"
            }
            type="number"
            value={formData.new_operating_hours}
            onChange={(e) =>
              handleInputChange("new_operating_hours", e.target.value)
            }
            variant="outlined"
            required
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

        {/* Economic Data */}
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className="font-semibold text-green-700 mb-4 mt-6">
            {translations.economicData || "Οικονομικά Στοιχεία"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.costPerNewBulb || "Κόστος ανά νέο λαμπτήρα") +
              " (€)"
            }
            type="number"
            value={formData.cost_per_new_bulb}
            onChange={(e) =>
              handleInputChange("cost_per_new_bulb", e.target.value)
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
              (translations.installationCost || "Κόστος εγκατάστασης") + " (€)"
            }
            type="number"
            value={formData.installation_cost}
            onChange={(e) =>
              handleInputChange("installation_cost", e.target.value)
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
              (translations.lifespanYears || "Διάρκεια ζωής") +
              " (" +
              (translations.years || "έτη") +
              ")"
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
              (translations.maintenanceCostAnnual ||
                "Ετήσιο κόστος συντήρησης") + " (€)"
            }
            type="number"
            value={formData.maintenance_cost_annual}
            onChange={(e) =>
              handleInputChange("maintenance_cost_annual", e.target.value)
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

      {/* Calculation Card for Consumption */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.calculatedConsumption || "Υπολογιζόμενη Κατανάλωση"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.oldConsumption || "Κατανάλωση παλαιών λαμπτήρων"}
              </Typography>
              <Typography variant="h6" color="error">
                {calculatedResults.old_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.newConsumption || "Κατανάλωση νέων λαμπτήρων"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.new_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.energySavings || "Ενεργειακή εξοικονόμηση"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.energy_savings_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  const renderEnergyBenefits = () => (
    <div className="space-y-4">
      <Typography variant="h6" className="font-semibold text-green-700 mb-4">
        {translations.energyBenefits || "Ενεργειακά Οφέλη"}
      </Typography>

      {/* Energy Benefits Card */}
      <Card sx={{ backgroundColor: "#e8f5e8" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.energyAnalysis || "Ανάλυση Ενεργειακής Απόδοσης"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.oldAnnualConsumption ||
                  "Παλαιά ετήσια κατανάλωση"}
              </Typography>
              <Typography variant="h6" color="error">
                {calculatedResults.old_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.newAnnualConsumption || "Νέα ετήσια κατανάλωση"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.new_consumption_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.annualSavings || "Ετήσια εξοικονόμηση"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.energy_savings_kwh.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.efficiencyImprovement || "Βελτίωση Απόδοσης"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.old_consumption_kwh > 0
                  ? (
                      (calculatedResults.energy_savings_kwh /
                        calculatedResults.old_consumption_kwh) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" className="font-semibold mb-3">
          {translations.detailedAnalysis || "Λεπτομερής Ανάλυση"}
        </Typography>
        <Typography variant="body1" className="mb-2">
          • {translations.powerReduction || "Μείωση ισχύος ανά λαμπτήρα"}:{" "}
          {formData.old_power_per_bulb && formData.new_power_per_bulb
            ? (
                parseFloat(formData.old_power_per_bulb) -
                parseFloat(formData.new_power_per_bulb)
              ).toFixed(1)
            : 0}{" "}
          W
        </Typography>
        <Typography variant="body1" className="mb-2">
          • {translations.totalOldPower || "Συνολική παλαιά ισχύς"}:{" "}
          {formData.old_power_per_bulb && formData.old_bulb_count
            ? (
                parseFloat(formData.old_power_per_bulb) *
                parseFloat(formData.old_bulb_count)
              ).toFixed(0)
            : 0}{" "}
          W
        </Typography>
        <Typography variant="body1">
          • {translations.totalNewPower || "Συνολική νέα ισχύς"}:{" "}
          {formData.new_power_per_bulb && formData.new_bulb_count
            ? (
                parseFloat(formData.new_power_per_bulb) *
                parseFloat(formData.new_bulb_count)
              ).toFixed(0)
            : 0}{" "}
          W
        </Typography>
      </Paper>
    </div>
  );

  const renderEconomicBenefits = () => (
    <div className="space-y-4">
      <Typography variant="h6" gutterBottom>
        {translations.economicAnalysis || "Οικονομική Ανάλυση"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`${translations.totalCost || "Συνολικό κόστος (€)"} - ${
              translations.autoCalculated || "Αυτόματος Υπολογισμός"
            }`}
            type="text"
            value={calculatedResults.total_investment_cost.toLocaleString(
              "el-GR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-primary)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-primary)",
              },
            }}
            helperText={
              translations.autoCalculatedCostHelper ||
              "Υπολογίζεται αυτόματα από τον αριθμό λαμπτήρων και το κόστος ανά τεμάχιο"
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`${translations.annualBenefit || "Ετήσιο όφελος (€)"} - ${
              translations.autoCalculated || "Αυτόματος Υπολογισμός"
            }`}
            type="text"
            value={calculatedResults.annual_cost_savings.toLocaleString(
              "el-GR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-success)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-success)",
              },
            }}
            helperText={
              translations.autoCalculatedBenefitHelper ||
              "Υπολογίζεται αυτόματα βάσει ενεργειακής εξοικονόμησης και κόστους ενέργειας"
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              (translations.timePeriodYears || "Χρονικό διάστημα") +
              " (" +
              (translations.years || "έτη") +
              ")"
            }
            type="number"
            value={formData.lifespan_years || 10}
            onChange={(e) =>
              handleInputChange("lifespan_years", e.target.value)
            }
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

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={
              (translations.annualOperatingCosts ||
                "Λειτουργικά έξοδα ανά έτος") + " (€)"
            }
            type="number"
            value={formData.maintenance_cost_annual || ""}
            onChange={(e) =>
              handleInputChange("maintenance_cost_annual", e.target.value)
            }
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

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={(translations.discountRate || "Επιτόκιο αναγωγής") + " (%)"}
            type="number"
            value={5} // Προεπιλεγμένη τιμή 5%
            InputProps={{ readOnly: true }}
            inputProps={{ step: 0.1, min: 0, max: 100 }}
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

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={translations.netPresentValue || "Καθαρή παρούσα αξία (€)"}
            type="text"
            value={calculatedResults.net_present_value.toLocaleString("el-GR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color:
                  calculatedResults.net_present_value >= 0 ? "green" : "red",
                fontWeight: "bold",
              },
            }}
            helperText={
              translations.npvHelperText ||
              "Θετική τιμή δείχνει κερδοφόρα επένδυση"
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={translations.paybackPeriod || "Περίοδος Αποπληρωμής (έτη)"}
            type="text"
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
            }}
            helperText={
              translations.paybackHelperText ||
              "Χρόνος που χρειάζεται για την ανάκτηση της επένδυσης"
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={translations.irr || "Εσωτερικός Βαθμός Απόδοσης (%)"}
            type="text"
            value={calculatedResults.internal_rate_of_return.toFixed(2)}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                color: "var(--color-success)",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-root": {
                color: "var(--color-success)",
              },
            }}
            helperText={
              translations.irrHelperText || "Απόδοση της επένδυσης ως ποσοστό"
            }
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
              <LightbulbIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Αντικατάσταση λαμπτήρων πυράκτωσης"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση λαμπτήρων πυράκτωσης"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              "&:hover": {
                backgroundColor: "var(--color-primary-dark)",
              },
            }}>
            {loading ? (translations.saving || "Αποθήκευση...") : (translations.save || "Αποθήκευση")}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
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
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
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
          <Tab label={translations.oldLightingSystem || "Παλαιό Σύστημα Φωτισμού"} />
          <Tab label={translations.newLightingSystem || "Νέο Σύστημα Φωτισμού"} />
          <Tab label={translations.economicData || "Οικονομικά Στοιχεία"} />
          <Tab label={translations.energyBenefits || "Ενεργειακά Οφέλη"} />
          <Tab label={translations.economicBenefits || "Οικονομικά Οφέλη"} />
        </Tabs>

        {/* Tab 1: Παλαιό Σύστημα Φωτισμού */}
        <TabPanel value={activeTab} index={0}>
          {renderOldLightingSystem()}
        </TabPanel>

        {/* Tab 2: Νέο Σύστημα Φωτισμού */}
        <TabPanel value={activeTab} index={1}>
          {renderNewLightingSystem()}
        </TabPanel>

        {/* Tab 3: Οικονομικά Στοιχεία */}
        <TabPanel value={activeTab} index={2}>
          {renderEconomicData()}
        </TabPanel>

        {/* Tab 4: Ενεργειακά Οφέλη */}
        <TabPanel value={activeTab} index={3}>
          {renderEnergyBenefits()}
        </TabPanel>

        {/* Tab 5: Οικονομικά Οφέλη */}
        <TabPanel value={activeTab} index={4}>
          {renderEconomicBenefits()}
        </TabPanel>
      </div>
    </div>
  );
};

export default BulbReplacementTabContent;
