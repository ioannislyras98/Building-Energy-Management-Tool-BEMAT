import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Card,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  TextField,
  Alert,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import SaveIcon from "@mui/icons-material/Save";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import RoofThermalInsulationMaterialModal from "../../modals/building/RoofThermalInsulationMaterialModal";
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
      id={`roof-thermal-insulation-tabpanel-${index}`}
      aria-labelledby={`roof-thermal-insulation-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RoofThermalInsulationTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.RoofThermalInsulationTabContent || {}
      : greek_text.RoofThermalInsulationTabContent || {};

  // State management
  const [currentRoofThermalInsulation, setCurrentRoofThermalInsulation] =
    useState(null);
  const [roofThermalInsulation, setRoofThermalInsulation] = useState({
    building: buildingUuid,
    project: projectUuid,
    u_coefficient: 0,
    winter_hourly_losses: "",
    summer_hourly_losses: "",
    heating_hours_per_year: "",
    cooling_hours_per_year: "",
    total_cost: "",
    annual_benefit: "",
    time_period_years: 20,
    annual_operating_costs: "",
    discount_rate: 5,
    net_present_value: 0,
  });

  const [oldMaterials, setOldMaterials] = useState([]);
  const [newMaterials, setNewMaterials] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Material modal states
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialType, setMaterialType] = useState("new");

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);

  // Functions for data fetching and manipulation
  useEffect(() => {
    fetchOrCreateRoofThermalInsulation();
  }, [buildingUuid]);

  const fetchOrCreateRoofThermalInsulation = () => {
    if (!buildingUuid || !token) return;

    setLoading(true);

    $.ajax({
      url: `${API_BASE_URL}/roof_thermal_insulations/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        if (data.data && data.data.length > 0) {
          const existing = data.data[0];
          setCurrentRoofThermalInsulation(existing);
          setRoofThermalInsulation(existing);
          setOldMaterials(existing.old_materials || []);
          setNewMaterials(existing.new_materials || []);
        } else {
          createNewRoofThermalInsulation();
        }
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching roof thermal insulation:", jqXHR);
        createNewRoofThermalInsulation();
      },
    });
  };

  const createNewRoofThermalInsulation = () => {
    const newData = {
      building: buildingUuid,
      project: projectUuid,
      u_coefficient: 0,
      winter_hourly_losses: 0,
      summer_hourly_losses: 0,
      heating_hours_per_year: 0,
      cooling_hours_per_year: 0,
      total_cost: 0,
      annual_benefit: 0,
      time_period_years: 20,
      annual_operating_costs: 0,
      discount_rate: 5,
      net_present_value: 0,
    };
    $.ajax({
      url: `${API_BASE_URL}/roof_thermal_insulations/create/`,
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(newData),
      success: (data) => {
        setCurrentRoofThermalInsulation(data);
        setRoofThermalInsulation(data);
        setOldMaterials([]);
        setNewMaterials([]);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error creating roof thermal insulation:", jqXHR);
        setError(
          translations.errorLoad ||
            "Σφάλμα κατά τη δημιουργία νέας θερμομόνωσης οροφής"
        );
        setLoading(false);
      },
    });
  };

  const handleInputChange = (field, value) => {
    setRoofThermalInsulation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!token || !currentRoofThermalInsulation) return;

    setLoading(true);

    // Calculate and update total cost before saving
    const updatedRoofThermalInsulation = {
      ...roofThermalInsulation,
      total_cost: calculateTotalCost(newMaterials),
    };

    $.ajax({
      url: `${API_BASE_URL}/roof_thermal_insulations/${currentRoofThermalInsulation.uuid}/`,
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(updatedRoofThermalInsulation),
      success: (data) => {
        // After successful save, trigger recalculation
        $.ajax({
          url: `${API_BASE_URL}/roof_thermal_insulations/${currentRoofThermalInsulation.uuid}/recalculate/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          success: (recalculatedData) => {
            setRoofThermalInsulation(recalculatedData.data);
            setSuccess(
              translations.saveSuccess ||
                "Η θερμομόνωση οροφής αποθηκεύτηκε επιτυχώς!"
            );
            setLoading(false);
          },
          error: (jqXHR) => {
            console.error(
              "Error recalculating roof thermal insulation:",
              jqXHR
            );
            // Still show success for the save, even if recalculation failed
            setRoofThermalInsulation(data);
            setSuccess(
              translations.saveSuccess ||
                "Η θερμομόνωση οροφής αποθηκεύτηκε επιτυχώς!"
            );
            setLoading(false);
          },
        });
      },
      error: (jqXHR) => {
        console.error("Error saving roof thermal insulation:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση"
        );
        setLoading(false);
      },
    });
  };

  // Material management functions
  const handleAddMaterial = (type) => {
    setMaterialType(type);
    setEditingMaterial(null);
    setMaterialModalOpen(true);
  };

  const handleEditMaterial = (material, type) => {
    setMaterialType(type);
    setEditingMaterial(material);
    setMaterialModalOpen(true);
  };

  const handleDeleteMaterial = (material) => {
    setDeletingMaterial(material);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMaterial = () => {
    if (!deletingMaterial || !token) return;

    $.ajax({
      url: `${API_BASE_URL}/roof_thermal_insulations/material-layers/${deletingMaterial.uuid}/`,
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: () => {
        if (deletingMaterial.material_type === "old") {
          setOldMaterials((prev) =>
            prev.filter((m) => m.uuid !== deletingMaterial.uuid)
          );
        } else {
          setNewMaterials((prev) =>
            prev.filter((m) => m.uuid !== deletingMaterial.uuid)
          );
        }
        setDeleteDialogOpen(false);
        setDeletingMaterial(null);
        setSuccess(
          translations.materialDeleteSuccess || "Το υλικό διαγράφηκε επιτυχώς!"
        );
      },
      error: (jqXHR) => {
        console.error("Error deleting material:", jqXHR);
        setError(
          translations.errorMaterialDelete ||
            "Σφάλμα κατά τη διαγραφή του υλικού"
        );
        setDeleteDialogOpen(false);
      },
    });
  };

  const onMaterialSaveSuccess = () => {
    if (currentRoofThermalInsulation) {
      $.ajax({
        url: `${API_BASE_URL}/roof_thermal_insulations/${currentRoofThermalInsulation.uuid}/`,
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
        success: (data) => {
          setRoofThermalInsulation(data);
          setOldMaterials(data.old_materials || []);
          setNewMaterials(data.new_materials || []);

          // Trigger recalculation after material changes
          $.ajax({
            url: `${API_BASE_URL}/roof_thermal_insulations/${currentRoofThermalInsulation.uuid}/recalculate/`,
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
            },
            success: (recalculatedData) => {
              setRoofThermalInsulation(recalculatedData.data);
            },
            error: (jqXHR) => {
              console.error("Error recalculating after material save:", jqXHR);
            },
          });
        },
      });
    }
    setMaterialModalOpen(false);
    setSuccess(
      translations.materialSaveSuccess || "Το υλικό αποθηκεύτηκε επιτυχώς!"
    );
  };

  // Calculation functions (roof-specific with R_si = 0.10)
  const calculateRTotal = (materials) => {
    if (!materials || materials.length === 0) return 0.14;

    const R_si = 0.1; // Roof-specific internal surface resistance
    const R_se = 0.04;
    const R_materials = materials.reduce((sum, material) => {
      const thickness = parseFloat(material.thickness || 0);
      const thermalConductivity = parseFloat(
        material.material_thermal_conductivity || 1
      );
      return sum + thickness / thermalConductivity;
    }, 0);

    return R_si + R_se + R_materials;
  };

  const calculateUCoefficient = (materials) => {
    const rTotal = calculateRTotal(materials);
    return rTotal > 0 ? 1 / rTotal : 0;
  };

  const calculateTotalSurfaceArea = (materials) => {
    return materials.reduce((sum, material) => {
      return sum + parseFloat(material.surface_area || 0);
    }, 0);
  };

  const calculateWinterHourlyLosses = (materials) => {
    const uCoefficient = calculateUCoefficient(materials);
    const totalArea = calculateTotalSurfaceArea(materials);
    return (uCoefficient * totalArea * 17) / 1000; // kW
  };

  const calculateSummerHourlyLosses = (materials) => {
    const uCoefficient = calculateUCoefficient(materials);
    const totalArea = calculateTotalSurfaceArea(materials);
    return (uCoefficient * totalArea * 13) / 1000; // kW
  };

  const calculateTotalCost = (materials) => {
    return materials.reduce((sum, material) => {
      return sum + parseFloat(material.cost || 0);
    }, 0);
  };

  const calculateAnnualBenefit = () => {
    // Return the calculated annual benefit from backend
    return parseFloat(roofThermalInsulation.annual_benefit || 0);
  };

  // Base columns for all materials
  const baseColumns = [
    {
      field: "material_name",
      headerName: translations.columns?.material || "Υλικό",
      flex: 1.2,
      minWidth: 120,
    },
    {
      field: "surface_type_display",
      headerName: translations.columns?.surfaceType || "Τύπος Επιφάνειας",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "thickness",
      headerName: translations.columns?.thickness || "Πάχος (m)",
      flex: 0.7,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(3)}
        </span>
      ),
    },
    {
      field: "material_thermal_conductivity",
      headerName: "λ (W/mK)",
      flex: 0.7,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(3)}
        </span>
      ),
    },
    {
      field: "surface_area",
      headerName: translations.columns?.surfaceArea || "Επιφάνεια (m²)",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    field: "actions",
    headerName: translations.columns?.actions || "Ενέργειες",
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <Tooltip title={translations.tooltips?.edit || "Επεξεργασία"}>
          <IconButton
            size="small"
            sx={{ color: "var(--color-primary)" }}
            onClick={() =>
              handleEditMaterial(params.row, params.row.material_type)
            }>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={translations.tooltips?.delete || "Διαγραφή"}>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteMaterial(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  // Cost column
  const costColumn = {
    field: "cost",
    headerName: translations.columns?.cost || "Κόστος (€)",
    flex: 0.8,
    minWidth: 80,
    renderCell: (params) => (
      <span className="font-medium text-primary">
        {parseFloat(params.value || 0).toLocaleString()}
      </span>
    ),
  };

  // Old materials columns (without cost)
  const oldMaterialColumns = [...baseColumns, actionsColumn];

  // New materials columns (with cost)
  const newMaterialColumns = [...baseColumns, costColumn, actionsColumn];

  if (loading) {
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
          <div className="flex items-center">
            <span className="bg-primary/10 p-2 rounded-full mr-3">
              <ThermostatIcon className="w-6 h-6 text-primary" />
            </span>{" "}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Θερμομόνωση Οροφής"}
              </h2>{" "}
              <p className="text-gray-600 mt-1">
                {translations.materialManagement ||
                  "Διαχείριση παλιών και νέων υλικών θερμομόνωσης οροφής"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              "&:hover": {
                backgroundColor: "var(--color-primary-dark)",
              },
            }}>
            {translations.save || "Αποθήκευση"}
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
          {" "}
          <Tab label={translations.oldMaterialsTab || "Παλιά Υλικά"} />
          <Tab label={translations.newMaterialsTab || "Νέα Υλικά"} />
          <Tab label={translations.heatingCoolingTab || "Θέρμανση & Ψύξη"} />
          <Tab
            label={translations.economicAnalysisTab || "Οικονομική Ανάλυση"}
          />
        </Tabs>
        {/* Tab 1: Παλιά Υλικά */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {" "}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddMaterial("old")}
                sx={{
                  backgroundColor: "var(--color-primary)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary-dark)",
                  },
                }}>
                {translations.addOldMaterial || "Προσθήκη Παλιού Υλικού"}
              </Button>
            </div>{" "}
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={oldMaterials}
                columns={oldMaterialColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                getRowId={(row) => row.uuid}
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
            </div>{" "}
            {/* Calculation Card for Old Materials */}
            <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translations.calculations?.oldMaterials ||
                    "Θερμικοί Υπολογισμοί (Παλαιά Υλικά)"}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.uCoefficient ||
                        "Συντελεστής Θερμοπερατότητας (U)"}
                    </Typography>
                    <Typography variant="h6" color="error">
                      {calculateUCoefficient(oldMaterials).toFixed(3)} W/m²K
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.winterLosses ||
                        "Χειμερινές Ωριαίες Απώλειες"}
                    </Typography>
                    <Typography variant="h6" color="error">
                      {calculateWinterHourlyLosses(oldMaterials).toFixed(3)} kW
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.summerLosses ||
                        "Καλοκαιρινές Ωριαίες Απώλειες"}
                    </Typography>
                    <Typography variant="h6" color="error">
                      {calculateSummerHourlyLosses(oldMaterials).toFixed(3)} kW
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>
        </TabPanel>
        {/* Tab 2: Νέα Υλικά */}
        <TabPanel value={tabValue} index={1}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {" "}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddMaterial("new")}
                sx={{
                  backgroundColor: "var(--color-primary)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary-dark)",
                  },
                }}>
                {translations.addNewMaterial || "Προσθήκη Νέου Υλικού"}
              </Button>
            </div>{" "}
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={newMaterials}
                columns={newMaterialColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                getRowId={(row) => row.uuid}
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
            </div>{" "}
            {/* Calculation Card for New Materials */}
            <Card sx={{ mt: 3, backgroundColor: "#e8f5e8" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translations.calculations?.newMaterials ||
                    "Θερμικοί Υπολογισμοί (Νέα Υλικά)"}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.uCoefficient ||
                        "Συντελεστής Θερμοπερατότητας (U)"}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculateUCoefficient(newMaterials).toFixed(3)} W/m²K
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.winterLosses ||
                        "Χειμερινές Ωριαίες Απώλειες"}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculateWinterHourlyLosses(newMaterials).toFixed(3)} kW
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      {translations.calculations?.summerLosses ||
                        "Καλοκαιρινές Ωριαίες Απώλειες"}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculateSummerHourlyLosses(newMaterials).toFixed(3)} kW
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>
        </TabPanel>{" "}
        {/* Tab 3: Θέρμανση & Ψύξη */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            {translations.sections?.heatingCoolingParams ||
              "Παράμετροι Θέρμανσης & Ψύξης"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.heatingHoursPerYear ||
                  "Ώρες θέρμανσης ανά έτος"
                }
                type="number"
                value={roofThermalInsulation.heating_hours_per_year || ""}
                onChange={(e) =>
                  handleInputChange(
                    "heating_hours_per_year",
                    parseInt(e.target.value)
                  )
                }
                inputProps={{ step: 1, min: 0, max: 8760 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
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
                  translations.fields?.coolingHoursPerYear ||
                  "Ώρες ψύξης ανά έτος"
                }
                type="number"
                value={roofThermalInsulation.cooling_hours_per_year || ""}
                onChange={(e) =>
                  handleInputChange(
                    "cooling_hours_per_year",
                    parseInt(e.target.value)
                  )
                }
                inputProps={{ step: 1, min: 0, max: 8760 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
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
        {/* Tab 4: Οικονομική Ανάλυση */}
        <TabPanel value={tabValue} index={3}>
          {" "}
          <Typography variant="h6" gutterBottom>
            {translations.sections?.economicAnalysis || "Οικονομική Ανάλυση"}
          </Typography>
          <Grid container spacing={3}>
            {" "}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.totalCost || "Συνολικό κόστος (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={calculateTotalCost(newMaterials).toLocaleString(
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
                    "&.Mui-focused": {
                      color: "var(--color-primary) !important",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary) !important",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--color-primary) !important",
                    },
                  },
                }}
                helperText={
                  translations.autoCalculatedCost ||
                  "Υπολογίζεται αυτόματα από το άθροισμα των κοστών των νέων υλικών"
                }
              />
            </Grid>{" "}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.annualBenefit || "Ετήσιο όφελος (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={calculateAnnualBenefit().toLocaleString("el-GR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color:
                      calculateAnnualBenefit() >= 0
                        ? "var(--color-success)"
                        : "red",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color:
                      calculateAnnualBenefit() >= 0
                        ? "var(--color-success)"
                        : "red",
                    "&.Mui-focused": {
                      color:
                        calculateAnnualBenefit() >= 0
                          ? "var(--color-success) !important"
                          : "red !important",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor:
                        calculateAnnualBenefit() >= 0
                          ? "var(--color-success) !important"
                          : "red !important",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor:
                        calculateAnnualBenefit() >= 0
                          ? "var(--color-success) !important"
                          : "red !important",
                    },
                  },
                }}
                helperText={
                  translations.autoCalculatedBenefit ||
                  "Υπολογίζεται αυτόματα βάσει διαφοράς απωλειών, ωρών λειτουργίας και κόστους ρεύματος"
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.timePeriodYears ||
                  "Χρονικό διάστημα (έτη)"
                }
                type="number"
                value={roofThermalInsulation.time_period_years || 20}
                onChange={(e) =>
                  handleInputChange(
                    "time_period_years",
                    parseInt(e.target.value)
                  )
                }
                inputProps={{ step: 1, min: 1, max: 50 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
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
                  translations.fields?.annualOperatingCosts ||
                  "Λειτουργικά έξοδα ανά έτος (€)"
                }
                type="number"
                value={roofThermalInsulation.annual_operating_costs || ""}
                onChange={(e) =>
                  handleInputChange("annual_operating_costs", e.target.value)
                }
                inputProps={{ step: 0.01, min: 0 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
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
                  translations.fields?.discountRate || "Επιτόκιο αναγωγής (%)"
                }
                type="number"
                value={roofThermalInsulation.discount_rate || 5}
                onChange={(e) =>
                  handleInputChange("discount_rate", e.target.value)
                }
                inputProps={{ step: 0.1, min: 0, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
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
                  translations.fields?.netPresentValue ||
                  "Καθαρή παρούσα αξία (€)"
                }
                type="number"
                value={roofThermalInsulation.net_present_value || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color:
                      roofThermalInsulation.net_present_value >= 0
                        ? "green"
                        : "red",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary) !important",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary) !important",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--color-primary) !important",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </div>
      {/* Material Modal */}
      {materialModalOpen && (
        <RoofThermalInsulationMaterialModal
          open={materialModalOpen}
          handleClose={() => setMaterialModalOpen(false)}
          roofThermalInsulationUuid={currentRoofThermalInsulation?.uuid}
          materialType={materialType}
          editItem={editingMaterial}
          onSubmitSuccess={onMaterialSaveSuccess}
        />
      )}
      {/* Delete Confirmation Dialog */}{" "}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteMaterial}
        title={translations.confirmDelete?.title || "Διαγραφή Υλικού"}
        message={
          translations.confirmDelete?.message ||
          "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το υλικό;"
        }
        confirmText={translations.confirmDelete?.confirm || "Διαγραφή"}
        cancelText={translations.confirmDelete?.cancel || "Ακύρωση"}
        confirmColor="error"
      />
    </div>
  );
};

export default RoofThermalInsulationTabContent;
