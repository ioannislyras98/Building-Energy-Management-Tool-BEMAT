import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const ThermalInsulationMaterialModal = ({
  open,
  handleClose,
  thermalInsulationUuid,
  materialType = "new", // 'old' or 'new'
  editItem = null,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    material: "",
    surface_type: "external_walls_outdoor",
    thickness: "",
    surface_area: "",
    cost: "",
    material_type: materialType,
  });

  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ThermalInsulationMaterialModal || {}
      : greek_text.ThermalInsulationMaterialModal || {};

  const surfaceTypeOptions = [
    {
      value: "external_walls_outdoor",
      label: "Εξωτερικοί τοίχοι σε επαφή με τον εξωτερικό αέρα",
    },
    { value: "internal", label: "Εσωτερική" },
    { value: "external", label: "Εξωτερική" },
    { value: "intermediate", label: "Ενδιάμεση" },
  ];

  useEffect(() => {
    fetchAvailableMaterials();

    if (editItem) {
      setFormData({
        material: editItem.material || "",
        surface_type: editItem.surface_type || "external_walls_outdoor",
        thickness: editItem.thickness || "",
        surface_area: editItem.surface_area || "",
        cost: editItem.cost || "",
        material_type: editItem.material_type || materialType,
      });

      // Find and set the selected material for display
      if (editItem.material) {
        setSelectedMaterial({
          uuid: editItem.material,
          name: editItem.material_name,
          thermal_conductivity: editItem.material_thermal_conductivity,
          category: editItem.material_category,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        material_type: materialType,
      }));
    }
  }, [editItem, materialType]);

  const fetchAvailableMaterials = () => {
    if (!token) return;

    $.ajax({
      url: "http://127.0.0.1:8000/thermal_insulations/materials/available/",
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        setAvailableMaterials(response.data || []);
      },
      error: (jqXHR) => {
        console.error("Error fetching materials:", jqXHR);
        setError("Σφάλμα κατά τη φόρτωση υλικών");
      },
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If material is selected, update the selected material info
    if (field === "material") {
      const material = availableMaterials.find((m) => m.uuid === value);
      setSelectedMaterial(material);
    }
  };

  const calculateThermalResistance = () => {
    if (
      selectedMaterial &&
      formData.thickness &&
      selectedMaterial.thermal_conductivity > 0
    ) {
      return (
        parseFloat(formData.thickness) / selectedMaterial.thermal_conductivity
      );
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!token || !thermalInsulationUuid) return;

    // Validation
    if (
      !formData.material ||
      !formData.thickness ||
      !formData.surface_area ||
      !formData.cost
    ) {
      setError("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    setLoading(true);
    setError(null);

    const url = editItem
      ? `http://127.0.0.1:8000/thermal_insulations/material-layers/${editItem.uuid}/`
      : `http://127.0.0.1:8000/thermal_insulations/${thermalInsulationUuid}/materials/add/`;

    const method = editItem ? "PUT" : "POST";

    $.ajax({
      url,
      method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(formData),
      success: (data) => {
        console.log("Material saved:", data);
        setLoading(false);
        if (onSubmitSuccess) {
          onSubmitSuccess(data);
        }
        handleClose();
      },
      error: (jqXHR) => {
        console.error("Error saving material:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail || "Σφάλμα κατά την αποθήκευση του υλικού"
        );
        setLoading(false);
      },
    });
  };

  const handleCancel = () => {
    setFormData({
      material: "",
      surface_type: "external_walls_outdoor",
      thickness: "",
      surface_area: "",
      cost: "",
      material_type: materialType,
    });
    setSelectedMaterial(null);
    setError(null);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <div className="flex items-center justify-between">
          <Typography variant="h6">
            {editItem ? "Επεξεργασία" : "Προσθήκη"}{" "}
            {materialType === "old" ? "Παλιού" : "Νέου"} Υλικού
          </Typography>
          <Chip
            label={materialType === "old" ? "Παλιό Υλικό" : "Νέο Υλικό"}
            color={materialType === "old" ? "default" : "primary"}
            variant="outlined"
          />
        </div>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Υλικό</InputLabel>
              <Select
                value={formData.material}
                label="Υλικό"
                onChange={(e) => handleInputChange("material", e.target.value)}>
                {availableMaterials.map((material) => (
                  <MenuItem key={material.uuid} value={material.uuid}>
                    <div>
                      <Typography variant="body1">{material.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        λ = {material.thermal_conductivity} W/mK |{" "}
                        {material.category_display}
                      </Typography>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedMaterial && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Επιλεγμένο Υλικό: {selectedMaterial.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Συντελεστής θερμικής αγωγιμότητας:{" "}
                  {selectedMaterial.thermal_conductivity} W/mK
                </Typography>
                {formData.thickness && (
                  <Typography variant="body2" color="primary">
                    Θερμική αντίσταση R ={" "}
                    {calculateThermalResistance().toFixed(3)} m²K/W
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Τύπος Επιφάνειας</InputLabel>
              <Select
                value={formData.surface_type}
                label="Τύπος Επιφάνειας"
                onChange={(e) =>
                  handleInputChange("surface_type", e.target.value)
                }>
                {surfaceTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Πάχος (m)"
              type="number"
              value={formData.thickness}
              onChange={(e) => handleInputChange("thickness", e.target.value)}
              inputProps={{ step: 0.001, min: 0.001 }}
              helperText="Πάχος του υλικού σε μέτρα"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Επιφάνεια (m²)"
              type="number"
              value={formData.surface_area}
              onChange={(e) =>
                handleInputChange("surface_area", e.target.value)
              }
              inputProps={{ step: 0.01, min: 0.01 }}
              helperText="Επιφάνεια σε τετραγωνικά μέτρα"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Κόστος (€)"
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              inputProps={{ step: 0.01, min: 0 }}
              helperText="Κόστος του υλικού και εργασίας σε ευρώ"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Ακύρωση
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "var(--color-primary)",
            "&:hover": {
              backgroundColor: "var(--color-primary)",
              opacity: 0.8,
            },
          }}>
          {loading ? "Αποθήκευση..." : editItem ? "Ενημέρωση" : "Προσθήκη"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThermalInsulationMaterialModal;
