import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import API_BASE_URL from "../../config/api.js";

const cookies = new Cookies();

const PhotovoltaicSystemForm = ({
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    // Φωτοβολταϊκά πλαίσια
    pv_panels_quantity: "",
    pv_panels_unit_price: "",

    // Μεταλλικές βάσεις στήριξης
    metal_bases_quantity: "",
    metal_bases_unit_price: "",

    // Σωληνώσεις
    piping_quantity: "",
    piping_unit_price: "",

    // Καλωδιώσεις
    wiring_quantity: "",
    wiring_unit_price: "",

    // Μετατροπέας ισχύος
    inverter_quantity: "",
    inverter_unit_price: "",

    // Εγκατάσταση
    installation_quantity: "",
    installation_unit_price: "",

    // Ενεργειακοί δείκτες
    power_per_panel: "",
    collector_efficiency: "",
    installation_angle: "",
    pv_usage: "electricity",
    pv_system_type: "grid_connected",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = cookies.get("token") || "";

  const { language } = useLanguage();
  const texts = language === "en" ? english_text : greek_text;

  useEffect(() => {
    if (editItem) {
      setFormData({
        pv_panels_quantity: editItem.pv_panels_quantity || "",
        pv_panels_unit_price: editItem.pv_panels_unit_price || "",
        metal_bases_quantity: editItem.metal_bases_quantity || "",
        metal_bases_unit_price: editItem.metal_bases_unit_price || "",
        piping_quantity: editItem.piping_quantity || "",
        piping_unit_price: editItem.piping_unit_price || "",
        wiring_quantity: editItem.wiring_quantity || "",
        wiring_unit_price: editItem.wiring_unit_price || "",
        inverter_quantity: editItem.inverter_quantity || "",
        inverter_unit_price: editItem.inverter_unit_price || "",
        installation_quantity: editItem.installation_quantity || "",
        installation_unit_price: editItem.installation_unit_price || "",
        power_per_panel: editItem.power_per_panel || "",
        collector_efficiency: editItem.collector_efficiency || "",
        installation_angle: editItem.installation_angle || "",
        pv_usage: editItem.pv_usage || "electricity",
        pv_system_type: editItem.pv_system_type || "grid_connected",
      });
    }
  }, [editItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      "pv_panels_quantity",
      "pv_panels_unit_price",
      "power_per_panel",
      "metal_bases_quantity",
      "metal_bases_unit_price",
      "piping_quantity",
      "piping_unit_price",
      "wiring_quantity",
      "wiring_unit_price",
      "inverter_quantity",
      "inverter_unit_price",
      "installation_quantity",
      "installation_unit_price",
      "collector_efficiency",
      "installation_angle",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = "Αυτό το πεδίο είναι υποχρεωτικό";
      }
    });

    // Numeric validations
    const numericFields = [
      "pv_panels_quantity",
      "pv_panels_unit_price",
      "power_per_panel",
      "metal_bases_quantity",
      "metal_bases_unit_price",
      "piping_quantity",
      "piping_unit_price",
      "wiring_quantity",
      "wiring_unit_price",
      "inverter_quantity",
      "inverter_unit_price",
      "installation_quantity",
      "installation_unit_price",
      "collector_efficiency",
      "installation_angle",
    ];

    numericFields.forEach((field) => {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        newErrors[field] = "Πρέπει να είναι αριθμός";
      }
      if (formData[field] && parseFloat(formData[field]) < 0) {
        newErrors[field] = "Δεν μπορεί να είναι αρνητικός";
      }
    });

    // Specific validations
    if (
      formData.collector_efficiency &&
      (parseFloat(formData.collector_efficiency) < 0 ||
        parseFloat(formData.collector_efficiency) > 100)
    ) {
      newErrors.collector_efficiency =
        "Η απόδοση πρέπει να είναι μεταξύ 0 και 100%";
    }

    if (
      formData.installation_angle &&
      (parseFloat(formData.installation_angle) < 0 ||
        parseFloat(formData.installation_angle) > 90)
    ) {
      newErrors.installation_angle =
        "Η γωνία εγκατάστασης πρέπει να είναι μεταξύ 0 και 90 μοιρών";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        building: buildingUuid,
        project: projectUuid,
      };

      const url = editItem
        ? `${API_BASE_URL}/photovoltaic_systems/${editItem.uuid}/`
        : `${API_BASE_URL}/photovoltaic_systems/`;

      const method = editItem ? "PUT" : "POST";

      await $.ajax({
        url,
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(submitData),
        success: (response) => {
          console.log("Photovoltaic system saved successfully:", response);
          onSubmitSuccess(response);
          if (!editItem && onCancel) {
            onCancel();
          }
        },
        error: (xhr, status, error) => {
          console.error("Error saving photovoltaic system:", error);
          const responseText = xhr.responseText;
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.errors) {
              setErrors(errorData.errors);
            } else {
              setErrors({
                general: errorData.message || "Σφάλμα κατά την αποθήκευση",
              });
            }
          } catch {
            setErrors({ general: "Σφάλμα κατά την αποθήκευση" });
          }
        },
      });
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "Σφάλμα κατά την αποθήκευση" });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    unit = "",
    required = false,
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {unit && <span className="text-gray-500 ml-1">({unit})</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
        disabled={loading}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const SelectField = ({ label, name, options, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
        disabled={loading}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">
          {editItem
            ? "Επεξεργασία Φωτοβολταϊκού Συστήματος"
            : "Νέο Φωτοβολταϊκό Σύστημα"}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Βασικές Πληροφορίες */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Βασικές Πληροφορίες Συστήματος
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Τύπος Συστήματος"
              name="pv_system_type"
              required
              options={[
                { value: "grid_connected", label: "Διασυνδεδεμένο" },
                { value: "autonomous", label: "Αυτόνομο" },
                { value: "hybrid", label: "Υβριδικό" },
              ]}
            />
            <SelectField
              label="Χρήση"
              name="pv_usage"
              required
              options={[
                { value: "electricity", label: "Παραγωγή Ηλεκτρισμού" },
                { value: "heating", label: "Θέρμανση" },
                { value: "both", label: "Και τα δύο" },
              ]}
            />
          </div>
        </div>

        {/* Φωτοβολταϊκά Πλαίσια */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Φωτοβολταϊκά Πλαίσια
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Αριθμός Πλαισίων"
              name="pv_panels_quantity"
              type="number"
              unit="τεμάχια"
              required
            />
            <InputField
              label="Τιμή ανά Πλαίσιο"
              name="pv_panels_unit_price"
              type="number"
              unit="€"
              required
            />
            <InputField
              label="Ισχύς ανά Πλαίσιο"
              name="power_per_panel"
              type="number"
              unit="W"
              required
            />
          </div>
        </div>

        {/* Μεταλλικές Βάσεις Στήριξης */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Μεταλλικές Βάσεις Στήριξης
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Ποσότητα"
              name="metal_bases_quantity"
              type="number"
              unit="τεμάχια"
              required
            />
            <InputField
              label="Τιμή Μονάδας"
              name="metal_bases_unit_price"
              type="number"
              unit="€"
              required
            />
          </div>
        </div>

        {/* Σωληνώσεις */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Σωληνώσεις
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Ποσότητα"
              name="piping_quantity"
              type="number"
              unit="μέτρα"
              required
            />
            <InputField
              label="Τιμή ανά Μέτρο"
              name="piping_unit_price"
              type="number"
              unit="€/μ"
              required
            />
          </div>
        </div>

        {/* Καλωδιώσεις */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Καλωδιώσεις
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Ποσότητα"
              name="wiring_quantity"
              type="number"
              unit="μέτρα"
              required
            />
            <InputField
              label="Τιμή ανά Μέτρο"
              name="wiring_unit_price"
              type="number"
              unit="€/μ"
              required
            />
          </div>
        </div>

        {/* Μετατροπέας Ισχύος */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Μετατροπέας Ισχύος
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Αριθμός Μετατροπέων"
              name="inverter_quantity"
              type="number"
              unit="τεμάχια"
              required
            />
            <InputField
              label="Τιμή ανά Μετατροπέα"
              name="inverter_unit_price"
              type="number"
              unit="€"
              required
            />
          </div>
        </div>

        {/* Εγκατάσταση */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Εγκατάσταση
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Ποσότητα Εργασίας"
              name="installation_quantity"
              type="number"
              unit="ώρες"
              required
            />
            <InputField
              label="Κόστος ανά Ώρα"
              name="installation_unit_price"
              type="number"
              unit="€/ώρα"
              required
            />
          </div>
        </div>

        {/* Τεχνικές Παράμετροι */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Τεχνικές Παράμετροι
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Απόδοση Συλλέκτη"
              name="collector_efficiency"
              type="number"
              unit="%"
              required
            />
            <InputField
              label="Γωνία Εγκατάστασης"
              name="installation_angle"
              type="number"
              unit="μοίρες"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Ακύρωση
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {editItem ? "Ενημέρωση" : "Αποθήκευση"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotovoltaicSystemForm;
