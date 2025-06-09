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
  const token = cookies.get("token") || "";

  // Apply blur effect using hook
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
    }
  }, [editItem]);

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
    if (
      formData.thermal_efficiency &&
      (parseFloat(formData.thermal_efficiency) < 0 ||
        parseFloat(formData.thermal_efficiency) > 100)
    ) {
      newErrors.thermal_efficiency =
        params.errorEfficiencyRange ||
        "Ο θερμικός βαθμός απόδοσης πρέπει να είναι μεταξύ 0-100%";
      hasErrors = true;
    }

    if (formData.power_kw && parseFloat(formData.power_kw) <= 0) {
      newErrors.power_kw =
        params.errorPositiveNumber || "Η ισχύς πρέπει να είναι θετικός αριθμός";
      hasErrors = true;
    }

    setErrors(newErrors);
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
      ? `http://127.0.0.1:8000/domestic_hot_water_systems/update/${editItem.uuid}/`
      : "http://127.0.0.1:8000/domestic_hot_water_systems/create/";

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
        console.log("Hot water system saved:", response);
        onSubmitSuccess(response);
        resetForm();
        onClose();
      },
      error: (jqXHR) => {
        console.error("Error saving hot water system:", jqXHR);
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
              error={errors.heating_system_type}
            />

            <InputEntryModal
              entry={params.boilerType || "Τύπος Λέβητα"}
              id="boiler_type"
              type="text"
              value={formData.boiler_type}
              onChange={handleChange}
              error={errors.boiler_type}
            />

            <InputEntryModal
              entry={params.powerKW || "Ισχύς (kW)"}
              id="power_kw"
              type="number"
              value={formData.power_kw}
              onChange={handleChange}
              error={errors.power_kw}
              step="0.01"
              min="0"
            />

            <InputEntryModal
              entry={params.thermalEfficiency || "Θερμικός Βαθμός Απόδοσης (%)"}
              id="thermal_efficiency"
              type="number"
              value={formData.thermal_efficiency}
              onChange={handleChange}
              error={errors.thermal_efficiency}
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
              error={errors.distribution_network_state}
            />

            <InputEntryModal
              entry={
                params.storageTankState || "Κατάσταση Δεξαμενής Αποθήκευσης"
              }
              id="storage_tank_state"
              type="text"
              value={formData.storage_tank_state}
              onChange={handleChange}
              error={errors.storage_tank_state}
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
                error={errors.energy_metering_system}
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
