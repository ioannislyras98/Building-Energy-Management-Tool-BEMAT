import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import API_BASE_URL from "../../config/api.js";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import ThermalInsulationMaterialModal from "./ThermalInsulationMaterialModal";
import ConfirmationDialog from "../../components/dialogs/ConfirmationDialog";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`thermal-insulation-modal-tabpanel-${index}`}
      aria-labelledby={`thermal-insulation-modal-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ThermalInsulationModal = ({
  open,
  handleClose,
  buildingUuid,
  projectUuid,
  buildingData,
  editItem = null,
  onSubmitSuccess = () => {},
}) => {
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");
  const isEdit = !!editItem;

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

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ThermalInsulationPage || {}
      : greek_text.ThermalInsulationPage || {};

  useEffect(() => {
    if (open && isEdit && editItem) {
      fetchThermalInsulation();
    } else if (open && !isEdit) {
      // Reset για νέα θερμομόνωση
      setThermalInsulation({
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
      setOldMaterials([]);
      setNewMaterials([]);
      setTabValue(0);
      setError(null);
      setSuccess(null);
    }
  }, [open, isEdit, editItem]);

  const fetchThermalInsulation = () => {
    if (!token || !editItem?.uuid) return;

    setLoading(true);
    $.ajax({
      url: `${API_BASE_URL}/thermal_insulations/${editItem.uuid}/`,
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
      ? `${API_BASE_URL}/thermal_insulations/${editItem.uuid}/`
      : `${API_BASE_URL}/thermal_insulations/create/`;

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
        setTimeout(() => {
          onSubmitSuccess();
        }, 1000);
        setLoading(false);
      },
      error: (jqXHR) => {

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
      url: `${API_BASE_URL}/thermal_insulations/material-layers/${deletingMaterial.uuid}/`,
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

        setError("Σφάλμα κατά τη διαγραφή του υλικού");
        setDeleteDialogOpen(false);
      },
    });
  };
  const onMaterialSaveSuccess = () => {
    // Refresh thermal insulation data
    if (isEdit) {
      fetchThermalInsulation();
    }
    setMaterialModalOpen(false);
    setSuccess("Το υλικό αποθηκεύτηκε επιτυχώς!");
  };

  // Calculation functions
  const calculateRTotal = (materials) => {
    if (!materials || materials.length === 0) return 0.17; // R_si + R_se = 0.13 + 0.04

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

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: "80vh" },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <ThermostatIcon sx={{ mr: 1, color: "var(--color-primary)" }} />
              <Typography variant="h6">
                {isEdit ? "Επεξεργασία" : "Νέα"} Θερμομόνωση Εξωτερικής
                Τοιχοποιίας
              </Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}>
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
          )}{" "}
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
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
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMaterial("old")}
                  disabled={!isEdit}
                  sx={{
                    color: "var(--color-primary)",
                    borderColor: "var(--color-primary)",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    },
                  }}>
                  Προσθήκη Παλιού Υλικού
                </Button>
              </div>
              <div style={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={oldMaterials.map((m) => ({ ...m, id: m.uuid }))}
                  columns={materialColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </div>

              {/* Υπολογισμοί για παλιά υλικά */}
              <Card sx={{ mt: 2, backgroundColor: "#f5f5f5" }}>
                <CardContent>
                  <Typography variant="h6" className="text-gray-800 mb-3">
                    Υπολογισμοί Παλιάς Μόνωσης
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        R_total = R_si (0,13) + R_se (0,04) + ΣR_υλικών
                      </Typography>
                      <Typography
                        variant="h6"
                        className="font-bold text-primary">
                        R_total: {calculateRTotal(oldMaterials).toFixed(3)}{" "}
                        m²K/W
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        U = 1 / R_total
                      </Typography>
                      <Typography
                        variant="h6"
                        className="font-bold text-primary">
                        U: {calculateUCoefficient(oldMaterials).toFixed(3)}{" "}
                        W/m²K
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        Ωριαίες Απώλειες
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        Χειμώνας: {thermalInsulation.winter_hourly_losses || 0}{" "}
                        kW
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        Καλοκαίρι: {thermalInsulation.summer_hourly_losses || 0}{" "}
                        kW
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>
          {/* New Materials Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMaterial("new")}
                  disabled={!isEdit}
                  sx={{
                    color: "var(--color-primary)",
                    borderColor: "var(--color-primary)",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    },
                  }}>
                  Προσθήκη Νέου Υλικού
                </Button>
              </div>
              <div style={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={newMaterials.map((m) => ({ ...m, id: m.uuid }))}
                  columns={materialColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                />
              </div>

              {/* Υπολογισμοί για νέα υλικά */}
              <Card sx={{ mt: 2, backgroundColor: "#e8f5e8" }}>
                <CardContent>
                  <Typography variant="h6" className="text-gray-800 mb-3">
                    Υπολογισμοί Νέας Μόνωσης
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        R_total = R_si (0,13) + R_se (0,04) + ΣR_υλικών
                      </Typography>
                      <Typography
                        variant="h6"
                        className="font-bold text-green-600">
                        R_total: {calculateRTotal(newMaterials).toFixed(3)}{" "}
                        m²K/W
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        U = 1 / R_total
                      </Typography>
                      <Typography
                        variant="h6"
                        className="font-bold text-green-600">
                        U: {calculateUCoefficient(newMaterials).toFixed(3)}{" "}
                        W/m²K
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" className="text-gray-600">
                        Ωριαίες Απώλειες
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        Χειμώνας: {thermalInsulation.winter_hourly_losses || 0}{" "}
                        kW
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        Καλοκαίρι: {thermalInsulation.summer_hourly_losses || 0}{" "}
                        kW
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </div>
          </TabPanel>
          {/* Heating & Cooling Tab */}
          <TabPanel value={tabValue} index={2}>
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
                    handleInputChange("heating_hours_per_year", e.target.value)
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
                    handleInputChange("cooling_hours_per_year", e.target.value)
                  }
                  inputProps={{ step: 1, min: 0, max: 8760 }}
                />
              </Grid>
            </Grid>
          </TabPanel>
          {/* Economic Analysis Tab */}
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
        </DialogContent>{" "}
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Ακύρωση
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                opacity: 0.8,
              },
            }}>
            Αποθήκευση
          </Button>
        </DialogActions>
      </Dialog>

      {/* Material Modal */}
      {materialModalOpen && (
        <ThermalInsulationMaterialModal
          open={materialModalOpen}
          handleClose={() => setMaterialModalOpen(false)}
          thermalInsulationUuid={thermalInsulation.uuid || editItem?.uuid}
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
    </>
  );
};

export default ThermalInsulationModal;
