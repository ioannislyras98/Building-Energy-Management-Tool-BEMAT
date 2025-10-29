import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import API_BASE_URL from "../../config/api.js";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";
import "./../../assets/styles/forms.css";

const cookies = new Cookies();

function CoolingSystemModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
  const [formData, setFormData] = useState({
    cooling_system_type: "",
    cooling_unit_accessibility: "",
    heat_pump_type: "",
    power_kw: "",
    construction_year: "",
    energy_efficiency_ratio: "",
    maintenance_period: "",
    operating_hours: "",
  });
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  useModalBlur(open);

  useEffect(() => {
    if (editItem) {
      setFormData({
        cooling_system_type: editItem.cooling_system_type || "",
        cooling_unit_accessibility: editItem.cooling_unit_accessibility || "",
        heat_pump_type: editItem.heat_pump_type || "",
        power_kw: editItem.power_kw || "",
        construction_year: editItem.construction_year || "",
        energy_efficiency_ratio: editItem.energy_efficiency_ratio || "",
        maintenance_period: editItem.maintenance_period || "",
        operating_hours: editItem.operating_hours || "",
      });
    } else {
      resetForm();
    }
    setErrors({});
    setShowValidationErrors(false);
  }, [editItem, open]);

  const isEditMode = !!editItem;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Required fields
    if (!formData.cooling_system_type) {
      newErrors.cooling_system_type =
        params.errorRequired || "Field is required";
      hasErrors = true;
    }

    if (!formData.power_kw || formData.power_kw === "") {
      newErrors.power_kw = params.errorRequired || "Field is required";
      hasErrors = true;
    } else if (isNaN(formData.power_kw) || parseFloat(formData.power_kw) <= 0) {
      newErrors.power_kw =
        params.errorPositiveNumber || "Must be a positive number";
      hasErrors = true;
    }

    // Optional field validations
    if (
      formData.energy_efficiency_ratio &&
      formData.energy_efficiency_ratio !== "" &&
      (isNaN(formData.energy_efficiency_ratio) ||
        parseFloat(formData.energy_efficiency_ratio) <= 0)
    ) {
      newErrors.energy_efficiency_ratio =
        params.errorPositiveNumber || "Must be a positive number";
      hasErrors = true;
    }

    setErrors(newErrors);
    setShowValidationErrors(true);
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const apiData = {
      project: projectUuid,
      building: buildingUuid,
      cooling_system_type: formData.cooling_system_type,
      cooling_unit_accessibility: formData.cooling_unit_accessibility,
      heat_pump_type: formData.heat_pump_type,
      power_kw: formData.power_kw ? parseFloat(formData.power_kw) : null,
      construction_year: formData.construction_year
        ? parseInt(formData.construction_year)
        : null,
      energy_efficiency_ratio: formData.energy_efficiency_ratio
        ? parseFloat(formData.energy_efficiency_ratio)
        : null,
      maintenance_period: formData.maintenance_period,
      operating_hours: formData.operating_hours,
    };

    const url = isEditMode
      ? `${API_BASE_URL}/cooling_systems/update/${editItem.uuid}/`
      : `${API_BASE_URL}/cooling_systems/create/`;

    const method = isEditMode ? "PUT" : "POST";

    $.ajax({
      url: url,
      method: method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(apiData),
      success: (response) => {

        onSubmitSuccess(response);
        resetForm();
        onClose();
      },
      error: (jqXHR) => {

        handleApiError(jqXHR);
      },
    });
  };

  const handleApiError = (jqXHR) => {
    if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
      const backendErrors = jqXHR.responseJSON.error;
      if (typeof backendErrors === "string") {
        setErrors({ general: backendErrors });
      } else {
        setErrors(backendErrors);
      }
    } else {
      setErrors({
        general: isEditMode
          ? params.errorUpdate ||
            "Σφάλμα κατά την ενημέρωση του συστήματος ψύξης"
          : params.errorGeneral ||
            "Σφάλμα κατά τη δημιουργία του συστήματος ψύξης",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      cooling_system_type: "",
      cooling_unit_accessibility: "",
      heat_pump_type: "",
      power_kw: "",
      construction_year: "",
      energy_efficiency_ratio: "",
      maintenance_period: "",
      operating_hours: "",
    });
    setErrors({});
    setShowValidationErrors(false);
  };

  const submitButtonText = isEditMode
    ? params.update || "Ενημέρωση"
    : params.save || "Αποθήκευση";

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-2xl border-primary-light border-2 bg-white shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">
          {isEditMode
            ? params.editTitleCooling || "Επεξεργασία Συστήματος Ψύξης"
            : params.addTitleCooling || "Προσθήκη Συστήματος Ψύξης"}
        </h2>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              {" "}
              <label htmlFor="cooling_system_type" className="label-name">
                {params.coolingSystemType || "Τύπος Συστήματος Ψύξης"}{" "}
                <span className="text-red-500 ml-1">*</span>
              </label>{" "}
              <input
                type="text"
                id="cooling_system_type"
                value={formData.cooling_system_type}
                onChange={handleChange}
                className={`input-field ${
                  errors.cooling_system_type && showValidationErrors
                    ? "error-input"
                    : ""
                }`}
                placeholder={
                  params.coolingSystemTypePlaceholder ||
                  "Εισάγετε τον τύπο του συστήματος ψύξης"
                }
              />
              {showValidationErrors && errors.cooling_system_type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.cooling_system_type}
                </div>
              )}
            </div>{" "}
            <div className="mb-4">
              <label
                htmlFor="cooling_unit_accessibility"
                className="label-name">
                {params.coolingUnitAccessibility ||
                  "Δυνατότητα Πρόσβασης στη Μονάδα Ψύξης"}
              </label>
              <input
                type="text"
                id="cooling_unit_accessibility"
                value={formData.cooling_unit_accessibility}
                onChange={handleChange}
                className={`input-field ${
                  errors.cooling_unit_accessibility && showValidationErrors
                    ? "error-input"
                    : ""
                }`}
                placeholder={
                  params.coolingUnitAccessibilityPlaceholder ||
                  "Εισάγετε τη δυνατότητα πρόσβασης στη μονάδα ψύξης"
                }
              />
              {showValidationErrors && errors.cooling_unit_accessibility && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.cooling_unit_accessibility}
                </div>
              )}
            </div>{" "}
            <InputEntryModal
              entry={params.heatPumpType || "Τύπος Αντλίας Θερμότητας"}
              id="heat_pump_type"
              type="text"
              value={formData.heat_pump_type}
              onChange={handleChange}
              error={showValidationErrors ? errors.heat_pump_type : ""}
            />
            <InputEntryModal
              entry={params.powerKW || "Ισχύς (kW)"}
              id="power_kw"
              type="number"
              value={formData.power_kw}
              onChange={handleChange}
              error={showValidationErrors ? errors.power_kw : ""}
              step="0.01"
              min="0"
              required
            />
            <InputEntryModal
              entry={params.constructionYear || "Έτος Κατασκευής"}
              id="construction_year"
              type="number"
              value={formData.construction_year}
              onChange={handleChange}
              error={showValidationErrors ? errors.construction_year : ""}
              min="1900"
              max={new Date().getFullYear()}
            />
            <InputEntryModal
              entry={
                params.energyEfficiencyRatio ||
                "Συντελεστής Ενεργειακής Απόδοσης (EER)"
              }
              id="energy_efficiency_ratio"
              type="number"
              value={formData.energy_efficiency_ratio}
              onChange={handleChange}
              error={showValidationErrors ? errors.energy_efficiency_ratio : ""}
              step="0.01"
              min="0"
            />
            <InputEntryModal
              entry={params.maintenancePeriod || "Περίοδος Συντήρησης"}
              id="maintenance_period"
              type="text"
              value={formData.maintenance_period}
              onChange={handleChange}
              error={showValidationErrors ? errors.maintenance_period : ""}
            />
            <InputEntryModal
              entry={params.operatingHours || "Ώρες Λειτουργίας"}
              id="operating_hours"
              type="text"
              value={formData.operating_hours}
              onChange={handleChange}
              error={showValidationErrors ? errors.operating_hours : ""}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button type="button" onClick={onClose} className="close-modal">
              {params.cancel || "Ακύρωση"}
            </button>
            <button type="submit" className="confirm-button">
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CoolingSystemModal(props) {
  const { language } = useLanguage();

  let translations;
  if (language === "en") {
    translations = english_text.BuildingProfile?.tabs?.systemsContent || {};
  } else {
    translations = greek_text.BuildingProfile?.tabs?.systemsContent || {};
  }

  return <CoolingSystemModalForm {...props} params={translations} />;
}

export default CoolingSystemModal;
