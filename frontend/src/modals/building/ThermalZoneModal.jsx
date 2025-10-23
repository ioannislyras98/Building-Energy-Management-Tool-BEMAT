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

function ThermalZoneModalForm({
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
    thermal_zone_usage: "",
    description: "",
    space_condition: "",
    floor: "",
    total_thermal_zone_area: "",
  });

  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";

  useEffect(() => {
    if (editItem) {
      setFormData({
        thermal_zone_usage: editItem.thermal_zone_usage || "",
        description: editItem.description || "",
        space_condition: editItem.space_condition || "",
        floor: editItem.floor || "",
        total_thermal_zone_area: editItem.total_thermal_zone_area || "",
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

    if (!formData.thermal_zone_usage.trim()) {
      newErrors.thermal_zone_usage =
        params.errorRequired || "This field is required";
      hasErrors = true;
    }

    // Required field: Total thermal zone area
    if (
      !formData.total_thermal_zone_area ||
      formData.total_thermal_zone_area === ""
    ) {
      newErrors.total_thermal_zone_area =
        params.errorRequired || "Field is required";
      hasErrors = true;
    } else if (
      isNaN(formData.total_thermal_zone_area) ||
      parseFloat(formData.total_thermal_zone_area) <= 0
    ) {
      newErrors.total_thermal_zone_area =
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
      thermal_zone_usage: formData.thermal_zone_usage,
      description: formData.description,
      space_condition: formData.space_condition,
      floor: formData.floor,
      total_thermal_zone_area: formData.total_thermal_zone_area
        ? parseFloat(formData.total_thermal_zone_area)
        : null,
    };

    const url = isEditMode
      ? `${API_BASE_URL}/thermal_zones/update/${editItem.uuid}/`
      : `${API_BASE_URL}/thermal_zones/create/`;

    const method = isEditMode ? "PUT" : "POST";

    $.ajax({
      url: url,
      method: method,
      timeout: 0,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(apiData),
      success: (response) => {
        console.log(
          isEditMode ? "Updated thermal zone:" : "Created thermal zone:",
          response
        );
        onClose();
        resetForm();
        onSubmitSuccess(response);
      },
      error: (jqXHR) => {
        console.error("Error with thermal zone:", jqXHR);
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
          ? params.errorUpdate || "Error updating thermal zone"
          : params.errorGeneral || "Error creating thermal zone",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      thermal_zone_usage: "",
      description: "",
      space_condition: "",
      floor: "",
      total_thermal_zone_area: "",
    });
    setErrors({});
    setShowValidationErrors(false);
  };

  if (!open) return null;

  const modalTitle = isEditMode
    ? params.h2_edit || "Edit Thermal Zone"
    : params.h2 || "Add Thermal Zone";

  const submitButtonText = isEditMode
    ? params.update || "Update"
    : params.save || "Save";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-2xl border-primary-light border-2 bg-white shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">{modalTitle}</h2>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <InputEntryModal
              entry={params.thermalZoneUsage || "Χρήση θερμικής ζώνης"}
              id="thermal_zone_usage"
              type="text"
              value={formData.thermal_zone_usage}
              onChange={handleChange}
              error={showValidationErrors ? errors.thermal_zone_usage : ""}
              required
            />

            <InputEntryModal
              entry={params.spaceCondition || "Κατάσταση χώρου"}
              id="space_condition"
              type="text"
              value={formData.space_condition}
              onChange={handleChange}
              error={showValidationErrors ? errors.space_condition : ""}
            />

            <InputEntryModal
              entry={params.floor || "Όροφος"}
              id="floor"
              type="text"
              value={formData.floor}
              onChange={handleChange}
              error={showValidationErrors ? errors.floor : ""}
            />

            <InputEntryModal
              entry={
                params.totalThermalZoneArea ||
                "Συνολική επιφάνεια θερμικής ζώνης (m²)"
              }
              id="total_thermal_zone_area"
              type="number"
              value={formData.total_thermal_zone_area}
              onChange={handleChange}
              error={showValidationErrors ? errors.total_thermal_zone_area : ""}
              step="0.01"
              min="0"
              required
            />

            <div className="md:col-span-2">
              <InputEntryModal
                entry={params.description || "Περιγραφή"}
                id="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                error={showValidationErrors ? errors.description : ""}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="close-modal">
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

export default function ThermalZoneModal({
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
      ? english_text.ThermalZoneModal || {}
      : greek_text.ThermalZoneModal || {};

  return (
    <ThermalZoneModalForm
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
