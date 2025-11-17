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
} from "@mui/material";
import WindowIcon from "@mui/icons-material/Window";
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
      id={`window-replacement-tabpanel-${index}`}
      aria-labelledby={`window-replacement-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WindowReplacementTabContent = ({
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
      ? english_text.WindowReplacementTabContent || {}
      : greek_text.WindowReplacementTabContent || {};
  useEffect(() => {
    if (buildingUuid && token) {
      fetchExistingData();
    }
  }, [buildingUuid, token]);

  const fetchExistingData = () => {
    $.ajax({
      url: `${API_BASE_URL}/window_replacements/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const data = response.data[0]; // Get the first (latest) entry
          setFormData({
            old_thermal_conductivity: data.old_thermal_conductivity || "",
            new_thermal_conductivity: data.new_thermal_conductivity || "",
            window_area: data.window_area || "",
            old_losses_summer: data.old_losses_summer || "",
            old_losses_winter: data.old_losses_winter || "",
            new_losses_summer: data.new_losses_summer || "",
            new_losses_winter: data.new_losses_winter || "",
            cost_per_sqm: data.cost_per_sqm || "",
            energy_cost_kwh: data.energy_cost_kwh || "",
            maintenance_cost_annual: data.maintenance_cost_annual || "",
            lifespan_years: data.lifespan_years || "",
          });
        }
      },
      error: (jqXHR) => {

      },
    });
  };

  const [formData, setFormData] = useState({
    old_thermal_conductivity: "",
    new_thermal_conductivity: "",
    window_area: "",
    old_losses_summer: "",
    old_losses_winter: "",
    new_losses_summer: "",
    new_losses_winter: "",
    cost_per_sqm: "",
    energy_cost_kwh: "",
    maintenance_cost_annual: "",
    lifespan_years: "",
  });

  const [calculatedResults, setCalculatedResults] = useState({
    energy_savings_summer: 0,
    energy_savings_winter: 0,
    total_energy_savings: 0,
    annual_cost_savings: 0,
    total_investment_cost: 0,
    payback_period: 0,
    net_present_value: 0,
    internal_rate_of_return: 0,
  });
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const autoSave = useCallback(() => {
    if (
      !buildingUuid ||
      !token ||
      !formData.old_thermal_conductivity ||
      !formData.new_thermal_conductivity ||
      !formData.window_area
    ) {
      return;
    }

    const submitData = {
      building: buildingUuid,
      project: projectUuid,
      ...formData,
      ...calculatedResults,
    };

    // Remove empty string fields to avoid validation errors
    if (submitData.cost_per_sqm === "") {
      delete submitData.cost_per_sqm;
    }
    if (submitData.maintenance_cost_annual === "") {
      delete submitData.maintenance_cost_annual;
    }

    $.ajax({
      url: `${API_BASE_URL}/window_replacements/create/`,
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
        setTimeout(() => setSuccess(null), 3000);
      },
      error: (jqXHR) => {

        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
      },
    });
  }, [
    buildingUuid,
    projectUuid,
    token,
    formData,
    calculatedResults,
    translations,
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (
      [
        "old_thermal_conductivity",
        "new_thermal_conductivity",
        "window_area",
      ].includes(field)
    ) {
      calculateLosses(
        field === "old_thermal_conductivity"
          ? value
          : formData.old_thermal_conductivity,
        field === "new_thermal_conductivity"
          ? value
          : formData.new_thermal_conductivity,
        field === "window_area" ? value : formData.window_area
      );
    }
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      autoSave();
    }, 1000);

    setDebounceTimeout(newTimeout);
  };

  const calculateLosses = (oldK, newK, area) => {
    if (oldK && newK && area) {
      const oldKValue = parseFloat(oldK);
      const newKValue = parseFloat(newK);
      const areaValue = parseFloat(area);
      const summerTempDiff = 10; // °C
      const winterTempDiff = 20; // °C
      const hoursPerSeason = 2190; // 6 μήνες x 365 ημέρες / 2

      const oldLossesSummer =
        (oldKValue * areaValue * summerTempDiff * hoursPerSeason) / 1000;
      const oldLossesWinter =
        (oldKValue * areaValue * winterTempDiff * hoursPerSeason) / 1000;
      const newLossesSummer =
        (newKValue * areaValue * summerTempDiff * hoursPerSeason) / 1000;
      const newLossesWinter =
        (newKValue * areaValue * winterTempDiff * hoursPerSeason) / 1000;

      setFormData((prev) => ({
        ...prev,
        old_losses_summer: oldLossesSummer.toFixed(2),
        old_losses_winter: oldLossesWinter.toFixed(2),
        new_losses_summer: newLossesSummer.toFixed(2),
        new_losses_winter: newLossesWinter.toFixed(2),
      }));
    }
  };

  const calculateResults = useCallback(() => {
    const {
      old_losses_summer,
      old_losses_winter,
      new_losses_summer,
      new_losses_winter,
      window_area,
      cost_per_sqm,
      energy_cost_kwh,
      maintenance_cost_annual,
      lifespan_years,
    } = formData;

    if (
      old_losses_summer &&
      old_losses_winter &&
      new_losses_summer &&
      new_losses_winter
    ) {
      const energySavingsSummer =
        parseFloat(old_losses_summer) - parseFloat(new_losses_summer);
      const energySavingsWinter =
        parseFloat(old_losses_winter) - parseFloat(new_losses_winter);
      const totalEnergySavings = energySavingsSummer + energySavingsWinter;

      let annualCostSavings = 0;
      let totalInvestmentCost = 0;
      let paybackPeriod = 0;
      let npv = 0;
      let irr = 0;

      if (energy_cost_kwh) {
        annualCostSavings = totalEnergySavings * parseFloat(energy_cost_kwh);
      }

      if (window_area && cost_per_sqm) {
        totalInvestmentCost =
          parseFloat(window_area) * parseFloat(cost_per_sqm);
      }

      if (annualCostSavings > 0 && totalInvestmentCost > 0) {
        paybackPeriod = totalInvestmentCost / annualCostSavings;
        const discountRate = 0.05; // 5%
        const years = parseFloat(lifespan_years) || 20;
        let pvSavings = 0;

        for (let year = 1; year <= years; year++) {
          pvSavings +=
            (annualCostSavings - parseFloat(maintenance_cost_annual || 0)) /
            Math.pow(1 + discountRate, year);
        }

        npv = pvSavings - totalInvestmentCost;
        irr = (annualCostSavings / totalInvestmentCost) * 100;
      }

      setCalculatedResults({
        energy_savings_summer: energySavingsSummer,
        energy_savings_winter: energySavingsWinter,
        total_energy_savings: totalEnergySavings,
        annual_cost_savings: annualCostSavings,
        total_investment_cost: totalInvestmentCost,
        payback_period: paybackPeriod,
        net_present_value: npv,
        internal_rate_of_return: irr,
      });
    }
  }, [formData]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);
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
      url: `${API_BASE_URL}/window_replacements/create/`,
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

  const renderInputFields = () => (
    <div className="space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {translations.windowReplacementData ||
              "Στοιχεία αντικατάστασης υαλοπινάκων"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.oldThermalConductivity ||
                "Παλαιός συντελεστής θερμικής αγωγιμότητας") + " (W/m²K) *"
            }
            type="number"
            value={formData.old_thermal_conductivity}
            onChange={(e) =>
              handleInputChange("old_thermal_conductivity", e.target.value)
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
              (translations.newThermalConductivity ||
                "Νέος συντελεστής θερμικής αγωγιμότητας") + " (W/m²K) *"
            }
            type="number"
            value={formData.new_thermal_conductivity}
            onChange={(e) =>
              handleInputChange("new_thermal_conductivity", e.target.value)
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
              (translations.windowArea || "Επιφάνεια υαλοπινάκων") + " (m²) *"
            }
            type="number"
            value={formData.window_area}
            onChange={(e) => handleInputChange("window_area", e.target.value)}
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
            label={(translations.costPerSqm || "Κόστος ανά m²") + " (€/m²)"}
            type="number"
            value={formData.cost_per_sqm}
            onChange={(e) => handleInputChange("cost_per_sqm", e.target.value)}
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

      {/* Calculation Card for Losses */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {translations.calculatedLosses || "Υπολογιζόμενες Απώλειες"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.oldLossesSummer || "Απώλειες πριν - Καλοκαίρι"}
              </Typography>
              <Typography variant="h6" color="error">
                {parseFloat(formData.old_losses_summer || 0).toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.oldLossesWinter || "Απώλειες πριν - Χειμώνα"}
              </Typography>
              <Typography variant="h6" color="error">
                {parseFloat(formData.old_losses_winter || 0).toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.newLossesSummer || "Απώλειες μετά - Καλοκαίρι"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {parseFloat(formData.new_losses_summer || 0).toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.newLossesWinter || "Απώλειες μετά - Χειμώνα"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {parseFloat(formData.new_losses_winter || 0).toFixed(2)} kWh
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

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
                {translations.summerSavings || "Εξοικονόμηση Καλοκαίρι"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.energy_savings_summer.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.winterSavings || "Εξοικονόμηση Χειμώνα"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.energy_savings_winter.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.totalAnnualSavings ||
                  "Συνολική Ετήσια Εξοικονόμηση"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {calculatedResults.total_energy_savings.toFixed(2)} kWh
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {translations.efficiencyImprovement || "Βελτίωση Απόδοσης"}
              </Typography>
              <Typography variant="h6" color="success.main">
                {(
                  ((calculatedResults.energy_savings_summer +
                    calculatedResults.energy_savings_winter) /
                    (parseFloat(formData.old_losses_summer || 0) +
                      parseFloat(formData.old_losses_winter || 0))) *
                  100
                ).toFixed(1)}
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
          •{" "}
          {translations.thermalConductivityReduction ||
            "Μείωση θερμικής αγωγιμότητας"}
          :{" "}
          {formData.old_thermal_conductivity &&
          formData.new_thermal_conductivity
            ? (
                ((parseFloat(formData.old_thermal_conductivity) -
                  parseFloat(formData.new_thermal_conductivity)) /
                  parseFloat(formData.old_thermal_conductivity)) *
                100
              ).toFixed(1)
            : 0}
          %
        </Typography>
        <Typography variant="body1" className="mb-2">
          • {translations.summerLossReduction || "Μείωση θερινών απωλειών"}:{" "}
          {formData.old_losses_summer && formData.new_losses_summer
            ? (
                ((parseFloat(formData.old_losses_summer) -
                  parseFloat(formData.new_losses_summer)) /
                  parseFloat(formData.old_losses_summer)) *
                100
              ).toFixed(1)
            : 0}
          %
        </Typography>
        <Typography variant="body1">
          • {translations.winterLossReduction || "Μείωση χειμερινών απωλειών"}:{" "}
          {formData.old_losses_winter && formData.new_losses_winter
            ? (
                ((parseFloat(formData.old_losses_winter) -
                  parseFloat(formData.new_losses_winter)) /
                  parseFloat(formData.old_losses_winter)) *
                100
              ).toFixed(1)
            : 0}
          %
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
              "Υπολογίζεται αυτόματα από την επιφάνεια και το κόστος ανά m²"
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
            value={formData.lifespan_years || 20}
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
            value={5}
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
              <WindowIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Αντικατάσταση παλαιών υαλοπινάκων"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση υαλοπινάκων"}
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
            {loading
              ? translations.saving || "Αποθήκευση..."
              : translations.save || "Αποθήκευση"}
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
            "& .MuiTabs-scrollButtons": {
              color: "var(--color-primary)",
            },
          }}>
          <Tab label={translations.inputData || "Στοιχεία Εισόδου"} />
          <Tab label={translations.energyBenefits || "Ενεργειακά Οφέλη"} />
          <Tab label={translations.economicBenefits || "Οικονομικά Οφέλη"} />
        </Tabs>

        {/* Tab 1: Στοιχεία Εισόδου */}
        <TabPanel value={activeTab} index={0}>
          {renderInputFields()}
        </TabPanel>

        {/* Tab 2: Ενεργειακά Οφέλη */}
        <TabPanel value={activeTab} index={1}>
          {renderEnergyBenefits()}
        </TabPanel>

        {/* Tab 3: Οικονομικά Οφέλη */}
        <TabPanel value={activeTab} index={2}>
          {renderEconomicBenefits()}
        </TabPanel>
      </div>
    </div>
  );
};

export default WindowReplacementTabContent;
