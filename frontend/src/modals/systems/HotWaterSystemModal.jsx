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

function HotWaterSystemModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
  const [formData, setFormData] = useState({
    heating_system_type: "",
    boiler_type: "",
    power_kw: "",
    thermal_efficiency: "",
    distribution_network_state: "",
    storage_tank_state: "",
    energy_metering_system: "",
  });
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  useModalBlur(open);

  useEffect(() => {
    if (editItem) {
      setFormData({
        heating_system_type: editItem.heating_system_type || "",
        boiler_type: editItem.boiler_type || "",
        power_kw: editItem.power_kw || "",
        thermal_efficiency: editItem.thermal_efficiency || "",
        distribution_network_state: editItem.distribution_network_state || "",
        storage_tank_state: editItem.storage_tank_state || "",
        energy_metering_system: editItem.energy_metering_system || "",
      });
    } else {
      setFormData({
        heating_system_type: "",
        boiler_type: "",
        power_kw: "",
        thermal_efficiency: "",
        distribution_network_state: "",
        storage_tank_state: "",
        energy_metering_system: "",
      });
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
    if (!formData.heating_system_type) {
      newErrors.heating_system_type =
        params.errorRequired || "Field is required";
      hasErrors = true;
    }

    if (!formData.boiler_type) {
      newErrors.boiler_type = params.errorRequired || "Field is required";
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
      formData.thermal_efficiency &&
      formData.thermal_efficiency !== "" &&
      (isNaN(formData.thermal_efficiency) ||
        parseFloat(formData.thermal_efficiency) < 0 ||
        parseFloat(formData.thermal_efficiency) > 100)
    ) {
      newErrors.thermal_efficiency =
        params.errorEfficiencyRange || "Must be between 0-100%";
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
      heating_system_type: formData.heating_system_type,
      boiler_type: formData.boiler_type,
      power_kw: formData.power_kw ? parseFloat(formData.power_kw) : null,
      thermal_efficiency: formData.thermal_efficiency
        ? parseFloat(formData.thermal_efficiency)
        : null,
      distribution_network_state: formData.distribution_network_state,
      storage_tank_state: formData.storage_tank_state,
      energy_metering_system: formData.energy_metering_system,
    };

    const url = isEditMode
      ? `${API_BASE_URL}/domestic_hot_water_systems/update/${editItem.uuid}/`
      : `${API_BASE_URL}/domestic_hot_water_systems/create/`;

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
            "Σφάλμα κατά την ενημέρωση του συστήματος ζεστού νερού"
          : params.errorGeneral ||
            "Σφάλμα κατά τη δημιουργία του συστήματος ζεστού νερού",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      heating_system_type: "",
      boiler_type: "",
      power_kw: "",
      thermal_efficiency: "",
      distribution_network_state: "",
      storage_tank_state: "",
      energy_metering_system: "",
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
            ? params.editTitleHotWater ||
              "Επεξεργασία Συστήματος Ζεστού Νερού Χρήσης"
            : params.addTitleHotWater ||
              "Προσθήκη Συστήματος Ζεστού Νερού Χρήσης"}
        </h2>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputEntryModal
              entry={params.heatingSystemType || "Τύπος Συστήματος Θέρμανσης"}
              id="heating_system_type"
              type="text"
              value={formData.heating_system_type}
              onChange={handleChange}
              error={showValidationErrors ? errors.heating_system_type : ""}
              required
            />

            <InputEntryModal
              entry={params.boilerType || "Τύπος Λέβητα"}
              id="boiler_type"
              type="text"
              value={formData.boiler_type}
              onChange={handleChange}
              error={showValidationErrors ? errors.boiler_type : ""}
              required
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
              entry={params.thermalEfficiency || "Θερμικός Βαθμός Απόδοσης (%)"}
              id="thermal_efficiency"
              type="number"
              value={formData.thermal_efficiency}
              onChange={handleChange}
              error={showValidationErrors ? errors.thermal_efficiency : ""}
              step="0.01"
              min="0"
              max="100"
            />

            <InputEntryModal
              entry={
                params.distributionNetworkState || "Κατάσταση Δικτύου Διανομής"
              }
              id="distribution_network_state"
              type="text"
              value={formData.distribution_network_state}
              onChange={handleChange}
              error={
                showValidationErrors ? errors.distribution_network_state : ""
              }
            />

            <InputEntryModal
              entry={
                params.storageTankState || "Κατάσταση Δεξαμενής Αποθήκευσης"
              }
              id="storage_tank_state"
              type="text"
              value={formData.storage_tank_state}
              onChange={handleChange}
              error={showValidationErrors ? errors.storage_tank_state : ""}
            />

            <div className="md:col-span-2">
              <InputEntryModal
                entry={
                  params.energyMeteringSystem || "Σύστημα Μέτρησης Ενέργειας"
                }
                id="energy_metering_system"
                type="text"
                value={formData.energy_metering_system}
                onChange={handleChange}
                error={
                  showValidationErrors ? errors.energy_metering_system : ""
                }
              />
            </div>
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

export default function HotWaterSystemModal(props) {
  const { language } = useLanguage();

  let translations;
  if (language === "en") {
    translations = english_text.BuildingProfile?.tabs?.systemsContent || {};
  } else {
    translations = greek_text.BuildingProfile?.tabs?.systemsContent || {};
  }

  return <HotWaterSystemModalForm {...props} params={translations} />;
}
