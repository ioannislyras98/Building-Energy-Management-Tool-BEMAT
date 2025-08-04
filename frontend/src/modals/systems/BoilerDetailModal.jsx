import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";
import "./../../assets/styles/forms.css";

const cookies = new Cookies();

function BoilerDetailModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {  // Apply blur effect when modal is open
  useModalBlur(open);

  const [formData, setFormData] = useState({
    nominal_power: "",
    internal_efficiency: "",
    manufacturing_year: "",
    fuel_type: "",
    nitrogen_monoxide: "",
    nitrogen_oxides: "",
    exhaust_temperature: "",
    smoke_scale: "",
    room_temperature: "",
  });

  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  useEffect(() => {
    if (editItem) {
      setFormData({
        nominal_power: editItem.nominal_power || "",
        internal_efficiency: editItem.internal_efficiency || "",
        manufacturing_year: editItem.manufacturing_year || "",
        fuel_type: editItem.fuel_type || "",
        nitrogen_monoxide: editItem.nitrogen_monoxide || "",
        nitrogen_oxides: editItem.nitrogen_oxides || "",
        exhaust_temperature: editItem.exhaust_temperature || "",
        smoke_scale: editItem.smoke_scale || "",
        room_temperature: editItem.room_temperature || "",
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
    if (!formData.nominal_power || formData.nominal_power.trim() === "") {
      newErrors.nominal_power = params.errorRequired || "Field is required";
      hasErrors = true;
    } else if (isNaN(formData.nominal_power) || parseFloat(formData.nominal_power) <= 0) {
      newErrors.nominal_power = params.errorPositiveNumber || "Must be a positive number";
      hasErrors = true;
    }

    if (!formData.internal_efficiency || formData.internal_efficiency.trim() === "") {
      newErrors.internal_efficiency = params.errorRequired || "Field is required";
      hasErrors = true;
    } else if (isNaN(formData.internal_efficiency)) {
      newErrors.internal_efficiency = params.errorNumber || "Must be a number";
      hasErrors = true;
    } else if (parseFloat(formData.internal_efficiency) < 0 || parseFloat(formData.internal_efficiency) > 100) {
      newErrors.internal_efficiency = params.errorEfficiencyRange || "Must be between 0-100%";
      hasErrors = true;
    }

    // Optional field validations
    if (!formData.fuel_type) {
      newErrors.fuel_type = params.errorRequired || "Field is required";
      hasErrors = true;
    }

    if (
      formData.smoke_scale &&
      formData.smoke_scale.trim() !== "" &&
      (parseFloat(formData.smoke_scale) < 0 ||
        parseFloat(formData.smoke_scale) > 9)
    ) {
      newErrors.smoke_scale = params.errorSmokeScaleRange || "Must be between 0-9";
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
      nominal_power: formData.nominal_power
        ? parseFloat(formData.nominal_power)
        : null,
      internal_efficiency: formData.internal_efficiency
        ? parseFloat(formData.internal_efficiency)
        : null,
      manufacturing_year: formData.manufacturing_year
        ? parseInt(formData.manufacturing_year)
        : null,
      fuel_type: formData.fuel_type,
      nitrogen_monoxide: formData.nitrogen_monoxide
        ? parseFloat(formData.nitrogen_monoxide)
        : null,
      nitrogen_oxides: formData.nitrogen_oxides
        ? parseFloat(formData.nitrogen_oxides)
        : null,
      exhaust_temperature: formData.exhaust_temperature
        ? parseFloat(formData.exhaust_temperature)
        : null,
      smoke_scale: formData.smoke_scale
        ? parseFloat(formData.smoke_scale)
        : null,
      room_temperature: formData.room_temperature
        ? parseFloat(formData.room_temperature)
        : null,
    };

    const url = isEditMode
      ? `http://127.0.0.1:8000/boiler_details/update/${editItem.uuid}/`
      : "http://127.0.0.1:8000/boiler_details/create/";

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
        console.log("Boiler detail saved:", response);        
        onSubmitSuccess(response);
        resetForm();
        onClose();
      },
      error: (jqXHR) => {
        console.error("Error saving boiler detail:", jqXHR);
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
            "Σφάλμα κατά την ενημέρωση των στοιχείων λέβητα"
          : params.errorGeneral ||
            "Σφάλμα κατά τη δημιουργία των στοιχείων λέβητα",
      });
    }
  };
  const resetForm = () => {
    setFormData({
      nominal_power: "",
      internal_efficiency: "",
      manufacturing_year: "",
      fuel_type: "",
      nitrogen_monoxide: "",
      nitrogen_oxides: "",
      exhaust_temperature: "",
      smoke_scale: "",
      room_temperature: "",
    });
    setErrors({});
    setShowValidationErrors(false);
  };

  if (!open) {
    return null;
  }

  const modalTitle = isEditMode
    ? params.h2_edit || "Επεξεργασία Στοιχείων Λέβητα"
    : params.h2 || "Προσθήκη Στοιχείων Λέβητα";

  const submitButtonText = isEditMode
    ? params.update || "Ενημέρωση"
    : params.save || "Αποθήκευση";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-2xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{modalTitle}</h2>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            <InputEntryModal
              entry={params.nominalPower || "Ονομαστική Ισχύς (kW)"}
              id="nominal_power"
              type="number"
              value={formData.nominal_power}
              onChange={handleChange}
              error={showValidationErrors ? errors.nominal_power : ""}
              step="0.01"
              min="0"
              required
            />
            <InputEntryModal
              entry={params.internalEfficiency || "Βαθμός Απόδοσης (%)"}
              id="internal_efficiency"
              type="number"
              value={formData.internal_efficiency}
              onChange={handleChange}
              error={showValidationErrors ? errors.internal_efficiency : ""}
              step="0.01"
              min="0"
              max="100"
              required
            />
            <InputEntryModal
              entry={params.manufacturingYear || "Έτος Κατασκευής"}
              id="manufacturing_year"
              type="number"
              value={formData.manufacturing_year}
              onChange={handleChange}
              error={showValidationErrors ? errors.manufacturing_year : ""}
              min="1900"
              max={new Date().getFullYear()}
            />
            <div className="mb-4">
              <label htmlFor="fuel_type" className="label-name">
                {params.fuelType || "Είδος Καυσίμου"}{" "}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className={`input-field ${
                  errors.fuel_type && showValidationErrors ? "error-input" : ""
                }`}
                placeholder={
                  params.fuelTypePlaceholder || "Εισάγετε το είδος καυσίμου"
                }
              />
              {showValidationErrors && errors.fuel_type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.fuel_type}
                </div>
              )}
            </div>
            <InputEntryModal
              entry={params.nitrogenMonoxide || "Μονοξείδιο Αζώτου (ppm)"}
              id="nitrogen_monoxide"
              type="number"
              value={formData.nitrogen_monoxide}
              onChange={handleChange}
              error={showValidationErrors ? errors.nitrogen_monoxide : ""}
              step="0.01"
              min="0"
              max="65"
            />
            <InputEntryModal
              entry={params.nitrogenOxides || "Οξείδια Αζώτου (ppm)"}
              id="nitrogen_oxides"
              type="number"
              value={formData.nitrogen_oxides}
              onChange={handleChange}
              error={showValidationErrors ? errors.nitrogen_oxides : ""}
              step="0.01"
              min="0"
              max="65"
            />
            <InputEntryModal
              entry={params.exhaustTemperature || "Θερμοκρασία Καυσαερίων (°C)"}
              id="exhaust_temperature"
              type="number"
              value={formData.exhaust_temperature}
              onChange={handleChange}
              error={showValidationErrors ? errors.exhaust_temperature : ""}
              step="0.01"
              min="0"
            />
            <InputEntryModal
              entry={params.smokeScale || "Κλίμακα Καπνού (0-9)"}
              id="smoke_scale"
              type="number"
              value={formData.smoke_scale}
              onChange={handleChange}
              error={showValidationErrors ? errors.smoke_scale : ""}
              step="0.1"
              min="0"
              max="9"
            />
            <InputEntryModal
              entry={params.roomTemperature || "Θερμοκρασία Χώρου (°C)"}
              id="room_temperature"
              type="number"
              value={formData.room_temperature}
              onChange={handleChange}
              error={showValidationErrors ? errors.room_temperature : ""}
              step="0.01"
            />
          </div>          <div className="flex justify-between mt-6">
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

export default function BoilerDetailModal({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
}) {
  const { language } = useLanguage();
  const params =
    language === "en"
      ? english_text.BuildingProfile?.tabs?.systemsContent || {}
      : greek_text.BuildingProfile?.tabs?.systemsContent || {};

  return (
    <BoilerDetailModalForm
      open={open}
      onClose={onClose}
      projectUuid={projectUuid}
      buildingUuid={buildingUuid}
      onSubmitSuccess={onSubmitSuccess}
      editItem={editItem}
      params={params}
    />
  );
}
