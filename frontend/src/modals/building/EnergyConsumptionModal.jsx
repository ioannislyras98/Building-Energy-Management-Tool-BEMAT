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

function EnergyConsumptionModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
  useModalBlur(open);

  const [formData, setFormData] = useState({
    energy_source: "",
    start_date: "",
    end_date: "",
    quantity: "",
  });

  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  const ENERGY_UNITS = {
    biomass: "kg",
    electricity: "kWh",
    heating_oil: "lt",
    natural_gas: "m³",
  };

  const ENERGY_KWH_CONVERSIONS = {
    biomass: 4.1, // 1 kg = 4.1 kWh
    electricity: 1.0, // 1 kWh = 1 kWh
    heating_oil: 10.0, // 1 lt = 10 kWh
    natural_gas: 10.0, // 1 m³ = 10 kWh
  };

  const getCurrentUnit = () => {
    return ENERGY_UNITS[formData.energy_source] || "";
  };

  const calculateKwhEquivalent = () => {
    if (!formData.quantity || !formData.energy_source) return 0;
    const quantity = parseFloat(formData.quantity);
    const conversionFactor =
      ENERGY_KWH_CONVERSIONS[formData.energy_source] || 0;
    return quantity * conversionFactor;
  };

  useEffect(() => {
    if (editItem) {
      setFormData({
        energy_source: editItem.energy_source || "",
        start_date: editItem.start_date || "",
        end_date: editItem.end_date || "",
        quantity: editItem.quantity ? String(editItem.quantity) : "",
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

    if (!formData.energy_source) {
      newErrors.energy_source = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    if (!formData.start_date) {
      newErrors.start_date = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    if (!formData.end_date) {
      newErrors.end_date = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    if (!formData.quantity) {
      newErrors.quantity = params.errorRequired || "Field is required";
      hasErrors = true;
    } else if (isNaN(formData.quantity)) {
      newErrors.quantity = params.errorNumber || "Must be a number";
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
      energy_source: formData.energy_source,
      start_date: formData.start_date,
      end_date: formData.end_date,
      quantity: parseFloat(formData.quantity),
    };

    if (isEditMode) {
      $.ajax({
        url: `${API_BASE_URL}/energy_consumptions/update/${editItem.id}/`,
        method: "PUT",
        timeout: 0,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(apiData),
        success: (response) => {
          onClose();
          resetForm();
          onSubmitSuccess(response);
        },
        error: (jqXHR) => {
          handleApiError(jqXHR);
        },
      });
    } else {
      $.ajax({
        url: `${API_BASE_URL}/energy_consumptions/create/`,
        method: "POST",
        timeout: 0,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(apiData),
        success: (response) => {
          onClose();
          resetForm();
          onSubmitSuccess(response);
        },
        error: (jqXHR) => {
          handleApiError(jqXHR);
        },
      });
    }
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
          ? params.errorUpdate || "Error updating energy consumption"
          : params.errorGeneral || "Error creating energy consumption",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      energy_source: "",
      start_date: "",
      end_date: "",
      quantity: "",
    });
    setErrors({});
    setShowValidationErrors(false);
  };

  const energySources = [
    { value: "", label: params.selectOption || "Select an option" },
    { value: "electricity", label: params.electricity || "Electricity" },
    { value: "natural_gas", label: params.natural_gas || "Natural Gas" },
    { value: "heating_oil", label: params.heating_oil || "Heating Oil" },
    { value: "biomass", label: params.biomass || "Biomass" },
  ];

  if (!open) {
    return null;
  }
  const modalTitle = isEditMode
    ? params.h2_edit || "Edit Energy Consumption"
    : params.h2 || "Add Energy Consumption";

  const submitButtonText = isEditMode
    ? params.update || "Update"
    : params.submit || "Submit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-96 border-primary-light border-2 bg-white shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{modalTitle}</h2>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="energy_source" className="label-name">
              {params.energySource || "Energy Source"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="energy_source"
              value={formData.energy_source}
              onChange={handleChange}
              className={`input-field ${
                errors.energy_source && showValidationErrors
                  ? "error-input"
                  : ""
              }`}>
              {energySources.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showValidationErrors && errors.energy_source && (
              <div className="text-red-500 text-xs mt-1">
                {errors.energy_source}
              </div>
            )}
          </div>

          <InputEntryModal
            entry={params.startDate || "Start Date"}
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            error={showValidationErrors ? errors.start_date : ""}
            required
          />
          <InputEntryModal
            entry={params.endDate || "End Date"}
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            error={showValidationErrors ? errors.end_date : ""}
            required
          />

          <div className="mb-4">
            <label htmlFor="quantity" className="label-name">
              {params.quantity || "Quantity"}
              {getCurrentUnit() && (
                <span className="text-gray-600 ml-1">({getCurrentUnit()})</span>
              )}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className={`input-field ${
                errors.quantity && showValidationErrors ? "error-input" : ""
              }`}
              placeholder={params.quantity_example || "e.g., 1000"}
              step="0.01"
            />
            {showValidationErrors && errors.quantity && (
              <div className="text-red-500 text-xs mt-1">{errors.quantity}</div>
            )}
            {formData.energy_source && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <div className="text-gray-600">
                  <strong>{params.unitLabel || "Μονάδα μέτρησης"}:</strong>{" "}
                  {getCurrentUnit()}
                </div>
                {formData.quantity && (
                  <div className="text-green-600 font-medium">
                    <strong>{params.equivalentLabel || "Ισοδύναμο"}:</strong>{" "}
                    {calculateKwhEquivalent().toFixed(2)} kWh
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="close-modal">
              {params.cancel || "Cancel"}
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

export default function EnergyConsumptionModal({
  open,
  handleClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
}) {
  const { language } = useLanguage();
  const params =
    language === "en"
      ? english_text.EnergyConsumptionModal || {}
      : greek_text.EnergyConsumptionModal || {};

  console.log("EnergyConsumptionModal: Rendering, open prop is:", open);

  return (
    <EnergyConsumptionModalForm
      open={open}
      onClose={handleClose}
      projectUuid={projectUuid}
      buildingUuid={buildingUuid}
      onSubmitSuccess={onSubmitSuccess}
      editItem={editItem}
      params={params}
    />
  );
}
