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

function ElectricalConsumptionModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
  // Apply blur effect when modal is open
  useModalBlur(open);

  const [formData, setFormData] = useState({
    consumption_type: "",
    thermal_zone: "",
    period: "",
    energy_consumption: "",
    load_type: "",
    load_power: "",
    quantity: "",
    operating_hours_per_year: "",
  });

  const [thermalZones, setThermalZones] = useState([]);
  const [energyConsumptions, setEnergyConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { language } = useLanguage();
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");
  const isEditMode = !!editItem;

  // Return null if modal is not open (like EnergyConsumptionModal)
  if (!open) {
    return null;
  }

  // Consumption type choices
  const consumptionTypes = [
    { value: "", label: params.selectOption || "Select an option" },
    { value: "lighting", label: params.lighting || "Φωτισμός" },
    {
      value: "air_conditioning",
      label: params.air_conditioning || "Κλιματισμός",
    },
    {
      value: "other_electrical_devices",
      label: params.other_electrical_devices || "Άλλες ηλεκτρικές συσκευές",
    },
  ];

  // Dynamic load type choices based on consumption type
  const getLoadTypeOptions = (consumptionType) => {
    switch (consumptionType) {
      case "lighting":
        return [
          { value: "led", label: params.led || "LED" },
          {
            value: "fluorescent",
            label: params.fluorescent || "Φθορισμού",
          },
          {
            value: "incandescent",
            label: params.incandescent || "Πυρακτώσεως",
          },
          {
            value: "energy_saving",
            label: params.energy_saving || "Λαμπτήρας Οικονομίας",
          },
          { value: "halogen", label: params.halogen || "Αλογόνου" },
        ];
      case "air_conditioning":
        return [
          {
            value: "split_unit",
            label: params.split_unit || "Split Unit",
          },
          {
            value: "central_ac",
            label: params.central_ac || "Κεντρικό Κλιματισμό",
          },
          {
            value: "heat_pump",
            label: params.heat_pump || "Αντλία Θερμότητας",
          },
          {
            value: "window_unit",
            label: params.window_unit || "Μονάδα Παραθύρου",
          },
          {
            value: "portable_ac",
            label: params.portable_ac || "Φορητό Κλιματιστικό",
          },
          {
            value: "evaporative_cooler",
            label: params.evaporative_cooler || "Εξατμιστικό Ψύκτη",
          },
        ];
      case "other_electrical_devices":
        return [
          {
            value: "refrigerator",
            label: params.refrigerator || "Ψυγείο",
          },
          {
            value: "washing_machine",
            label: params.washing_machine || "Πλυντήριο",
          },
          {
            value: "dishwasher",
            label: params.dishwasher || "Πλυντήριο Πιάτων",
          },
          { value: "oven", label: params.oven || "Φούρνος" },
          {
            value: "microwave",
            label: params.microwave || "Φούρνος Μικροκυμάτων",
          },
          {
            value: "water_heater",
            label: params.water_heater || "Θερμοσίφωνας",
          },
          { value: "computer", label: params.computer || "Υπολογιστής" },
          {
            value: "television",
            label: params.television || "Τηλεόραση",
          },
          { value: "dryer", label: params.dryer || "Στεγνωτήριο" },
          { value: "iron", label: params.iron || "Σίδερο" },
          {
            value: "vacuum_cleaner",
            label: params.vacuum_cleaner || "Ηλεκτρική Σκούπα",
          },
          { value: "other", label: params.other || "Άλλο" },
        ];
      default:
        return [];
    }
  };

  const loadTypes = getLoadTypeOptions(formData.consumption_type);

  const resetForm = () => {
    setFormData({
      consumption_type: "",
      thermal_zone: "",
      period: "",
      energy_consumption: "",
      load_type: "",
      load_power: "",
      quantity: "",
      operating_hours_per_year: "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (open) {
      fetchThermalZones();
      fetchEnergyConsumptions();

      if (editItem) {
        setFormData({
          consumption_type: editItem.consumption_type || "",
          thermal_zone: editItem.thermal_zone || "",
          period: editItem.period || "",
          energy_consumption: editItem.energy_consumption || "",
          load_type: editItem.load_type || "",
          load_power: editItem.load_power || "",
          quantity: editItem.quantity || "",
          operating_hours_per_year: editItem.operating_hours_per_year || "",
        });
      } else {
        resetForm();
      }
    }
  }, [open, editItem]);

  const fetchThermalZones = () => {
    if (!buildingUuid || !token) return;

    $.ajax({
      url: `http://127.0.0.1:8000/thermal_zones/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        const zones = Array.isArray(response.data) ? response.data : [];
        setThermalZones(zones);
      },
      error: (jqXHR) => {
        console.error("Error fetching thermal zones:", jqXHR);
      },
    });
  };

  const fetchEnergyConsumptions = () => {
    if (!buildingUuid || !token) return;

    $.ajax({
      url: `http://127.0.0.1:8000/energy_consumptions/get_by_building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (response) => {
        const consumptions = Array.isArray(response) ? response : [];
        setEnergyConsumptions(consumptions);
      },
      error: (jqXHR) => {
        console.error("Error fetching energy consumptions:", jqXHR);
      },
    });
  };

  const handleChange = (event) => {
    const { id, name, value } = event.target;
    const fieldName = id || name;

    // Reset load_type when consumption_type changes
    if (
      fieldName === "consumption_type" &&
      value !== formData.consumption_type
    ) {
      setFormData({ ...formData, [fieldName]: value, load_type: "" });
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!formData.consumption_type) {
      newErrors.consumption_type =
        params.errorRequired || "This field is required";
      hasErrors = true;
    }
    if (!formData.thermal_zone) {
      newErrors.thermal_zone = params.errorRequired || "This field is required";
      hasErrors = true;
    }
    if (!formData.load_power) {
      newErrors.load_power = params.errorRequired || "This field is required";
      hasErrors = true;
    }
    if (!formData.quantity) {
      newErrors.quantity = params.errorRequired || "This field is required";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const submitData = {
      ...formData,
      building: buildingUuid,
      project: projectUuid,
    };

    const url = editItem
      ? `http://127.0.0.1:8000/electrical_consumptions/update/${editItem.uuid}/`
      : `http://127.0.0.1:8000/electrical_consumptions/create/`;

    const method = editItem ? "PUT" : "POST";

    $.ajax({
      url: url,
      method: method,
      data: JSON.stringify(submitData),
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      success: (response) => {
        console.log("Electrical consumption saved:", response);
        setLoading(false);
        resetForm();
        onClose();
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      },
      error: (jqXHR) => {
        console.error("Error saving electrical consumption:", jqXHR);
        setErrors({
          general:
            jqXHR.responseJSON?.detail ||
            params.submitError ||
            "Error saving electrical consumption",
        });
        setLoading(false);
      },
    });
  };

  const modalTitle = isEditMode
    ? params.editTitle || "Επεξεργασία Ηλεκτρικής Κατανάλωσης"
    : params.createTitle || "Νέα Ηλεκτρική Κατανάλωση";

  const submitButtonText = isEditMode
    ? params.update || "Ενημέρωση"
    : params.create || "Δημιουργία";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-4xl border-primary-light border-2 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{modalTitle}</h2>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consumption Type */}
            <div className="mb-4">
              <label htmlFor="consumption_type" className="label-name">
                {params.consumptionType || "Τύπος κατανάλωσης"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="consumption_type"
                value={formData.consumption_type}
                onChange={handleChange}
                className={`input-field ${
                  errors.consumption_type ? "error-input" : ""
                }`}
                required>
                {consumptionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.consumption_type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.consumption_type}
                </div>
              )}
            </div>

            {/* Thermal Zone */}
            <div className="mb-4">
              <label htmlFor="thermal_zone" className="label-name">
                {params.thermalZone || "Θερμική ζώνη"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="thermal_zone"
                value={formData.thermal_zone}
                onChange={handleChange}
                className={`input-field ${
                  errors.thermal_zone ? "error-input" : ""
                }`}
                required>
                <option value="">
                  {params.selectOption || "Select an option"}
                </option>
                {thermalZones.map((zone) => (
                  <option key={zone.uuid} value={zone.uuid}>
                    {zone.thermal_zone_usage ||
                      `Zone ${zone.uuid.substring(0, 8)}`}
                  </option>
                ))}
              </select>
              {errors.thermal_zone && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.thermal_zone}
                </div>
              )}
            </div>

            {/* Period */}
            <div className="mb-4">
              <InputEntryModal
                entry={params.period || "Περίοδος"}
                id="period"
                type="text"
                value={formData.period}
                onChange={handleChange}
                error={errors.period}
              />
            </div>

            {/* Energy Consumption */}
            <div className="mb-4">
              <label htmlFor="energy_consumption" className="label-name">
                {params.energyConsumption || "Τύπος κατανάλωσης (Energy)"}
              </label>
              <select
                id="energy_consumption"
                value={formData.energy_consumption}
                onChange={handleChange}
                className={`input-field ${
                  errors.energy_consumption ? "error-input" : ""
                }`}>
                <option value="">{params.none || "Κανένα"}</option>
                {energyConsumptions.map((consumption) => {
                  const energySourceDisplay =
                    language === "en"
                      ? {
                          electricity: "Electricity",
                          natural_gas: "Natural Gas",
                          heating_oil: "Heating Oil",
                          biomass: "Biomass",
                        }[consumption.energy_source] ||
                        consumption.energy_source
                      : {
                          electricity: "Ηλεκτρική Ενέργεια",
                          natural_gas: "Φυσικό Αέριο",
                          heating_oil: "Πετρέλαιο Θέρμανσης",
                          biomass: "Βιομάζα",
                        }[consumption.energy_source] ||
                        consumption.energy_source;

                  const fromText = language === "en" ? "From" : "Από";
                  const toText = language === "en" ? "to" : "έως";

                  return (
                    <option key={consumption.uuid} value={consumption.uuid}>
                      {fromText} {consumption.start_date} {toText}{" "}
                      {consumption.end_date} ({energySourceDisplay})
                    </option>
                  );
                })}
              </select>
              {errors.energy_consumption && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.energy_consumption}
                </div>
              )}
            </div>

            {/* Load Type */}
            <div className="mb-4">
              <label htmlFor="load_type" className="label-name">
                {params.loadType || "Τύπος φορτίου"}
              </label>
              <select
                id="load_type"
                value={formData.load_type}
                onChange={handleChange}
                className={`input-field ${
                  errors.load_type ? "error-input" : ""
                }`}>
                <option value="">
                  {params.selectOption || "Select an option"}
                </option>
                {loadTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.load_type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.load_type}
                </div>
              )}
            </div>

            {/* Load Power */}
            <div className="mb-4">
              <InputEntryModal
                entry={params.loadPower || "Ισχύς φορτίου (kW)"}
                id="load_power"
                type="number"
                value={formData.load_power}
                onChange={handleChange}
                error={errors.load_power}
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <InputEntryModal
                entry={params.quantity || "Πλήθος"}
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
                min="1"
                required
              />
            </div>

            {/* Operating Hours per Year */}
            <div className="mb-4">
              <InputEntryModal
                entry={params.operatingHours || "Ώρες λειτουργίας ανά έτος"}
                id="operating_hours_per_year"
                type="number"
                value={formData.operating_hours_per_year}
                onChange={handleChange}
                error={errors.operating_hours_per_year}
                step="0.01"
                min="0"
                max="8760"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="close-modal">
              {params.cancel || "Ακύρωση"}
            </button>
            <button type="submit" className="confirm-button" disabled={loading}>
              {loading ? params.saving || "Αποθήκευση..." : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ElectricalConsumptionModal({
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
      ? english_text.ElectricalConsumptionModal || {}
      : greek_text.ElectricalConsumptionModal || {};

  return (
    <ElectricalConsumptionModalForm
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
