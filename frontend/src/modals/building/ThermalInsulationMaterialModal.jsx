import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import API_BASE_URL from "../../config/api.js";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";
import "../../assets/styles/forms.css";

const ThermalInsulationMaterialModal = ({
  open,
  handleClose,
  thermalInsulationUuid,
  materialType = "new", // 'old' or 'new'
  editItem = null,
  onSubmitSuccess,
}) => {
  useModalBlur(open);

  const getInitialFormData = () => {
    const baseData = {
      material: "",
      surface_type: "external_walls_outdoor",
      thickness: "",
      surface_area: "",
      material_type: materialType,
    };

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
      ? english_text.ThermalInsulationMaterialModal || {}
      : greek_text.ThermalInsulationMaterialModal || {};
  const surfaceTypeOptions = [
    {
      value: "external_walls_outdoor",
      label:
        language === "en"
          ? "External walls in contact with outdoor air"
          : "Εξωτερικοί τοίχοι σε επαφή με τον εξωτερικό αέρα",
    },
  ];

  useEffect(() => {
    fetchAvailableMaterials();
    if (editItem) {
      const editData = {
        material: editItem.material || "",
        surface_type: editItem.surface_type || "external_walls_outdoor",
        thickness: editItem.thickness || "",
        surface_area: editItem.surface_area || "",
        material_type: editItem.material_type || materialType,
      };

      if (materialType === "new") {
        editData.cost = editItem.cost || "";
      }

      setFormData(editData);

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
      url: `${API_BASE_URL}/thermal_insulations/materials/available/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        setAvailableMaterials(response.data || []);
      },
      error: (jqXHR) => {

        setError(
          translations.errorLoadMaterials || "Σφάλμα κατά τη φόρτωση υλικών"
        );
      },
    });
  };
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // If material is selected, update the selected material info
    if (field === "material") {
      const material = availableMaterials.find((m) => m.uuid === value);
      setSelectedMaterial(material);
    }
  };
  const calculateUCoefficient = () => {
    if (
      selectedMaterial &&
      formData.thickness &&
      selectedMaterial.thermal_conductivity > 0
    ) {
      const thermalResistance =
        parseFloat(formData.thickness) / selectedMaterial.thermal_conductivity;
      return 1 / thermalResistance; // U = 1/R
    }
    return 0;
  };
  const validateForm = () => {
    const errors = {};

    if (!formData.material) {
      errors.material =
        translations.materialRequired || "Παρακαλώ επιλέξτε υλικό";
    }

    if (!formData.thickness) {
      errors.thickness =
        translations.thicknessRequired || "Παρακαλώ εισάγετε το πάχος";
    }
    if (!formData.surface_area) {
      errors.surface_area =
        translations.surfaceAreaRequired || "Παρακαλώ εισάγετε την επιφάνεια";
    }

    // Only validate cost for new materials
    if (materialType === "new" && !formData.cost) {
      errors.cost = translations.costRequired || "Παρακαλώ εισάγετε το κόστος";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!token || !thermalInsulationUuid) return; // Validate form
    if (!validateForm()) {
      setError(
        translations.errorValidation ||
          "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία"
      );
      return;
    }

    setLoading(true);
    setError(null);

    const url = editItem
      ? `${API_BASE_URL}/thermal_insulations/material-layers/${editItem.uuid}/`
      : `${API_BASE_URL}/thermal_insulations/${thermalInsulationUuid}/materials/add/`;

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

        setLoading(false);
        if (onSubmitSuccess) {
          onSubmitSuccess(data);
        }
        handleClose();
      },
      error: (jqXHR) => {

        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            "Σφάλμα κατά την αποθήκευση του υλικού"
        );
        setLoading(false);
      },
    });
  };
  const handleCancel = () => {
    const resetData = {
      material: "",
      surface_type: "external_walls_outdoor",
      thickness: "",
      surface_area: "",
      material_type: materialType,
    };

    if (materialType === "new") {
      resetData.cost = "";
    }

    setFormData(resetData);
    setSelectedMaterial(null);
    setError(null);
    setValidationErrors({});
    handleClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-4xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        {" "}
        <h2 className="text-lg font-bold mb-4 text-center">
          {editItem
            ? translations.editMaterial || "Επεξεργασία"
            : materialType === "old"
            ? translations.addOldMaterial || "Προσθήκη Παλιού Υλικού"
            : translations.addNewMaterial || "Προσθήκη Νέου Υλικού"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            {/* Material Selection */}
            <div className="md:col-span-2">
              <label htmlFor="material" className="label-name text-red-600">
                {translations.material || "Υλικό"}{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                className={`input-field ${
                  validationErrors.material ? "error-input" : ""
                }`}>
                <option value="">
                  {translations.selectMaterial || "Επιλέξτε υλικό"}
                </option>
                {availableMaterials.map((material) => (
                  <option key={material.uuid} value={material.uuid}>
                    {material.name} - λ = {material.thermal_conductivity} W/mK |{" "}
                    {material.category_display}
                  </option>
                ))}
              </select>
              {validationErrors.material && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.material}
                </div>
              )}
            </div>{" "}
            {/* Surface Type - Fixed to External Walls */}
            <div className="md:col-span-2">
              <label htmlFor="surface_type" className="label-name text-red-600">
                {translations.surfaceType || "Τύπος Επιφάνειας"}{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                id="surface_type"
                value={formData.surface_type}
                onChange={(e) =>
                  handleInputChange("surface_type", e.target.value)
                }
                className="input-field">
                {surfaceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>{" "}
            {/* Thickness */}
            <InputEntryModal
              entry={`${translations.thickness || "Πάχος"} (m)`}
              id="thickness"
              type="number"
              step="0.001"
              min="0.001"
              value={formData.thickness}
              onChange={(e) => handleInputChange("thickness", e.target.value)}
              example={translations.thicknessPlaceholder || "π.χ. 0.050"}
              error={validationErrors.thickness}
              required={true}
            />{" "}
            {/* Surface Area */}
            <InputEntryModal
              entry={`${translations.surfaceArea || "Επιφάνεια"} (m²)`}
              id="surface_area"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.surface_area}
              onChange={(e) =>
                handleInputChange("surface_area", e.target.value)
              }
              example={translations.surfaceAreaPlaceholder || "π.χ. 25.50"}
              error={validationErrors.surface_area}
              required={true}
            />{" "}
            {/* Cost - Only for new materials */}
            {materialType === "new" && (
              <InputEntryModal
                entry={`${translations.cost || "Κόστος"} (€)`}
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                example={translations.costPlaceholder || "π.χ. 1250.00"}
                error={validationErrors.cost}
                required={true}
              />
            )}
          </div>{" "}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="close-modal">
              {translations.cancel || "Ακύρωση"}
            </button>
            <button type="submit" disabled={loading} className="confirm-button">
              {loading
                ? translations.saving || "Αποθήκευση..."
                : editItem
                ? translations.save || "Ενημέρωση"
                : translations.save || "Προσθήκη"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThermalInsulationMaterialModal;
