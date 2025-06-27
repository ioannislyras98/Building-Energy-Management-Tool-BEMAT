import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import "../../assets/styles/forms.css";

const ThermalInsulationMaterialModal = ({
  open,
  handleClose,
  thermalInsulationUuid,
  materialType = "new", // 'old' or 'new'
  editItem = null,
  onSubmitSuccess,
}) => {
  // Initialize form data based on material type
  const getInitialFormData = () => {
    const baseData = {
      material: "",
      surface_type: "external_walls_outdoor",
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
      ? english_text.ThermalInsulationMaterialModal || {}
      : greek_text.ThermalInsulationMaterialModal || {};
  const surfaceTypeOptions = [
    {
      value: "external_walls_outdoor",
      label: "Εξωτερικοί τοίχοι σε επαφή με τον εξωτερικό αέρα",
    },
  ];

  useEffect(() => {
    fetchAvailableMaterials();    if (editItem) {
      const editData = {
        material: editItem.material || "",
        surface_type: editItem.surface_type || "external_walls_outdoor",
        thickness: editItem.thickness || "",
        surface_area: editItem.surface_area || "",
        material_type: editItem.material_type || materialType,
      };
      
      // Only include cost for new materials
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
      const thermalResistance = parseFloat(formData.thickness) / selectedMaterial.thermal_conductivity;
      return 1 / thermalResistance; // U = 1/R
    }
    return 0;
  };
  const validateForm = () => {
    const errors = {};
    
    if (!formData.material) {
      errors.material = "Παρακαλώ επιλέξτε υλικό";
    }
    
    if (!formData.thickness) {
      errors.thickness = "Παρακαλώ εισάγετε το πάχος";
    }
      if (!formData.surface_area) {
      errors.surface_area = "Παρακαλώ εισάγετε την επιφάνεια";
    }
    
    // Only validate cost for new materials
    if (materialType === "new" && !formData.cost) {
      errors.cost = "Παρακαλώ εισάγετε το κόστος";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!token || !thermalInsulationUuid) return;

    // Validate form
    if (!validateForm()) {
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
  };  const handleCancel = () => {
    const resetData = {
      material: "",
      surface_type: "external_walls_outdoor",
      thickness: "",
      surface_area: "",
      material_type: materialType,
    };
    
    // Only include cost for new materials
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
      <div className="rounded-lg p-6 w-full max-w-4xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">        <h2 className="text-lg font-bold mb-4 text-center">
          {editItem ? "Επεξεργασία" : "Προσθήκη"}{" "}
          {materialType === "old" ? "Παλιού" : "Νέου"} Υλικού
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            {/* Material Selection */}
            <div className="md:col-span-2">
              <label htmlFor="material" className="label-name text-red-600">
                Υλικό <span className="text-red-600">*</span>
              </label>
              <select
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                className={`input-field ${validationErrors.material ? "error-input" : ""}`}
                required>
                <option value="">Επιλέξτε υλικό</option>
                {availableMaterials.map((material) => (
                  <option key={material.uuid} value={material.uuid}>
                    {material.name} - λ = {material.thermal_conductivity} W/mK | {material.category_display}
                  </option>
                ))}
              </select>
              {validationErrors.material && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.material}
                </div>
              )}
            </div>

            {/* Material Info Display */}
            {selectedMaterial && (
              <div className="md:col-span-2">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Επιλεγμένο Υλικό: {selectedMaterial.name}
                  </h4>                  <p className="text-sm text-gray-600 mb-1">
                    Συντελεστής θερμικής αγωγιμότητας: {selectedMaterial.thermal_conductivity} W/mK
                  </p>
                  {formData.thickness && (
                    <p className="text-sm font-medium text-primary">
                      Συντελεστής Θερμοπερατότητας (U): {calculateUCoefficient().toFixed(3)} W/m²K
                    </p>
                  )}                </div>
              </div>
            )}

            {/* Surface Type - Fixed to External Walls */}
            <div className="md:col-span-2">
              <label htmlFor="surface_type" className="label-name text-red-600">
                Τύπος Επιφάνειας <span className="text-red-600">*</span>
              </label>
              <select
                id="surface_type"
                value={formData.surface_type}
                onChange={(e) => handleInputChange("surface_type", e.target.value)}
                className="input-field"
                required>
                {surfaceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>            {/* Thickness */}
            <div>
              <label htmlFor="thickness" className="label-name text-red-600">
                Πάχος (m) <span className="text-red-600">*</span>
              </label>
              <input
                id="thickness"
                type="number"
                value={formData.thickness}
                onChange={(e) => handleInputChange("thickness", e.target.value)}
                className={`input-field ${validationErrors.thickness ? "error-input" : ""}`}
                step="0.001"
                min="0.001"
                placeholder="π.χ. 0.050"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Πάχος του υλικού σε μέτρα</p>
              {validationErrors.thickness && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.thickness}
                </div>
              )}
            </div>            {/* Surface Area */}
            <div>
              <label htmlFor="surface_area" className="label-name text-red-600">
                Επιφάνεια (m²) <span className="text-red-600">*</span>
              </label>
              <input
                id="surface_area"
                type="number"
                value={formData.surface_area}
                onChange={(e) => handleInputChange("surface_area", e.target.value)}
                className={`input-field ${validationErrors.surface_area ? "error-input" : ""}`}
                step="0.01"
                min="0.01"
                placeholder="π.χ. 25.50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Επιφάνεια σε τετραγωνικά μέτρα</p>
              {validationErrors.surface_area && (
                <div className="text-red-500 text-xs mt-1">
                  {validationErrors.surface_area}
                </div>
              )}            </div>

            {/* Cost - Only for new materials */}
            {materialType === "new" && (
              <div className="md:col-span-2">
                <label htmlFor="cost" className="label-name text-red-600">
                  Κόστος (€) <span className="text-red-600">*</span>
                </label>
                <input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  className={`input-field ${validationErrors.cost ? "error-input" : ""}`}
                  step="0.01"
                  min="0"
                  placeholder="π.χ. 1250.00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Κόστος του υλικού και εργασίας σε ευρώ</p>
                {validationErrors.cost && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.cost}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="close-modal">
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={loading}
              className="confirm-button">
              {loading ? "Αποθήκευση..." : editItem ? "Ενημέρωση" : "Προσθήκη"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThermalInsulationMaterialModal;
