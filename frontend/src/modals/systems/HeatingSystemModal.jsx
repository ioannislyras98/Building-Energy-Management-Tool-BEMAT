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

function HeatingSystemModalForm({
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
    exchanger_type: "",
    central_boiler_system: "",
    central_heat_pump_system: "",
    local_heating_system: "",
    power_kw: "",
    construction_year: "",
    cop: "",
    distribution_network_state: "",
  });
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  useModalBlur(open);

  useEffect(() => {
    if (editItem) {
      setFormData({
        heating_system_type: editItem.heating_system_type || "",
        exchanger_type: editItem.exchanger_type || "",
        central_boiler_system: editItem.central_boiler_system || "",
        central_heat_pump_system: editItem.central_heat_pump_system || "",
        local_heating_system: editItem.local_heating_system || "",
        power_kw: editItem.power_kw || "",
        construction_year: editItem.construction_year || "",
        cop: editItem.cop || "",
        distribution_network_state: editItem.distribution_network_state || "",
      });
    } else {
      setFormData({
        heating_system_type: "",
        exchanger_type: "",
        central_boiler_system: "",
        central_heat_pump_system: "",
        local_heating_system: "",
        power_kw: "",
        construction_year: "",
        cop: "",
        distribution_network_state: "",
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
    if (!formData.heating_system_type) {
      newErrors.heating_system_type =
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
    if (
      formData.cop &&
      formData.cop !== "" &&
      (isNaN(formData.cop) || parseFloat(formData.cop) <= 0)
    ) {
      newErrors.cop = params.errorPositiveNumber || "Must be a positive number";
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
      exchanger_type: formData.exchanger_type,
      central_boiler_system: formData.central_boiler_system,
      central_heat_pump_system: formData.central_heat_pump_system,
      local_heating_system: formData.local_heating_system,
      power_kw: formData.power_kw ? parseFloat(formData.power_kw) : null,
      construction_year: formData.construction_year
        ? parseInt(formData.construction_year)
        : null,
      cop: formData.cop ? parseFloat(formData.cop) : null,
      distribution_network_state: formData.distribution_network_state,
    };

    const url = isEditMode
      ? `${API_BASE_URL}/heating_systems/update/${editItem.uuid}/`
      : `${API_BASE_URL}/heating_systems/create/`;

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
            "Σφάλμα κατά την ενημέρωση του συστήματος θέρμανσης"
          : params.errorGeneral ||
            "Σφάλμα κατά τη δημιουργία του συστήματος θέρμανσης",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      heating_system_type: "",
      exchanger_type: "",
      central_boiler_system: "",
      central_heat_pump_system: "",
      local_heating_system: "",
      power_kw: "",
      construction_year: "",
      cop: "",
      distribution_network_state: "",
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
        {" "}
        <h2 className="text-lg font-bold mb-4 text-center">
          {isEditMode
            ? params.editTitle || "Επεξεργασία Συστήματος Θέρμανσης"
            : params.addTitle || "Προσθήκη Συστήματος Θέρμανσης"}
        </h2>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
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
              entry={params.exchangerType || "Τύπος Εναλλάκτη"}
              id="exchanger_type"
              type="text"
              value={formData.exchanger_type}
              onChange={handleChange}
              error={showValidationErrors ? errors.exchanger_type : ""}
            />
            <InputEntryModal
              entry={params.centralBoilerSystem || "Κεντρικό Σύστημα Λέβητα"}
              id="central_boiler_system"
              type="text"
              value={formData.central_boiler_system}
              onChange={handleChange}
              error={showValidationErrors ? errors.central_boiler_system : ""}
            />
            <InputEntryModal
              entry={
                params.centralHeatPumpSystem ||
                "Κεντρικό Σύστημα με Αντλία Θερμότητας"
              }
              id="central_heat_pump_system"
              type="text"
              value={formData.central_heat_pump_system}
              onChange={handleChange}
              error={
                showValidationErrors ? errors.central_heat_pump_system : ""
              }
            />
            <InputEntryModal
              entry={params.localHeatingSystem || "Τοπικό Σύστημα Θέρμανσης"}
              id="local_heating_system"
              type="text"
              value={formData.local_heating_system}
              onChange={handleChange}
              error={showValidationErrors ? errors.local_heating_system : ""}
            />
            <InputEntryModal
              entry={params.powerKW || "Ισχύς (W)"}
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
                params.copCoefficient ||
                "Συντελεστής Ενεργειακής Επίδοσης (COP)"
              }
              id="cop"
              type="number"
              value={formData.cop}
              onChange={handleChange}
              error={showValidationErrors ? errors.cop : ""}
              step="0.01"
              min="0"
            />
            <div className="md:col-span-2">
              <InputEntryModal
                entry={
                  params.distributionNetworkState ||
                  "Κατάσταση Δικτύου Διανομής (περνά από μη θερμαινόμενους χώρους)"
                }
                id="distribution_network_state"
                type="text"
                value={formData.distribution_network_state}
                onChange={handleChange}
                error={
                  showValidationErrors ? errors.distribution_network_state : ""
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

function HeatingSystemModal(props) {
  const { language } = useLanguage();

  let translations;
  if (language === "en") {
    translations = english_text.BuildingProfile?.tabs?.systemsContent || {};
  } else {
    translations = greek_text.BuildingProfile?.tabs?.systemsContent || {};
  }

  return <HeatingSystemModalForm {...props} params={translations} />;
}

export default HeatingSystemModal;
