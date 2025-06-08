import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";
import "./../../assets/styles/forms.css";

const cookies = new Cookies();

function SolarCollectorsModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
  const [formData, setFormData] = useState({
    solar_collector_usage: "",
    solar_collector_type: "",
    collector_surface_area: "",
    hot_water_storage_capacity: "",
    heating_storage_capacity: "",
    distribution_network_state: "",
    terminal_units_position: "",
    collector_accessibility: "",
    storage_tank_condition: "",
  });

  const [errors, setErrors] = useState({});
  const token = cookies.get("token") || "";

  useEffect(() => {
    if (editItem) {
      setFormData({
        solar_collector_usage: editItem.solar_collector_usage || "",
        solar_collector_type: editItem.solar_collector_type || "",
        collector_surface_area: editItem.collector_surface_area || "",
        hot_water_storage_capacity: editItem.hot_water_storage_capacity || "",
        heating_storage_capacity: editItem.heating_storage_capacity || "",
        distribution_network_state: editItem.distribution_network_state || "",
        terminal_units_position: editItem.terminal_units_position || "",
        collector_accessibility: editItem.collector_accessibility || "",
        storage_tank_condition: editItem.storage_tank_condition || "",
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
      formData.collector_surface_area &&
      parseFloat(formData.collector_surface_area) <= 0
    ) {
      newErrors.collector_surface_area =
        params.errorPositiveNumber ||
        "Η επιφάνεια συλλεκτών πρέπει να είναι θετικός αριθμός";
      hasErrors = true;
    }

    if (
      formData.hot_water_storage_capacity &&
      parseFloat(formData.hot_water_storage_capacity) <= 0
    ) {
      newErrors.hot_water_storage_capacity =
        params.errorPositiveNumber ||
        "Η χωρητικότητα δοχείου Ζ.Ν.Χ. πρέπει να είναι θετικός αριθμός";
      hasErrors = true;
    }

    if (
      formData.heating_storage_capacity &&
      parseFloat(formData.heating_storage_capacity) <= 0
    ) {
      newErrors.heating_storage_capacity =
        params.errorPositiveNumber ||
        "Η χωρητικότητα δοχείου θέρμανσης πρέπει να είναι θετικός αριθμός";
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
      solar_collector_usage: formData.solar_collector_usage,
      solar_collector_type: formData.solar_collector_type,
      collector_surface_area: formData.collector_surface_area
        ? parseFloat(formData.collector_surface_area)
        : null,
      hot_water_storage_capacity: formData.hot_water_storage_capacity
        ? parseFloat(formData.hot_water_storage_capacity)
        : null,
      heating_storage_capacity: formData.heating_storage_capacity
        ? parseFloat(formData.heating_storage_capacity)
        : null,
      distribution_network_state: formData.distribution_network_state,
      terminal_units_position: formData.terminal_units_position,
      collector_accessibility: formData.collector_accessibility,
      storage_tank_condition: formData.storage_tank_condition,
    };

    const url = isEditMode
      ? `http://127.0.0.1:8000/solar_collectors/update/${editItem.uuid}/`
      : "http://127.0.0.1:8000/solar_collectors/create/";

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
        console.log("Solar collectors saved:", response);
        onSubmitSuccess(response);
        resetForm();
        onClose();
      },
      error: (jqXHR) => {
        console.error("Error saving solar collectors:", jqXHR);
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
            "Σφάλμα κατά την ενημέρωση των ηλιακών συλλεκτών"
          : params.errorGeneral ||
            "Σφάλμα κατά τη δημιουργία των ηλιακών συλλεκτών",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      solar_collector_usage: "",
      solar_collector_type: "",
      collector_surface_area: "",
      hot_water_storage_capacity: "",
      heating_storage_capacity: "",
      distribution_network_state: "",
      terminal_units_position: "",
      collector_accessibility: "",
      storage_tank_condition: "",
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
            ? params.editTitleSolar || "Επεξεργασία Ηλιακών Συλλεκτών"
            : params.addTitleSolar || "Προσθήκη Ηλιακών Συλλεκτών"}
        </h2>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputEntryModal
              entry={params.solarCollectorUsage || "Χρήση Ηλιακών Συλλεκτών"}
              id="solar_collector_usage"
              type="text"
              value={formData.solar_collector_usage}
              onChange={handleChange}
              error={errors.solar_collector_usage}
            />

            <InputEntryModal
              entry={params.solarCollectorType || "Τύπος Ηλιακού Συλλέκτη"}
              id="solar_collector_type"
              type="text"
              value={formData.solar_collector_type}
              onChange={handleChange}
              error={errors.solar_collector_type}
            />

            <InputEntryModal
              entry={
                params.collectorSurfaceArea ||
                "Επιφάνεια Ηλιακών Συλλεκτών (m²)"
              }
              id="collector_surface_area"
              type="number"
              value={formData.collector_surface_area}
              onChange={handleChange}
              error={errors.collector_surface_area}
              step="0.01"
              min="0"
            />

            <InputEntryModal
              entry={
                params.hotWaterStorageCapacity ||
                "Χωρητικότητα Δοχείου για Ζ.Ν.Χ. (L)"
              }
              id="hot_water_storage_capacity"
              type="number"
              value={formData.hot_water_storage_capacity}
              onChange={handleChange}
              error={errors.hot_water_storage_capacity}
              step="0.01"
              min="0"
            />

            <InputEntryModal
              entry={
                params.heatingStorageCapacity ||
                "Χωρητικότητα Δοχείου για Θέρμανση (L)"
              }
              id="heating_storage_capacity"
              type="number"
              value={formData.heating_storage_capacity}
              onChange={handleChange}
              error={errors.heating_storage_capacity}
              step="0.01"
              min="0"
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
              entry={params.terminalUnitsPosition || "Θέση Τερματικών Μονάδων"}
              id="terminal_units_position"
              type="text"
              value={formData.terminal_units_position}
              onChange={handleChange}
              error={errors.terminal_units_position}
            />

            <InputEntryModal
              entry={
                params.collectorAccessibility ||
                "Δυνατότητα Πρόσβασης στους Συλλέκτες"
              }
              id="collector_accessibility"
              type="text"
              value={formData.collector_accessibility}
              onChange={handleChange}
              error={errors.collector_accessibility}
            />

            <div className="md:col-span-2">
              <InputEntryModal
                entry={
                  params.storageTankCondition || "Κατάσταση Δοχείου Αποθήκευσης"
                }
                id="storage_tank_condition"
                type="text"
                value={formData.storage_tank_condition}
                onChange={handleChange}
                error={errors.storage_tank_condition}
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

function SolarCollectorsModal(props) {
  const { language } = useLanguage();

  let translations;
  if (language === "en") {
    translations = english_text.BuildingProfile?.tabs?.systemsContent || {};
  } else {
    translations = greek_text.BuildingProfile?.tabs?.systemsContent || {};
  }

  return <SolarCollectorsModalForm {...props} params={translations} />;
}

export default SolarCollectorsModal;
