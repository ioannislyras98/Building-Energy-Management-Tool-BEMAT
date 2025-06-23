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
import ThermalInsulationMaterialModal from "../../modals/building/ThermalInsulationMaterialModal";

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

const ThermalInsulationTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  // State management
  const [currentThermalInsulation, setCurrentThermalInsulation] =
    useState(null);
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

  // Material modal states
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialType, setMaterialType] = useState("new");

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);
  // Functions for data fetching and manipulation
  useEffect(() => {
    fetchOrCreateThermalInsulation();
  }, [buildingUuid]);

  const fetchOrCreateThermalInsulation = () => {
    if (!buildingUuid || !token) return;

    setLoading(true);

    $.ajax({
      url: `http://127.0.0.1:8000/thermal_insulations/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        if (data.data && data.data.length > 0) {
          const existing = data.data[0];
          setCurrentThermalInsulation(existing);
          setThermalInsulation(existing);
          setOldMaterials(existing.old_materials || []);
          setNewMaterials(existing.new_materials || []);
        } else {
          createNewThermalInsulation();
        }
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching thermal insulation:", jqXHR);
        createNewThermalInsulation();
      },
    });
  };

  const createNewThermalInsulation = () => {
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
    };    $.ajax({
      url: "http://127.0.0.1:8000/thermal_insulations/create/",
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(newData),
      success: (data) => {
        setCurrentThermalInsulation(data);
        setThermalInsulation(data);
        setOldMaterials([]);
        setNewMaterials([]);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error creating thermal insulation:", jqXHR);
        setError("Σφάλμα κατά τη δημιουργία νέας θερμομόνωσης");
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
    if (!token || !currentThermalInsulation) return;

    setLoading(true);

    $.ajax({
      url: `http://127.0.0.1:8000/thermal_insulations/${currentThermalInsulation.uuid}/`,
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(thermalInsulation),
      success: (data) => {
        setThermalInsulation(data);
        setSuccess("Η θερμομόνωση αποθηκεύτηκε επιτυχώς!");
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error saving thermal insulation:", jqXHR);
        setError(jqXHR.responseJSON?.detail || "Σφάλμα κατά την αποθήκευση");
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
      url: `http://127.0.0.1:8000/thermal_insulations/material-layers/${deletingMaterial.uuid}/`,
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
    if (currentThermalInsulation) {
      $.ajax({
        url: `http://127.0.0.1:8000/thermal_insulations/${currentThermalInsulation.uuid}/`,
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
        success: (data) => {
          setThermalInsulation(data);
          setOldMaterials(data.old_materials || []);
          setNewMaterials(data.new_materials || []);
        },
      });
    }
    setMaterialModalOpen(false);
    setSuccess("Το υλικό αποθηκεύτηκε επιτυχώς!");
  };

  // Calculation functions
  const calculateRTotal = (materials) => {
    if (!materials || materials.length === 0) return 0.17;

    const R_si = 0.13;
    const R_se = 0.04;
    const R_materials = materials.reduce((sum, material) => {
      const thickness = parseFloat(material.thickness || 0);
      const thermalConductivity = parseFloat(
        material.thermal_conductivity || 1
      );
      return sum + thickness / thermalConductivity;
    }, 0);

    return R_si + R_se + R_materials;
  };

  const calculateUCoefficient = (materials) => {
    const rTotal = calculateRTotal(materials);
    return rTotal > 0 ? 1 / rTotal : 0;
  };

  // Material columns definition
  const materialColumns = [
    {
      field: "material_name",
      headerName: "Υλικό",
      flex: 1.2,
      minWidth: 120,
    },
    {
      field: "surface_type_display",
      headerName: "Τύπος Επιφάνειας",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "thickness",
      headerName: "Πάχος (m)",
      flex: 0.7,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(3)}
        </span>
      ),
    },
    {
      field: "thermal_conductivity",
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
      headerName: "Επιφάνεια (m²)",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-medium">
          {parseFloat(params.value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      field: "cost",
      headerName: "Κόστος (€)",
      flex: 0.8,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-medium text-primary">
          {parseFloat(params.value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Ενέργειες",
      width: 100,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Φόρτωση...</p>
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
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Θερμομόνωση Εξωτερικής Τοιχοποιίας
              </h2>
              <p className="text-gray-600 mt-1">
                Διαχείριση παλιών και νέων υλικών θερμομόνωσης
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
            Αποθήκευση
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
          <Tab label="Παλιά Υλικά" />
          <Tab label="Νέα Υλικά" />
          <Tab label="Θέρμανση & Ψύξη" />
          <Tab label="Οικονομική Ανάλυση" />
        </Tabs>

        {/* Tab 1: Παλιά Υλικά */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h6" gutterBottom>
                Παλιά Υλικά Τοιχοποιίας
              </Typography>
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
                Προσθήκη Υλικού
              </Button>
            </div>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={oldMaterials}
                columns={materialColumns}
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
            </div>

            {/* Calculation Card for Old Materials */}
            <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Θερμικοί Υπολογισμοί (Παλιά Υλικά)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      Συνολική Θερμική Αντίσταση (R_total)
                    </Typography>
                    <Typography variant="h6" color="text.primary">
                      {calculateRTotal(oldMaterials).toFixed(3)} m²K/W
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      R = R_si + Σ(d/λ) + R_se
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      Συντελεστής Θερμοπερατότητας (U)
                    </Typography>
                    <Typography variant="h6" color="error">
                      {calculateUCoefficient(oldMaterials).toFixed(3)} W/m²K
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      U = 1 / R_total
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
              <Typography variant="h6" gutterBottom>
                Νέα Υλικά Θερμομόνωσης
              </Typography>
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
                Προσθήκη Υλικού
              </Button>
            </div>

            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={newMaterials}
                columns={materialColumns}
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
            </div>

            {/* Calculation Card for New Materials */}
            <Card sx={{ mt: 3, backgroundColor: "#e8f5e8" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Θερμικοί Υπολογισμοί (Νέα Υλικά)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      Συνολική Θερμική Αντίσταση (R_total)
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculateRTotal(newMaterials).toFixed(3)} m²K/W
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      R = R_si + Σ(d/λ) + R_se
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom>
                      Συντελεστής Θερμοπερατότητας (U)
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {calculateUCoefficient(newMaterials).toFixed(3)} W/m²K
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      U = 1 / R_total
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* Tab 3: Θέρμανση & Ψύξη */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Παράμετροι Θέρμανσης & Ψύξης
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Χειμερινές ωριαίες απώλειες (W)"
                type="number"
                value={thermalInsulation.winter_hourly_losses || ""}
                onChange={(e) =>
                  handleInputChange("winter_hourly_losses", e.target.value)
                }
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Καλοκαιρινές ωριαίες απώλειες (W)"
                type="number"
                value={thermalInsulation.summer_hourly_losses || ""}
                onChange={(e) =>
                  handleInputChange("summer_hourly_losses", e.target.value)
                }
                inputProps={{ step: 0.01, min: 0 }}
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
                    parseInt(e.target.value)
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
                    parseInt(e.target.value)
                  )
                }
                inputProps={{ step: 1, min: 0, max: 8760 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Οικονομική Ανάλυση */}
        <TabPanel value={tabValue} index={3}>
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
                  handleInputChange("annual_operating_costs", e.target.value)
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
        </TabPanel>
      </div>

      {/* Material Modal */}
      {materialModalOpen && (
        <ThermalInsulationMaterialModal
          open={materialModalOpen}
          handleClose={() => setMaterialModalOpen(false)}
          thermalInsulationUuid={currentThermalInsulation?.uuid}
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
  );
};

export default ThermalInsulationTabContent;
