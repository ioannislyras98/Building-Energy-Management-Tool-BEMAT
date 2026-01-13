import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import {
  Box,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AcUnit as AcUnitIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import "../../assets/styles/forms.css";
import API_BASE_URL from "../../config/api.js";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ac-replacement-tabpanel-${index}`}
      aria-labelledby={`ac-replacement-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AirConditioningReplacementTabContent = ({
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
      ? english_text.AirConditioningReplacementTabContent || {}
      : greek_text.AirConditioningReplacementTabContent || {};

  const [oldACs, setOldACs] = useState([]);
  const [newACs, setNewACs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisData, setAnalysisData] = useState({
    lifespan_years: "20",
    discount_rate: "5",
  });

  const [oldACModal, setOldACModal] = useState({
    open: false,
    data: null,
    editMode: false,
  });
  const [newACModal, setNewACModal] = useState({
    open: false,
    data: null,
    editMode: false,
  });

  const btuTypes = [
    7000, 9000, 10000, 12000, 15000, 18000, 24000, 30000, 36000,
  ];

  useEffect(() => {
    if (buildingUuid && token) {
      fetchData();
    }
  }, [buildingUuid, token]);

  const fetchData = async () => {
    try {
      const oldACResponse = await $.ajax({
        url: `${API_BASE_URL}/air_conditioning_replacements/old/building/${buildingUuid}/`,
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (oldACResponse.success) {
        setOldACs(oldACResponse.data);
      }

      const newACResponse = await $.ajax({
        url: `${API_BASE_URL}/air_conditioning_replacements/new/building/${buildingUuid}/`,
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (newACResponse.success) {
        setNewACs(newACResponse.data);
      }

      const analysisResponse = await $.ajax({
        url: `${API_BASE_URL}/air_conditioning_replacements/analysis/building/${buildingUuid}/`,
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (analysisResponse.success && analysisResponse.data) {
        setAnalysis(analysisResponse.data);
        setAnalysisData({
          lifespan_years: analysisResponse.data.lifespan_years || "20",
          discount_rate: analysisResponse.data.discount_rate || "5",
        });
      }
    } catch (error) {

    }
  };

  const handleOldACSubmit = async (formData) => {
    setLoading(true);
    try {
      const submitData = {
        building: buildingUuid,
        project: projectUuid,
        ...formData,
      };

      let response;
      if (oldACModal.editMode) {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/old/update/${oldACModal.data.id}/`,
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      } else {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/old/create/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      }

      if (response.success) {
        setSuccess(response.message);
        setOldACModal({ open: false, data: null, editMode: false });
        fetchData();
      }
    } catch (error) {

      setError(error.responseJSON?.message || "Σφάλμα κατά την αποθήκευση");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleNewACSubmit = async (formData) => {
    setLoading(true);
    try {
      const submitData = {
        building: buildingUuid,
        project: projectUuid,
        ...formData,
      };

      // Remove empty string fields to avoid validation errors
      if (submitData.cost_per_unit === "") {
        delete submitData.cost_per_unit;
      }
      if (submitData.installation_cost === "") {
        delete submitData.installation_cost;
      }

      let response;
      if (newACModal.editMode) {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/new/update/${newACModal.data.id}/`,
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      } else {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/new/create/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      }

      if (response.success) {
        setSuccess(response.message);
        setNewACModal({ open: false, data: null, editMode: false });
        fetchData();
      }
    } catch (error) {

      setError(error.responseJSON?.message || "Σφάλμα κατά την αποθήκευση");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldAC = async (id) => {
    if (
      window.confirm(
        "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το κλιματιστικό;"
      )
    ) {
      try {
        const response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/old/delete/${id}/`,
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        if (response.success) {
          setSuccess(response.message);
          fetchData();
        }
      } catch (error) {
        setError(error.responseJSON?.message || "Σφάλμα κατά τη διαγραφή");
      }
    }
  };

  const handleDeleteNewAC = async (id) => {
    if (
      window.confirm(
        "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το κλιματιστικό;"
      )
    ) {
      try {
        const response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/new/delete/${id}/`,
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });
        if (response.success) {
          setSuccess(response.message);
          fetchData();
        }
      } catch (error) {
        setError(error.responseJSON?.message || "Σφάλμα κατά τη διαγραφή");
      }
    }
  };

  const handleAnalysisSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        building: buildingUuid,
        project: projectUuid,
        ...analysisData,
      };

      let response;
      if (analysis) {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/analysis/update/${analysis.id}/`,
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      } else {
        response = await $.ajax({
          url: `${API_BASE_URL}/air_conditioning_replacements/analysis/create/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(submitData),
        });
      }

      if (response.success) {
        setSuccess(translations.analysisSaved || "Η ανάλυση ενημερώθηκε επιτυχώς");
        // Refresh all data to get updated calculations from backend
        await fetchData();
      }
    } catch (error) {

      setError(error.responseJSON?.message || translations.saveError || "Σφάλμα κατά την αποθήκευση");
    }
    setLoading(false);
  };

  const oldACColumns = [
    {
      field: "btu_type",
      headerName: translations.btuType || "Τύπος (BTU)",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-medium">{params.value} BTU</span>
      ),
    },
    {
      field: "cop_percentage",
      headerName: translations.copPercentage || "COP",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(1)}
        </span>
      ),
    },
    {
      field: "eer_percentage",
      headerName: translations.eerPercentage || "EER",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(1)}
        </span>
      ),
    },
    {
      field: "heating_hours_per_year",
      headerName: translations.heatingHours || "Ώρες Θέρμανσης",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "cooling_hours_per_year",
      headerName: translations.coolingHours || "Ώρες Ψύξης",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "quantity",
      headerName: translations.quantity || "Πλήθος",
      flex: 0.6,
      minWidth: 80,
    },
    {
      field: "total_consumption_kwh",
      headerName: translations.totalConsumption || "Συνολική Κατανάλωση (Wh)",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <span className="font-medium text-primary">
          {Math.round(parseFloat(params.value || 0)).toLocaleString('el-GR')} Wh
        </span>
      ),
    },
    {
      field: "actions",
      headerName: translations.actions || "Ενέργειες",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={translations.edit || "Επεξεργασία"}>
            <IconButton
              size="small"
              sx={{ color: "var(--color-primary)" }}
              onClick={() =>
                setOldACModal({ open: true, data: params.row, editMode: true })
              }>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translations.delete || "Διαγραφή"}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteOldAC(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const newACColumns = [
    {
      field: "btu_type",
      headerName: translations.btuType || "Τύπος (BTU)",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-medium">{params.value} BTU</span>
      ),
    },
    {
      field: "cop_percentage",
      headerName: translations.copPercentage || "COP",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(1)}
        </span>
      ),
    },
    {
      field: "eer_percentage",
      headerName: translations.eerPercentage || "EER",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(1)}
        </span>
      ),
    },
    {
      field: "heating_hours_per_year",
      headerName: translations.heatingHours || "Ώρες Θέρμανσης",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "cooling_hours_per_year",
      headerName: translations.coolingHours || "Ώρες Ψύξης",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "quantity",
      headerName: translations.quantity || "Πλήθος",
      flex: 0.6,
      minWidth: 80,
    },
    {
      field: "total_cost",
      headerName: translations.totalCost || "Συνολικό Κόστος (€)",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-medium text-green-600">
          €{parseFloat(params.value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      field: "total_consumption_kwh",
      headerName: translations.totalConsumption || "Συνολική Κατανάλωση (Wh)",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <span className="font-medium text-primary">
          {Math.round(parseFloat(params.value || 0)).toLocaleString('el-GR')} Wh
        </span>
      ),
    },
    {
      field: "actions",
      headerName: translations.actions || "Ενέργειες",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={translations.edit || "Επεξεργασία"}>
            <IconButton
              size="small"
              sx={{ color: "var(--color-primary)" }}
              onClick={() =>
                setNewACModal({ open: true, data: params.row, editMode: true })
              }>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translations.delete || "Διαγραφή"}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteNewAC(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <Typography variant="body2" color="text.secondary">
            {translations.loading || "Φόρτωση..."}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="bg-primary/10 p-2 rounded-full mr-3">
              <AcUnitIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Αντικατάσταση κλιματιστικών"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση κλιματιστικών"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleAnalysisSubmit}
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

      <div className="bg-white rounded-xl shadow-md">
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
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
            label={translations.oldAirConditioningsTab || "Παλαιά Κλιματιστικά"}
          />
          <Tab
            label={translations.newAirConditioningsTab || "Νέα Κλιματιστικά"}
          />
          <Tab
            label={translations.energyDataTab || "Ενεργειακά Στοιχεία"}
          />
          <Tab
            label={translations.evaluationParametersTab || "Παράμετροι Αξιολόγησης"}
          />
          <Tab label={translations.economicAnalysisTab || "Οικονομική Ανάλυση"} />
        </Tabs>

        {/* Tab 1: Παλαιά Κλιματιστικά */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  setOldACModal({ open: true, data: null, editMode: false })
                }
                sx={{
                  backgroundColor: "var(--color-primary)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary-dark)",
                  },
                }}>
                {translations.addOldAC || "Προσθήκη Παλαιού"}
              </Button>
            </div>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={oldACs}
                columns={oldACColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                getRowId={(row) => row.id}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f0f0f0",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e9ecef",
                  },
                }}
              />
            </div>

            {oldACs.length === 0 && (
              <Card sx={{ mt: 3, textAlign: "center", p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {translations.noOldACs ||
                    "Δεν έχουν προστεθεί παλαιά κλιματιστικά"}
                </Typography>
              </Card>
            )}
          </div>
        </TabPanel>

        {/* Tab 2: Νέα Κλιματιστικά */}
        <TabPanel value={tabValue} index={1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  setNewACModal({ open: true, data: null, editMode: false })
                }
                sx={{
                  backgroundColor: "var(--color-primary)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary-dark)",
                  },
                }}>
                {translations.addNewAC || "Προσθήκη Νέου"}
              </Button>
            </div>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={newACs}
                columns={newACColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                getRowId={(row) => row.id}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f0f0f0",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e9ecef",
                  },
                }}
              />
            </div>

            {newACs.length === 0 && (
              <Card sx={{ mt: 3, textAlign: "center", p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {translations.noNewACs ||
                    "Δεν έχουν προστεθεί νέα κλιματιστικά"}
                </Typography>
              </Card>
            )}
          </div>
        </TabPanel>

        {/* Tab 3: Ενεργειακά Στοιχεία */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom className="font-semibold text-green-700 mb-4">
            {translations.energyData || "Ενεργειακά Στοιχεία"}
          </Typography>

          <Grid container spacing={3}>
            {/* Συνολική Παλαιά Κατανάλωση */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.totalOldConsumption ||
                  "Συνολική παλαιά κατανάλωση (Wh)"
                }
                type="text"
                value={
                  analysis?.total_old_consumption
                    ? Math.round(parseFloat(analysis.total_old_consumption)).toLocaleString('el-GR')
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.totalOldConsumptionHelper ||
                  "Αυτόματος υπολογισμός: Άθροισμα κατανάλωσης παλαιών κλιματιστικών"
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

            {/* Συνολική Νέα Κατανάλωση */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.totalNewConsumption ||
                  "Συνολική νέα κατανάλωση (Wh)"
                }
                type="text"
                value={
                  analysis?.total_new_consumption
                    ? Math.round(parseFloat(analysis.total_new_consumption)).toLocaleString('el-GR')
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.totalNewConsumptionHelper ||
                  "Αυτόματος υπολογισμός: Άθροισμα κατανάλωσης νέων κλιματιστικών"
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

            {/* Ενεργειακή Εξοικονόμηση */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.energySavingsKwh ||
                  "Ενεργειακή εξοικονόμηση (Wh)"
                }
                type="text"
                value={
                  analysis?.energy_savings_kwh !== undefined && analysis?.energy_savings_kwh !== null
                    ? Math.round(parseFloat(analysis.energy_savings_kwh)).toLocaleString('el-GR')
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.energySavingsKwhHelper ||
                  "Αυτόματος υπολογισμός: Παλαιά κατανάλωση - Νέα κατανάλωση"
                }
                sx={{
                  "& .MuiInputBase-input": {
                    color: analysis?.energy_savings_kwh >= 0 ? "var(--color-primary)" : "red",
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

            {/* Κόστος Ενέργειας */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.energyCostKwh || "Κόστος ενέργειας (€/kWh)"
                }
                type="text"
                value={
                  analysis?.energy_cost_kwh
                    ? parseFloat(analysis.energy_cost_kwh).toFixed(3)
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.energyCostFromProject ||
                  "Αυτόματη ανάκτηση από τα στοιχεία του έργου"
                }
                sx={{
                  "& .MuiInputBase-input": {
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
        </TabPanel>

        {/* Tab 4: Παράμετροι Αξιολόγησης */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom className="font-semibold text-primary mb-4">
            {translations.evaluationParameters || "Παράμετροι Αξιολόγησης"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.lifespanYears || "Χρονικό διάστημα αξιολόγησης (έτη)"
                }
                type="number"
                value={analysisData.lifespan_years}
                onChange={(e) =>
                  setAnalysisData((prev) => ({
                    ...prev,
                    lifespan_years: e.target.value,
                  }))
                }
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
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--color-primary)",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.discountRate || "Προεξοφλητικός συντελεστής (%)"
                }
                type="number"
                value={analysisData.discount_rate}
                onChange={(e) =>
                  setAnalysisData((prev) => ({
                    ...prev,
                    discount_rate: e.target.value,
                  }))
                }
                variant="outlined"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--color-primary)",
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: Οικονομική Ανάλυση */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom className="font-semibold text-gray-800 mb-4">
            {translations.economicAnalysisTab || "Οικονομική Ανάλυση"}
          </Typography>

          <Grid container spacing={3}>
            {/* Συνολικό Κόστος Επένδυσης */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.totalInvestmentCost ||
                  "Συνολικό κόστος επένδυσης (€)"
                }
                type="text"
                value={
                  analysis?.total_investment_cost
                    ? parseFloat(analysis.total_investment_cost).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.totalInvestmentCostHelper ||
                  "Αυτόματος υπολογισμός: Άθροισμα κόστους όλων των νέων κλιματιστικών"
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
                  analysis?.annual_energy_savings !== undefined && analysis?.annual_energy_savings !== null
                    ? parseFloat(analysis.annual_energy_savings).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
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
                    color: analysis?.annual_energy_savings >= 0 ? "green" : "red",
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
                  analysis?.annual_economic_benefit !== undefined && analysis?.annual_economic_benefit !== null
                    ? parseFloat(analysis.annual_economic_benefit).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.annualEconomicBenefitHelper ||
                  "Αυτόματος υπολογισμός: Ετήσια ενεργειακή εξοικονόμηση"
                }
                sx={{
                  "& .MuiInputBase-input": {
                    color: analysis?.annual_economic_benefit >= 0 ? "green" : "red",
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
                label={
                  translations.paybackPeriod || "Περίοδος αποπληρωμής (έτη)"
                }
                type="text"
                value={
                  analysis?.payback_period !== undefined && analysis?.payback_period !== null
                    ? (parseFloat(analysis.payback_period) > 0
                        ? parseFloat(analysis.payback_period).toFixed(1) + ' έτη'
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
                    color: analysis?.payback_period > 0 ? "var(--color-primary)" : "red",
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
                  translations.netPresentValue ||
                  "Καθαρή παρούσα αξία - NPV (€)"
                }
                type="text"
                value={
                  analysis?.net_present_value
                    ? parseFloat(analysis.net_present_value).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
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
                    color:
                      analysis?.net_present_value >= 0 ? "green" : "red",
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
                  analysis?.internal_rate_of_return !== undefined && analysis?.internal_rate_of_return !== null
                    ? (parseFloat(analysis.internal_rate_of_return) > 0
                        ? parseFloat(analysis.internal_rate_of_return).toFixed(2) + '%'
                        : 'Μη κερδοφόρα επένδυση')
                    : ""
                }
                variant="outlined"
                InputProps={{ readOnly: true }}
                helperText={
                  translations.irrHelper || "Αυτόματος υπολογισμός IRR"
                }
                sx={{
                  "& .MuiInputBase-input": {
                    color: analysis?.internal_rate_of_return > 0 ? "var(--color-primary)" : "red",
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
        </TabPanel>
      </div>

      <ACModal
        open={oldACModal.open}
        onClose={() =>
          setOldACModal({ open: false, data: null, editMode: false })
        }
        onSubmit={handleOldACSubmit}
        data={oldACModal.data}
        editMode={oldACModal.editMode}
        title={
          oldACModal.editMode
            ? "Επεξεργασία Παλαιού Κλιματιστικού"
            : "Προσθήκη Παλαιού Κλιματιστικού"
        }
        btuTypes={btuTypes}
        translations={translations}
        isOld={true}
      />

      <ACModal
        open={newACModal.open}
        onClose={() =>
          setNewACModal({ open: false, data: null, editMode: false })
        }
        onSubmit={handleNewACSubmit}
        data={newACModal.data}
        editMode={newACModal.editMode}
        title={
          newACModal.editMode
            ? "Επεξεργασία Νέου Κλιματιστικού"
            : "Προσθήκη Νέου Κλιματιστικού"
        }
        btuTypes={btuTypes}
        translations={translations}
        isOld={false}
      />
    </div>
  );
};

const ACModal = ({
  open,
  onClose,
  onSubmit,
  data,
  editMode,
  title,
  btuTypes,
  translations,
  isOld,
}) => {
  const [formData, setFormData] = useState({
    btu_type: "",
    cop_percentage: "",
    eer_percentage: "",
    heating_hours_per_year: "",
    cooling_hours_per_year: "",
    quantity: "1",
    ...(isOld
      ? {}
      : {
          cost_per_unit: "",
          installation_cost: "",
        }),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({
        btu_type: data.btu_type || "",
        cop_percentage: data.cop_percentage || "",
        eer_percentage: data.eer_percentage || "",
        heating_hours_per_year: data.heating_hours_per_year || "",
        cooling_hours_per_year: data.cooling_hours_per_year || "",
        quantity: data.quantity || "1",
        ...(isOld
          ? {}
          : {
              cost_per_unit: data.cost_per_unit || "",
              installation_cost: data.installation_cost || "",
            }),
      });
    } else {
      setFormData({
        btu_type: "",
        cop_percentage: "",
        eer_percentage: "",
        heating_hours_per_year: "",
        cooling_hours_per_year: "",
        quantity: "1",
        ...(isOld
          ? {}
          : {
              cost_per_unit: "",
              installation_cost: "",
            }),
      });
    }
    setError(null);
    setValidationErrors({});
  }, [data, open, isOld]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.btu_type) {
      errors.btu_type = "Ο τύπος κλιματιστικού είναι υποχρεωτικός";
    }

    if (!formData.cop_percentage || parseFloat(formData.cop_percentage) <= 0) {
      errors.cop_percentage =
        "Η απόδοση θέρμανσης (COP) πρέπει να είναι μεγαλύτερη από 0";
    }

    if (!formData.eer_percentage || parseFloat(formData.eer_percentage) <= 0) {
      errors.eer_percentage =
        "Η απόδοση ψύξης (EER) πρέπει να είναι μεγαλύτερη από 0";
    }

    if (
      !formData.heating_hours_per_year ||
      parseInt(formData.heating_hours_per_year) < 0 ||
      parseInt(formData.heating_hours_per_year) > 8760
    ) {
      errors.heating_hours_per_year =
        "Οι ώρες θέρμανσης πρέπει να είναι μεταξύ 0-8760";
    }

    if (
      !formData.cooling_hours_per_year ||
      parseInt(formData.cooling_hours_per_year) < 0 ||
      parseInt(formData.cooling_hours_per_year) > 8760
    ) {
      errors.cooling_hours_per_year =
        "Οι ώρες ψύξης πρέπει να είναι μεταξύ 0-8760";
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      errors.quantity =
        "Ο αριθμός κλιματιστικών πρέπει να είναι μεγαλύτερος από 0";
    }

    if (!isOld) {
      if (!formData.cost_per_unit || parseFloat(formData.cost_per_unit) < 0) {
        errors.cost_per_unit =
          "Το κόστος ανά μονάδα πρέπει να είναι μεγαλύτερο ή ίσο από 0";
      }

      if (
        !formData.installation_cost ||
        parseFloat(formData.installation_cost) < 0
      ) {
        errors.installation_cost =
          "Το κόστος εγκατάστασης πρέπει να είναι μεγαλύτερο ή ίσο από 0";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleCancel();
    } catch (error) {
      setError(error.message || "Σφάλμα κατά την αποθήκευση");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      btu_type: "",
      cop_percentage: "",
      eer_percentage: "",
      heating_hours_per_year: "",
      cooling_hours_per_year: "",
      quantity: "1",
      ...(isOld
        ? {}
        : {
            cost_per_unit: "",
            installation_cost: "",
          }),
    });
    setError(null);
    setValidationErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-4xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-center">{title}</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BTU Type Selection */}
            <div className="md:col-span-2">
              <label htmlFor="btu_type" className="label-name">
                {translations.btuType || "Τύπος (BTU)"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="btu_type"
                value={formData.btu_type}
                onChange={(e) => handleInputChange("btu_type", e.target.value)}
                className={`input-field ${
                  validationErrors.btu_type ? "error-input" : ""
                }`}
                required>
                <option value="">
                  {translations.selectBtuType || "Επιλέξτε τύπο"}
                </option>
                {btuTypes.map((btu) => (
                  <option key={btu} value={btu}>
                    {btu} BTU
                  </option>
                ))}
              </select>
              {validationErrors.btu_type && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.btu_type}
                </div>
              )}
            </div>

            {/* COP Percentage */}
            <div>
              <label htmlFor="cop_percentage" className="label-name">
                {translations.copPercentage || "Απόδοση Θέρμανσης (COP)"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="cop_percentage"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cop_percentage}
                onChange={(e) =>
                  handleInputChange("cop_percentage", e.target.value)
                }
                placeholder="π.χ. 3.5"
                className={`input-field ${
                  validationErrors.cop_percentage ? "error-input" : ""
                }`}
                required
              />
              {validationErrors.cop_percentage && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.cop_percentage}
                </div>
              )}
            </div>

            {/* EER Percentage */}
            <div>
              <label htmlFor="eer_percentage" className="label-name">
                {translations.eerPercentage || "Απόδοση Ψύξης (EER)"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="eer_percentage"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.eer_percentage}
                onChange={(e) =>
                  handleInputChange("eer_percentage", e.target.value)
                }
                placeholder="π.χ. 3.0"
                className={`input-field ${
                  validationErrors.eer_percentage ? "error-input" : ""
                }`}
                required
              />
              {validationErrors.eer_percentage && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.eer_percentage}
                </div>
              )}
            </div>

            {/* Heating Hours Per Year */}
            <div>
              <label htmlFor="heating_hours_per_year" className="label-name">
                {translations.heatingHours || "Ώρες θέρμανσης/έτος"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="heating_hours_per_year"
                type="number"
                step="1"
                min="0"
                max="8760"
                value={formData.heating_hours_per_year}
                onChange={(e) =>
                  handleInputChange("heating_hours_per_year", e.target.value)
                }
                placeholder="π.χ. 1200"
                className={`input-field ${
                  validationErrors.heating_hours_per_year ? "error-input" : ""
                }`}
                required
              />
              {validationErrors.heating_hours_per_year && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.heating_hours_per_year}
                </div>
              )}
            </div>

            {/* Cooling Hours Per Year */}
            <div>
              <label htmlFor="cooling_hours_per_year" className="label-name">
                {translations.coolingHours || "Ώρες ψύξης/έτος"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="cooling_hours_per_year"
                type="number"
                step="1"
                min="0"
                max="8760"
                value={formData.cooling_hours_per_year}
                onChange={(e) =>
                  handleInputChange("cooling_hours_per_year", e.target.value)
                }
                placeholder="π.χ. 800"
                className={`input-field ${
                  validationErrors.cooling_hours_per_year ? "error-input" : ""
                }`}
                required
              />
              {validationErrors.cooling_hours_per_year && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.cooling_hours_per_year}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="label-name">
                {translations.quantity || "Πλήθος κλιματιστικών"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                step="1"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="π.χ. 1"
                className={`input-field ${
                  validationErrors.quantity ? "error-input" : ""
                }`}
                required
              />
              {validationErrors.quantity && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.quantity}
                </div>
              )}
            </div>

            {/* Cost fields only for new ACs */}
            {!isOld && (
              <>
                {/* Cost Per Unit */}
                <div>
                  <label htmlFor="cost_per_unit" className="label-name">
                    {translations.costPerUnit || "Κόστος ανά μονάδα (€)"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_per_unit}
                    onChange={(e) =>
                      handleInputChange("cost_per_unit", e.target.value)
                    }
                    placeholder="π.χ. 1500.00"
                    className={`input-field ${
                      validationErrors.cost_per_unit ? "error-input" : ""
                    }`}
                    required
                  />
                  {validationErrors.cost_per_unit && (
                    <div className="text-red-500 text-xs mt-1">
                      {validationErrors.cost_per_unit}
                    </div>
                  )}
                </div>

                {/* Installation Cost */}
                <div>
                  <label htmlFor="installation_cost" className="label-name">
                    {translations.installationCost || "Κόστος εγκατάστασης (€)"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="installation_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.installation_cost}
                    onChange={(e) =>
                      handleInputChange("installation_cost", e.target.value)
                    }
                    placeholder="π.χ. 300.00"
                    className={`input-field ${
                      validationErrors.installation_cost ? "error-input" : ""
                    }`}
                    required
                  />
                  {validationErrors.installation_cost && (
                    <div className="text-red-500 text-xs mt-1">
                      {validationErrors.installation_cost}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              className="close-modal"
              onClick={handleCancel}
              disabled={loading}>
              {translations.cancel || "Ακύρωση"}
            </button>
            <button type="submit" className="confirm-button" disabled={loading}>
              {loading
                ? translations.saving || "Αποθήκευση..."
                : editMode
                ? translations.update || "Ενημέρωση"
                : translations.save || "Αποθήκευση"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AirConditioningReplacementTabContent;
