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
      id={`exterior-blinds-tabpanel-${index}`}
      aria-labelledby={`exterior-blinds-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ExteriorBlindsTabContent = ({
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
  const [validationErrors, setValidationErrors] = useState({});
  const [eerFromCoolingSystem, setEerFromCoolingSystem] = useState(false);
  const [formData, setFormData] = useState({
    window_area: "",
    shading_coefficient: "70",
    solar_radiation: "",
    cooling_months: "5",
    cooling_system_eer: "2.5",
    cost_per_m2: "",
    installation_cost: "",
    maintenance_cost: "",
    cooling_energy_savings: "",
    energy_cost_kwh: "0.15",
    time_period: "20",
    discount_rate: "5.0",
  });

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ExteriorBlindsTabContent || {}
      : greek_text.ExteriorBlindsTabContent || {};

  const cookies = new Cookies();
  const token = cookies.get("token");
  const validateRequiredFields = () => {
    const requiredFields = {
      window_area: {
        label: translations.windowArea || "Επιφάνεια παραθύρων",
        errorKey: "windowAreaRequired",
      },
      cost_per_m2: {
        label: translations.costPerM2 || "Κόστος ανά m²",
        errorKey: "costPerM2Required",
      },
      installation_cost: {
        label: translations.installationCost || "Κόστος εγκατάστασης",
        errorKey: "installationCostRequired",
      },
      maintenance_cost: {
        label: translations.maintenanceCost || "Ετήσιο κόστος συντήρησης",
        errorKey: "maintenanceCostRequired",
      },
      shading_coefficient: {
        label: translations.shadingCoefficient || "Συντελεστής σκίασης",
        errorKey: "shadingCoefficientRequired",
      },
      solar_radiation: {
        label: translations.solarRadiation || "Ηλιακή ακτινοβολία",
        errorKey: "solarRadiationRequired",
      },
      cooling_months: {
        label: translations.coolingMonths || "Μήνες ψύξης",
        errorKey: "coolingMonthsRequired",
      },
      cooling_system_eer: {
        label: translations.coolingSystemEER || "Απόδοση ψύξης (EER)",
        errorKey: "coolingSystemEERRequired",
      },
      time_period: {
        label: translations.timePeriod || "Χρονικό διάστημα",
        errorKey: "timePeriodRequired",
      },
      discount_rate: {
        label: translations.discountRate || "Επιτόκιο αναγωγής",
        errorKey: "discountRateRequired",
      },
    };

    const errors = {};
    let hasErrors = false;
    let firstErrorTab = 0;

    for (const [field, config] of Object.entries(requiredFields)) {
      const value = formData[field];
      if (!value || value === "" || parseFloat(value) <= 0) {
        errors[field] = true;
        hasErrors = true;
        // Determine which tab has the error
        if ((field === 'time_period' || field === 'discount_rate') && firstErrorTab === 0) {
          firstErrorTab = 2;
        }
      }
    }

    setValidationErrors(errors);

    if (hasErrors) {
      setError(translations.requiredFieldsError || "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      setTabValue(firstErrorTab);
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
    const loadData = async () => {
      await fetchExteriorBlindsData();
      // Μετά τη φόρτωση των δεδομένων, φορτώνουμε το EER από το cooling system
      if (buildingUuid && token) {
        await fetchCoolingSystemEER();
      }
    };
    loadData();
  }, [buildingUuid, projectUuid]);

  useEffect(() => {
    if (projectUuid && token) {
      fetchProjectData();
    }
  }, [projectUuid, token]);

  // Ξεχωριστό useEffect για την ηλιακή ακτινοβολία που εξαρτάται από το buildingData
  useEffect(() => {
    const solarRadiation = buildingData?.data?.prefecture_data?.solar_radiation || buildingData?.prefecture_data?.solar_radiation;
    if (solarRadiation) {
      setFormData((prev) => ({
        ...prev,
        solar_radiation: solarRadiation.toString(),
      }));
    }
  }, [buildingData?.data?.prefecture_data?.solar_radiation, buildingData?.prefecture_data?.solar_radiation]);

  const fetchPrefectureSolarRadiation = async () => {
    try {
      // Πρώτα προσπαθούμε να πάρουμε από τα buildingData.prefecture_data
      if (buildingData && buildingData.prefecture_data && buildingData.prefecture_data.solar_radiation) {
        setFormData((prev) => ({
          ...prev,
          solar_radiation: buildingData.prefecture_data.solar_radiation.toString(),
        }));
        return;
      }

      // Αν δεν υπάρχει, φορτώνουμε από το API
      const prefectureUuid = typeof buildingData.prefecture === 'object' 
        ? buildingData.prefecture.uuid 
        : buildingData.prefecture;
      
      const response = await axios.get(
        `${API_BASE_URL}/prefectures/get/${prefectureUuid}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data && response.data.data.solar_radiation) {
        setFormData((prev) => ({
          ...prev,
          solar_radiation: response.data.data.solar_radiation.toString(),
        }));
      }
    } catch (error) {
      console.log("Error fetching prefecture solar radiation:", error);
    }
  };

  const fetchCoolingSystemEER = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cooling_systems/building/${buildingUuid}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Το API επιστρέφει { status: "success", data: [...] }
      if (response.data && response.data.data && response.data.data.length > 0) {
        const coolingSystem = response.data.data[0]; // Παίρνουμε το πρώτο cooling system
        if (coolingSystem.energy_efficiency_ratio) {
          setFormData((prev) => ({
            ...prev,
            cooling_system_eer: coolingSystem.energy_efficiency_ratio.toString(),
          }));
          setEerFromCoolingSystem(true);
        }
      }
    } catch (error) {
      // Αν δεν υπάρχει cooling system, χρησιμοποιούμε την default τιμή
      console.log("No cooling system found, using default EER");
      setEerFromCoolingSystem(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/get/${projectUuid}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        setFormData((prev) => ({
          ...prev,
          energy_cost_kwh: response.data.data.cost_per_kwh_electricity || "0.15",
        }));
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const fetchExteriorBlindsData = async () => {
    if (!buildingUuid || !projectUuid) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/exterior_blinds/building/${buildingUuid}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      setFormData((prev) => ({
        window_area: data.window_area || "",
        shading_coefficient: data.shading_coefficient || "70",
        solar_radiation: prev.solar_radiation || "",
        cooling_months: data.cooling_months || "5",
        cooling_system_eer: data.cooling_system_eer || "2.5",
        cost_per_m2: data.cost_per_m2 || "",
        installation_cost: data.installation_cost || "",
        maintenance_cost: data.maintenance_cost || "",
        cooling_energy_savings: data.cooling_energy_savings || "",
        energy_cost_kwh: data.energy_cost_kwh || "0.15",
        time_period: data.time_period || "20",
        discount_rate: data.discount_rate || "5.0",
        total_investment_cost: data.total_investment_cost,
        annual_energy_savings: data.annual_energy_savings,
        annual_economic_benefit: data.annual_economic_benefit,
        payback_period: data.payback_period,
        net_present_value: data.net_present_value,
        internal_rate_of_return: data.internal_rate_of_return,
      }));
    } catch (error) {
      if (error.response?.status !== 404) {
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

    // Clear validation error when user enters a value
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
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

      // Remove empty string fields to avoid validation errors
      if (dataToSend.installation_cost === "") {
        delete dataToSend.installation_cost;
      }
      if (dataToSend.maintenance_cost === "") {
        delete dataToSend.maintenance_cost;
      }

      const response = await axios.post(
        `${API_BASE_URL}/exterior_blinds/create/`,
        dataToSend,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reload δεδομένων μετά την επιτυχημένη αποθήκευση για να πάρουμε τα υπολογισμένα πεδία
      await fetchExteriorBlindsData();

      if (showMessage) {
        const message =
          response.status === 201
            ? "Τα δεδομένα δημιουργήθηκαν επιτυχώς!"
            : "Τα δεδομένα ενημερώθηκαν επιτυχώς!";
        setSuccess(message);
        setTimeout(() => setSuccess(null), 3000);
      }
      setError(null);
      setErrorField(null);
      setValidationErrors({});
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

  const renderBlindsData = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
            {translations.blindsData || "Στοιχεία Εξωτερικών Περσίδων"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.windowArea || "Επιφάνεια παραθύρων"} (m²){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.window_area}
            onChange={(e) => handleInputChange("window_area", e.target.value)}
            variant="outlined"
            error={validationErrors.window_area}
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
            error={validationErrors.cost_per_m2}
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
              <span>
                {translations.installationCost || "Κόστος εγκατάστασης"} (€){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.installation_cost}
            onChange={(e) =>
              handleInputChange("installation_cost", e.target.value)
            }
            variant="outlined"
            error={validationErrors.installation_cost}
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
              <span>
                {translations.maintenanceCost || "Ετήσιο κόστος συντήρησης"} (€){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.maintenance_cost}
            onChange={(e) =>
              handleInputChange("maintenance_cost", e.target.value)
            }
            variant="outlined"
            error={validationErrors.maintenance_cost}
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

        <Grid item xs={12}>
          <Typography variant="h6" className="font-semibold text-gray-800 mb-2 mt-4">
            {translations.calculationParameters || "Παράμετροι Υπολογισμού"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.shadingCoefficient || "Συντελεστής σκίασης"} (%){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.shading_coefficient}
            onChange={(e) => handleInputChange("shading_coefficient", e.target.value)}
            variant="outlined"
            error={validationErrors.shading_coefficient}
            inputProps={{ step: 1, min: 0, max: 100 }}
            helperText="Ποσοστό μείωσης ηλιακών κερδών (60-80%)"
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

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={
              (translations.solarRadiation || "Ηλιακή ακτινοβολία") + " (kWh/m²/ημ)"
            }
            type="number"
            value={formData.solar_radiation}
            variant="outlined"
            InputProps={{ readOnly: true }}
            inputProps={{ step: 0.1, min: 0 }}
            helperText="Φορτώνεται από τον Νομό"
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

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.coolingMonths || "Μήνες ψύξης"}{" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.cooling_months}
            onChange={(e) => handleInputChange("cooling_months", e.target.value)}
            variant="outlined"
            error={validationErrors.cooling_months}
            inputProps={{ step: 1, min: 1, max: 12 }}
            helperText="Αριθμός μηνών λειτουργίας ψύξης (4-6)"
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

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={
              <span>
                {translations.coolingSystemEER || "Απόδοση ψύξης (EER)"}{" "}
                {!eerFromCoolingSystem && <span style={{ color: "red" }}>*</span>}
              </span>
            }
            type="number"
            value={formData.cooling_system_eer}
            onChange={(e) => !eerFromCoolingSystem && handleInputChange("cooling_system_eer", e.target.value)}
            variant="outlined"
            error={validationErrors.cooling_system_eer}
            InputProps={{ readOnly: eerFromCoolingSystem }}
            inputProps={{ step: 0.1, min: 1.0, max: 5.0 }}
            helperText={eerFromCoolingSystem ? "Φορτώνεται από το Σύστημα Ψύξης" : "Energy Efficiency Ratio (2.0-3.5)"}
            sx={{
              "& .MuiInputBase-input": eerFromCoolingSystem ? {
                color: "var(--color-primary)",
                fontWeight: "bold",
              } : {},
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
              (translations.coolingEnergySavings ||
                "Εξοικονόμηση ενέργειας ψύξης") + " (kWh/έτος)"
            }
            type="number"
            value={formData.cooling_energy_savings}
            variant="outlined"
            InputProps={{ readOnly: true }}
            helperText="Υπολογίζεται αυτόματα από τις παραμέτρους"
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={
              (translations.energyCostKwh || "Κόστος ηλεκτρικής ενέργειας") + " (€/kWh)"
            }
            type="number"
            value={formData.energy_cost_kwh}
            variant="outlined"
            InputProps={{ readOnly: true }}
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
            label={
              <span>
                {translations.timePeriod || "Χρονικό διάστημα"} (έτη){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.time_period}
            onChange={(e) => handleInputChange("time_period", e.target.value)}
            variant="outlined"
            error={validationErrors.time_period}
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
              <span>
                {translations.discountRate || "Επιτόκιο αναγωγής"} (%){" "}
                <span style={{ color: "red" }}>*</span>
              </span>
            }
            type="number"
            value={formData.discount_rate}
            onChange={(e) => handleInputChange("discount_rate", e.target.value)}
            variant="outlined"
            error={validationErrors.discount_rate}
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
              "Αυτόματος υπολογισμός IRR"
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

  if (loading && !formData.window_area) {
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Εγκατάσταση Εξωτερικών Περσίδων"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Οικονομική ανάλυση εγκατάστασης εξωτερικών περσίδων"}
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
          <Tab
            label={translations.blindsDataTab || "Στοιχεία Εξωτερικών Περσίδων"}
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

        {/* Tab 1: Στοιχεία Εξωτερικών Περσίδων */}
        <TabPanel value={tabValue} index={0}>
          {renderBlindsData()}
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

export default ExteriorBlindsTabContent;
