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

const RoofThermalInsulationMaterialModal = ({
  open,
  handleClose,
  roofThermalInsulationUuid,
  materialType = "new",
  editItem = null,
  onSubmitSuccess,
}) => {
  useModalBlur(open);

  const getInitialFormData = () => {
    const baseData = {
      material: "",
      surface_type: "external_horizontal_roof", // Default for roofs
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

  useEffect(() => {
    if (open) {
      fetchAvailableMaterials();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editItem) {
        setFormData({
          material: editItem.material || "",
          surface_type: editItem.surface_type || "external_horizontal_roof",
          thickness: editItem.thickness || "",
          surface_area: editItem.surface_area || "",
          material_type: materialType,
          ...(materialType === "new" && { cost: editItem.cost || "" }),
        });

        if (editItem.material) {
          const material = availableMaterials.find(
            (m) => m.uuid === editItem.material
          );
          if (material) {
            setSelectedMaterial(material);
          }
        }
      } else {
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
      url: `${API_BASE_URL}/roof_thermal_insulations/materials/available/`,
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

  const handleMaterialChange = (e) => {
    const materialUuid = e.target.value;
    const material = availableMaterials.find((m) => m.uuid === materialUuid);

    setFormData((prev) => ({
      ...prev,
      material: materialUuid,
    }));
    setSelectedMaterial(material);
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
      ? `${API_BASE_URL}/roof_thermal_insulations/material-layers/${editItem.uuid}/`
      : `${API_BASE_URL}/roof_thermal_insulations/${roofThermalInsulationUuid}/materials/add/`;

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

  const modalTitle = editItem
    ? translations.editMaterial || "Επεξεργασία Υλικού"
    : materialType === "old"
    ? translations.addOldMaterial || "Προσθήκη Παλιού Υλικού"
    : translations.addNewMaterial || "Προσθήκη Νέου Υλικού";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-4xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-center">{modalTitle}</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material Selection */}
            <div className="md:col-span-2">
              <label htmlFor="material" className="label-name">
                {translations.material || "Υλικό"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="material"
                value={formData.material}
                onChange={handleMaterialChange}
                className={`input-field ${
                  validationErrors.material ? "error-input" : ""
                }`}>
                <option value="">
                  {translations.selectMaterial || "Επιλέξτε υλικό"}
                </option>{" "}
                {availableMaterials.map((material) => (
                  <option key={material.uuid} value={material.uuid}>
                    {material.name} - λ = {material.thermal_conductivity} W/mK |{" "}
                    {material.category_display}
                  </option>
                ))}
              </select>{" "}
              {validationErrors.material && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.material}
                </div>
              )}
            </div>

            {/* Surface Type */}
            <div className="md:col-span-2">
              <label htmlFor="surface_type" className="label-name">
                {translations.surfaceType || "Τύπος Επιφάνειας"}
                <span className="text-red-500 ml-1">*</span>
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
            </div>

            {/* Thickness */}
            <InputEntryModal
              entry={`${translations.thickness || "Πάχος"} (m)`}
              id="thickness"
              type="number"
              step="0.001"
              min="0"
              value={formData.thickness}
              onChange={(e) => handleInputChange("thickness", e.target.value)}
              example={translations.thicknessPlaceholder || "π.χ. 0.050"}
              error={validationErrors.thickness}
              required
            />

            {/* Surface Area */}
            <InputEntryModal
              entry={`${translations.surfaceArea || "Επιφάνεια"} (m²)`}
              id="surface_area"
              type="number"
              step="0.01"
              min="0"
              value={formData.surface_area}
              onChange={(e) =>
                handleInputChange("surface_area", e.target.value)
              }
              example={translations.surfaceAreaPlaceholder || "π.χ. 25.50"}
              error={validationErrors.surface_area}
              required
            />

            {/* Cost (only for new materials) */}
            {materialType === "new" && (
              <InputEntryModal
                entry={`${translations.cost || "Κόστος"} (€)`}
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                error={validationErrors.cost}
              />
            )}

            {/* Thermal Resistance Calculation Display */}
            {selectedMaterial && formData.thickness && (
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  {translations.thermalResistance || "Θερμική Αντίσταση"}
                </h4>
                <p className="text-sm text-green-700">
                  R = {formData.thickness} /{" "}
                  {selectedMaterial.thermal_conductivity} ={" "}
                  <strong>
                    {(
                      parseFloat(formData.thickness) /
                      selectedMaterial.thermal_conductivity
                    ).toFixed(4)}{" "}
                    m²·K/W
                  </strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              className="close-modal"
              onClick={handleClose}
              disabled={loading}>
              {translations.cancel || "Ακύρωση"}
            </button>
            <button type="submit" className="confirm-button" disabled={loading}>
              {loading
                ? translations.saving || "Αποθήκευση..."
                : translations.save || "Αποθήκευση"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoofThermalInsulationMaterialModal;
