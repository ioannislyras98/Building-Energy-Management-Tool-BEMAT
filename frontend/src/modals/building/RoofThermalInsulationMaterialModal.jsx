import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import "../../assets/styles/forms.css";

const RoofThermalInsulationMaterialModal = ({
  open,
  handleClose,
  roofThermalInsulationUuid,
  materialType = "new", // 'old' or 'new'
  editItem = null,
  onSubmitSuccess,
}) => {
  // Initialize form data based on material type
  const getInitialFormData = () => {
    const baseData = {
      material: "",
      surface_type: "external_horizontal_roof", // Default for roofs
      thickness: "",
      surface_area: "",
      material_type: materialType,
    };

    // Only include cost for new materials
    if (materialType === "new") {
      baseData.cost = "";
    }

    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.RoofThermalInsulationMaterialModal || {}
      : greek_text.RoofThermalInsulationMaterialModal || {};

  const surfaceTypeOptions = [
    {
      value: "external_horizontal_roof",
      label:
        language === "en"
          ? "External horizontal or inclined surface in contact with outdoor air (roofs)"
          : "Εξωτερική οριζόντια ή κεκλιμένη επιφάνεια σε επαφή με τον εξωτερικό αέρα (οροφές)",
    },
  ];

  // Load available materials on mount
  useEffect(() => {
    if (open) {
      fetchAvailableMaterials();
    }
  }, [open]);

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      if (editItem) {
        // Edit mode - populate form with existing data
        setFormData({
          material: editItem.material || "",
          surface_type: editItem.surface_type || "external_horizontal_roof",
          thickness: editItem.thickness || "",
          surface_area: editItem.surface_area || "",
          material_type: materialType,
          ...(materialType === "new" && { cost: editItem.cost || "" }),
        });

        // Set selected material if editing
        if (editItem.material) {
          const material = availableMaterials.find(
            (m) => m.uuid === editItem.material
          );
          if (material) {
            setSelectedMaterial(material);
          }
        }
      } else {
        // Create mode - reset to initial state
        setFormData(getInitialFormData());
        setSelectedMaterial(null);
      }
      setValidationErrors({});
      setError(null);
    }
  }, [open, editItem, materialType, availableMaterials]);

  const fetchAvailableMaterials = () => {
    if (!token) return;

    $.ajax({
      url: "http://127.0.0.1:8000/roof_thermal_insulations/materials/available/",
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        setAvailableMaterials(response.data || []);
      },
      error: (jqXHR) => {
        console.error("Error fetching available materials:", jqXHR);
        setError(
          translations.errorLoadMaterials || "Σφάλμα κατά τη φόρτωση υλικών"
        );
      },
    });
  };

  const handleMaterialChange = (e) => {
    const materialUuid = e.target.value;
    const material = availableMaterials.find((m) => m.uuid === materialUuid);

    setFormData((prev) => ({
      ...prev,
      material: materialUuid,
    }));
    setSelectedMaterial(material);

    // Clear validation error for material field
    if (validationErrors.material) {
      setValidationErrors((prev) => ({
        ...prev,
        material: null,
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.material) {
      errors.material =
        translations.materialRequired || "Το υλικό είναι υποχρεωτικό";
    }

    if (!formData.thickness || parseFloat(formData.thickness) <= 0) {
      errors.thickness =
        translations.thicknessRequired ||
        "Το πάχος πρέπει να είναι θετικός αριθμός";
    }

    if (!formData.surface_area || parseFloat(formData.surface_area) <= 0) {
      errors.surface_area =
        translations.surfaceAreaRequired ||
        "Η επιφάνεια πρέπει να είναι θετικός αριθμός";
    }

    if (
      materialType === "new" &&
      (!formData.cost || parseFloat(formData.cost) < 0)
    ) {
      errors.cost =
        translations.costRequired ||
        "Το κόστος πρέπει να είναι μη αρνητικός αριθμός";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    const submitData = {
      ...formData,
      thickness: parseFloat(formData.thickness),
      surface_area: parseFloat(formData.surface_area),
      ...(materialType === "new" && { cost: parseFloat(formData.cost) }),
    };

    const url = editItem
      ? `http://127.0.0.1:8000/roof_thermal_insulations/material-layers/${editItem.uuid}/`
      : `http://127.0.0.1:8000/roof_thermal_insulations/${roofThermalInsulationUuid}/materials/add/`;

    const method = editItem ? "PUT" : "POST";

    $.ajax({
      url,
      method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(submitData),
      success: (data) => {
        setLoading(false);
        onSubmitSuccess(data);
        handleClose();
      },
      error: (jqXHR) => {
        console.error("Error saving material:", jqXHR);
        setLoading(false);

        if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
          setValidationErrors(jqXHR.responseJSON.errors);
        } else {
          setError(
            translations.errorSave || "Σφάλμα κατά την αποθήκευση του υλικού"
          );
        }
      },
    });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {editItem
              ? translations.editMaterial || "Επεξεργασία Υλικού"
              : materialType === "old"
              ? translations.addOldMaterial || "Προσθήκη Υπάρχοντος Υλικού"
              : translations.addNewMaterial || "Προσθήκη Νέου Υλικού"}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Material Selection */}
            <div className="form-group">
              <label htmlFor="material">
                {translations.material || "Υλικό"} *
              </label>
              <select
                id="material"
                value={formData.material}
                onChange={handleMaterialChange}
                className={validationErrors.material ? "error" : ""}
                required>
                <option value="">
                  {translations.selectMaterial || "Επιλέξτε υλικό"}
                </option>
                {availableMaterials.map((material) => (
                  <option key={material.uuid} value={material.uuid}>
                    {material.name} ({material.thermal_conductivity} W/m·K)
                  </option>
                ))}
              </select>
              {validationErrors.material && (
                <div className="error-text">{validationErrors.material}</div>
              )}
            </div>

            {/* Material Details Display */}
            {selectedMaterial && (
              <div className="material-details">
                <h4>{translations.materialDetails || "Στοιχεία Υλικού"}</h4>
                <p>
                  <strong>
                    {translations.thermalConductivity || "Θερμική Αγωγιμότητα"}:
                  </strong>{" "}
                  {selectedMaterial.thermal_conductivity} W/m·K
                </p>
                <p>
                  <strong>{translations.density || "Πυκνότητα"}:</strong>{" "}
                  {selectedMaterial.density} kg/m³
                </p>
                {selectedMaterial.description && (
                  <p>
                    <strong>{translations.description || "Περιγραφή"}:</strong>{" "}
                    {selectedMaterial.description}
                  </p>
                )}
              </div>
            )}

            {/* Surface Type */}
            <div className="form-group">
              <label htmlFor="surface_type">
                {translations.surfaceType || "Τύπος Επιφάνειας"} *
              </label>
              <select
                id="surface_type"
                value={formData.surface_type}
                onChange={(e) =>
                  handleInputChange("surface_type", e.target.value)
                }
                required>
                {surfaceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Thickness */}
            <div className="form-group">
              <label htmlFor="thickness">
                {translations.thickness || "Πάχος"} (m) *
              </label>
              <input
                type="number"
                id="thickness"
                step="0.001"
                min="0"
                value={formData.thickness}
                onChange={(e) => handleInputChange("thickness", e.target.value)}
                className={validationErrors.thickness ? "error" : ""}
                required
              />
              {validationErrors.thickness && (
                <div className="error-text">{validationErrors.thickness}</div>
              )}
            </div>

            {/* Surface Area */}
            <div className="form-group">
              <label htmlFor="surface_area">
                {translations.surfaceArea || "Επιφάνεια"} (m²) *
              </label>
              <input
                type="number"
                id="surface_area"
                step="0.01"
                min="0"
                value={formData.surface_area}
                onChange={(e) =>
                  handleInputChange("surface_area", e.target.value)
                }
                className={validationErrors.surface_area ? "error" : ""}
                required
              />
              {validationErrors.surface_area && (
                <div className="error-text">
                  {validationErrors.surface_area}
                </div>
              )}
            </div>

            {/* Cost (only for new materials) */}
            {materialType === "new" && (
              <div className="form-group">
                <label htmlFor="cost">
                  {translations.cost || "Κόστος"} (€)
                </label>
                <input
                  type="number"
                  id="cost"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  className={validationErrors.cost ? "error" : ""}
                />
                {validationErrors.cost && (
                  <div className="error-text">{validationErrors.cost}</div>
                )}
              </div>
            )}

            {/* Thermal Resistance Calculation Display */}
            {selectedMaterial && formData.thickness && (
              <div className="calculation-info">
                <h4>{translations.thermalResistance || "Θερμική Αντίσταση"}</h4>
                <p>
                  R = {formData.thickness} /{" "}
                  {selectedMaterial.thermal_conductivity} ={" "}
                  {(
                    parseFloat(formData.thickness) /
                    selectedMaterial.thermal_conductivity
                  ).toFixed(4)}{" "}
                  m²·K/W
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}>
                {translations.cancel || "Ακύρωση"}
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? translations.saving || "Αποθήκευση..."
                  : translations.save || "Αποθήκευση"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoofThermalInsulationMaterialModal;
