import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import $ from "jquery";
import Cookies from "universal-cookie";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Tabs,
  Tab,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import ThermalInsulationMaterialModal from "../modals/building/ThermalInsulationMaterialModal";
import ConfirmationDialog from "../components/dialogs/ConfirmationDialog";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`thermal-insulation-tabpanel-${index}`}
      aria-labelledby={`thermal-insulation-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ThermalInsulationPage = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { projectUuid, buildingUuid, buildingData } = location.state || {};
  const isEdit = uuid !== "new";

  const [thermalInsulation, setThermalInsulation] = useState({
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

  // Modal states
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialType, setMaterialType] = useState("new"); // 'old' or 'new'

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ThermalInsulationPage || {}
      : greek_text.ThermalInsulationPage || {};

  useEffect(() => {
    if (isEdit) {
      fetchThermalInsulation();
    }
  }, [uuid, isEdit]);

  const fetchThermalInsulation = () => {
    if (!token || !uuid) return;

    setLoading(true);
    $.ajax({
      url: `http://127.0.0.1:8000/thermal_insulations/${uuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        setThermalInsulation(data);
        setOldMaterials(data.old_materials || []);
        setNewMaterials(data.new_materials || []);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching thermal insulation:", jqXHR);
        setError("Σφάλμα κατά τη φόρτωση δεδομένων");
        setLoading(false);
      },
    });
  };

  const handleInputChange = (field, value) => {
    setThermalInsulation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const url = isEdit
      ? `http://127.0.0.1:8000/thermal_insulations/${uuid}/`
      : `http://127.0.0.1:8000/thermal_insulations/create/`;

    const method = isEdit ? "PUT" : "POST";

    $.ajax({
      url,
      method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(thermalInsulation),
      success: (data) => {
        setSuccess(
          isEdit
            ? "Τα δεδομένα ενημερώθηκαν επιτυχώς!"
            : "Η θερμομόνωση δημιουργήθηκε επιτυχώς!"
        );
        if (!isEdit) {
          // Navigate to edit page after creation
          navigate(`/thermal-insulation/${data.uuid}/edit`, {
            state: { projectUuid, buildingUuid, buildingData },
            replace: true,
          });
        }
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error saving thermal insulation:", jqXHR);
        setError(jqXHR.responseJSON?.detail || "Σφάλμα κατά την αποθήκευση");
        setLoading(false);
      },
    });
  };

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
      url: `http://127.0.0.1:8000/thermal_insulations/material-layers/${deletingMaterial.uuid}/`,
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: () => {
        // Remove from local state
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
        setSuccess("Το υλικό διαγράφηκε επιτυχώς!");
      },
      error: (jqXHR) => {
        console.error("Error deleting material:", jqXHR);
        setError("Σφάλμα κατά τη διαγραφή του υλικού");
        setDeleteDialogOpen(false);
      },
    });
  };

  const onMaterialSaveSuccess = () => {
    // Refresh the thermal insulation data to get updated materials
    if (isEdit) {
      fetchThermalInsulation();
    }
    setMaterialModalOpen(false);
    setSuccess("Το υλικό αποθηκεύτηκε επιτυχώς!");
  };

  const materialColumns = [
    {
      field: "material_name",
      headerName: "Υλικό",
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: "surface_type_display",
      headerName: "Τύπος Επιφάνειας",
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "thickness",
      headerName: "Πάχος (m)",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(3)} m
        </span>
      ),
    },
    {
      field: "surface_area",
      headerName: "Επιφάνεια (m²)",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(2)} m²
        </span>
      ),
    },
    {
      field: "cost",
      headerName: "Κόστος (€)",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium text-primary">
          {parseFloat(params.value || 0).toLocaleString()} €
        </span>
      ),
    },
    {
      field: "thermal_resistance",
      headerName: "R (m²K/W)",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={parseFloat(params.value || 0).toFixed(3)}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Ενέργειες",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Επεξεργασία">
            <IconButton
              size="small"
              sx={{ color: "var(--color-primary)" }}
              onClick={() =>
                handleEditMaterial(params.row, params.row.material_type)
              }>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Διαγραφή">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteMaterial(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}>
                Επιστροφή
              </Button>
              <div className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <ThermostatIcon className="w-6 h-6 text-primary" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {isEdit ? "Επεξεργασία" : "Νέα"} Θερμομόνωση Εξωτερικής
                    Τοιχοποιίας
                  </h1>
                  {buildingData && (
                    <p className="text-gray-600">Κτίριο: {buildingData.name}</p>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                backgroundColor: "var(--color-primary)",
                "&:hover": {
                  backgroundColor: "var(--color-primary)",
                  opacity: 0.8,
                },
              }}>
              Αποθήκευση
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Main Content with Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Παλιά Υλικά" />
              <Tab label="Νέα Υλικά" />
              <Tab label="Θέρμανση & Ψύξη" />
              <Tab label="Οικονομική Ανάλυση" />
            </Tabs>
          </Box>

          {/* Old Materials Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Typography variant="h6" className="text-gray-800">
                  Παλιά Υλικά Τοιχοποιίας
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMaterial("old")}
                  disabled={!isEdit}>
                  Προσθήκη Παλιού Υλικού
                </Button>
              </div>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={oldMaterials.map((m) => ({ ...m, id: m.uuid }))}
                  columns={materialColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  disableSelectionOnClick
                />
              </div>
            </div>
          </TabPanel>

          {/* New Materials Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6" className="text-gray-800">
                    Νέα Υλικά Θερμομόνωσης
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Συντελεστής U:{" "}
                    {parseFloat(thermalInsulation.u_coefficient || 0).toFixed(
                      3
                    )}{" "}
                    W/m²K
                  </Typography>
                </div>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMaterial("new")}
                  disabled={!isEdit}>
                  Προσθήκη Νέου Υλικού
                </Button>
              </div>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={newMaterials.map((m) => ({ ...m, id: m.uuid }))}
                  columns={materialColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  disableSelectionOnClick
                />
              </div>
            </div>
          </TabPanel>

          {/* Heating & Cooling Tab */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Παράμετροι Θέρμανσης και Ψύξης
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ωριαίες απώλειες χειμερινών μηνών (kW)"
                    type="number"
                    value={thermalInsulation.winter_hourly_losses || ""}
                    onChange={(e) =>
                      handleInputChange("winter_hourly_losses", e.target.value)
                    }
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ωριαίες απώλειες θερινών μηνών (kW)"
                    type="number"
                    value={thermalInsulation.summer_hourly_losses || ""}
                    onChange={(e) =>
                      handleInputChange("summer_hourly_losses", e.target.value)
                    }
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ώρες θέρμανσης ανά έτος"
                    type="number"
                    value={thermalInsulation.heating_hours_per_year || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "heating_hours_per_year",
                        e.target.value
                      )
                    }
                    inputProps={{ step: 1, min: 0, max: 8760 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ώρες ψύξης ανά έτος"
                    type="number"
                    value={thermalInsulation.cooling_hours_per_year || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "cooling_hours_per_year",
                        e.target.value
                      )
                    }
                    inputProps={{ step: 1, min: 0, max: 8760 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Economic Analysis Tab */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Οικονομική Ανάλυση
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Συνολικό κόστος (€)"
                    type="number"
                    value={thermalInsulation.total_cost || ""}
                    onChange={(e) =>
                      handleInputChange("total_cost", e.target.value)
                    }
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ετήσιο όφελος (€)"
                    type="number"
                    value={thermalInsulation.annual_benefit || ""}
                    onChange={(e) =>
                      handleInputChange("annual_benefit", e.target.value)
                    }
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Χρονικό διάστημα (έτη)"
                    type="number"
                    value={thermalInsulation.time_period_years || 20}
                    onChange={(e) =>
                      handleInputChange(
                        "time_period_years",
                        parseInt(e.target.value)
                      )
                    }
                    inputProps={{ step: 1, min: 1, max: 50 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Λειτουργικά έξοδα ανά έτος (€)"
                    type="number"
                    value={thermalInsulation.annual_operating_costs || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "annual_operating_costs",
                        e.target.value
                      )
                    }
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Επιτόκιο αναγωγής (%)"
                    type="number"
                    value={thermalInsulation.discount_rate || 5}
                    onChange={(e) =>
                      handleInputChange("discount_rate", e.target.value)
                    }
                    inputProps={{ step: 0.1, min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Καθαρή παρούσα αξία (€)"
                    type="number"
                    value={thermalInsulation.net_present_value || 0}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiInputBase-input": {
                        color:
                          thermalInsulation.net_present_value >= 0
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>
        </Card>

        {/* Material Modal */}
        {materialModalOpen && (
          <ThermalInsulationMaterialModal
            open={materialModalOpen}
            handleClose={() => setMaterialModalOpen(false)}
            thermalInsulationUuid={thermalInsulation.uuid || uuid}
            materialType={materialType}
            editItem={editingMaterial}
            onSubmitSuccess={onMaterialSaveSuccess}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDeleteMaterial}
          title="Διαγραφή Υλικού"
          message="Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το υλικό;"
          confirmText="Διαγραφή"
          cancelText="Ακύρωση"
          confirmColor="error"
        />
      </div>
    </div>
  );
};

export default ThermalInsulationPage;
