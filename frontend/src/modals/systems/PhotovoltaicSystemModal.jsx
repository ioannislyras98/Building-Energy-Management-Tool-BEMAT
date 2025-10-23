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

function PhotovoltaicSystemModalForm({
  open,
  onClose,
  projectUuid,
  buildingUuid,
  onSubmitSuccess,
  editItem,
  params,
}) {
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
    pv_usage: "",
    pv_system_type: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const token = cookies.get("token") || "";

  useModalBlur(open);

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
        pv_usage: editItem.pv_usage || "",
        pv_system_type: editItem.pv_system_type || "",
      });
    } else {
      // Εισαγωγή προεπιλεγμένων τιμών
      setFormData({
        pv_panels_quantity: "",
        pv_panels_unit_price: "",
        metal_bases_quantity: "",
        metal_bases_unit_price: "",
        piping_quantity: "",
        piping_unit_price: "",
        wiring_quantity: "",
        wiring_unit_price: "",
        inverter_quantity: "",
        inverter_unit_price: "",
        installation_quantity: "",
        installation_unit_price: "",
        power_per_panel: "",
        collector_efficiency: "",
        installation_angle: "",
        pv_usage: "Για ίδια κατανάλωση",
        pv_system_type: "Μονοκρυσταλλικό",
      });
    }
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

    const positiveFields = [
      "pv_panels_quantity",
      "pv_panels_unit_price",
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
      "power_per_panel",
    ];

    positiveFields.forEach((field) => {
      if (formData[field] && parseFloat(formData[field]) <= 0) {
        newErrors[field] = "Η τιμή πρέπει να είναι θετικός αριθμός";
        hasErrors = true;
      }
    });

    if (
      formData.collector_efficiency &&
      (parseFloat(formData.collector_efficiency) < 0 ||
        parseFloat(formData.collector_efficiency) > 100)
    ) {
      newErrors.collector_efficiency =
        "Ο βαθμός απόδοσης πρέπει να είναι μεταξύ 0-100%";
      hasErrors = true;
    }

    if (
      formData.installation_angle &&
      (parseFloat(formData.installation_angle) < 0 ||
        parseFloat(formData.installation_angle) > 90)
    ) {
      newErrors.installation_angle = "Η κλίση πρέπει να είναι μεταξύ 0-90°";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const requestData = {
      ...formData,
      building: buildingUuid,
      project: projectUuid,
    };

    Object.keys(requestData).forEach((key) => {
      if (requestData[key] === "") {
        requestData[key] = null;
      } else if (
        [
          "pv_panels_quantity",
          "pv_panels_unit_price",
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
          "power_per_panel",
          "collector_efficiency",
          "installation_angle",
        ].includes(key)
      ) {
        requestData[key] = parseFloat(requestData[key]) || null;
      }
    });

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/photovoltaic_systems/${editItem.uuid}/`
        : `${API_BASE_URL}/photovoltaic_systems/`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        onSubmitSuccess(data);
        onClose();

        setFormData({
          pv_panels_quantity: "",
          pv_panels_unit_price: "",
          metal_bases_quantity: "",
          metal_bases_unit_price: "",
          piping_quantity: "",
          piping_unit_price: "",
          wiring_quantity: "",
          wiring_unit_price: "",
          inverter_quantity: "",
          inverter_unit_price: "",
          installation_quantity: "",
          installation_unit_price: "",
          power_per_panel: "",
          collector_efficiency: "",
          installation_angle: "",
          pv_usage: "Για ίδια κατανάλωση",
          pv_system_type: "Μονοκρυσταλλικό",
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        setErrors({ general: "Σφάλμα κατά την αποθήκευση" });
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrors({ general: "Σφάλμα δικτύου" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pv_panels_quantity: "",
      pv_panels_unit_price: "",
      metal_bases_quantity: "",
      metal_bases_unit_price: "",
      piping_quantity: "",
      piping_unit_price: "",
      wiring_quantity: "",
      wiring_unit_price: "",
      inverter_quantity: "",
      inverter_unit_price: "",
      installation_quantity: "",
      installation_unit_price: "",
      power_per_panel: "",
      collector_efficiency: "",
      installation_angle: "",
      pv_usage: "Για ίδια κατανάλωση",
      pv_system_type: "Μονοκρυσταλλικό",
    });
    setErrors({});
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-header">
          <h2>
            {isEditMode ? "Επεξεργασία" : "Προσθήκη"} Φωτοβολταϊκού Συστήματος
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && (
            <div className="error-message" style={{ marginBottom: "1rem" }}>
              {errors.general}
            </div>
          )}

          {/* Φωτοβολταϊκά πλαίσια */}
          <div className="form-section">
            <h3>Φωτοβολταϊκά Πλαίσια</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pv_panels_quantity">Ποσότητα (τεμ.)</label>
                <input
                  type="number"
                  id="pv_panels_quantity"
                  value={formData.pv_panels_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.pv_panels_quantity ? "error" : ""}
                />
                {errors.pv_panels_quantity && (
                  <span className="error-text">
                    {errors.pv_panels_quantity}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="pv_panels_unit_price">Τιμή Μονάδας (€)</label>
                <input
                  type="number"
                  id="pv_panels_unit_price"
                  value={formData.pv_panels_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.pv_panels_unit_price ? "error" : ""}
                />
                {errors.pv_panels_unit_price && (
                  <span className="error-text">
                    {errors.pv_panels_unit_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Μεταλλικές βάσεις στήριξης */}
          <div className="form-section">
            <h3>Μεταλλικές Βάσεις Στήριξης</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="metal_bases_quantity">Ποσότητα (τεμ.)</label>
                <input
                  type="number"
                  id="metal_bases_quantity"
                  value={formData.metal_bases_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.metal_bases_quantity ? "error" : ""}
                />
                {errors.metal_bases_quantity && (
                  <span className="error-text">
                    {errors.metal_bases_quantity}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="metal_bases_unit_price">Τιμή Μονάδας (€)</label>
                <input
                  type="number"
                  id="metal_bases_unit_price"
                  value={formData.metal_bases_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.metal_bases_unit_price ? "error" : ""}
                />
                {errors.metal_bases_unit_price && (
                  <span className="error-text">
                    {errors.metal_bases_unit_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Σωληνώσεις */}
          <div className="form-section">
            <h3>Σωληνώσεις</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="piping_quantity">Ποσότητα (μ.)</label>
                <input
                  type="number"
                  id="piping_quantity"
                  value={formData.piping_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.piping_quantity ? "error" : ""}
                />
                {errors.piping_quantity && (
                  <span className="error-text">{errors.piping_quantity}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="piping_unit_price">Τιμή Μονάδας (€/μ.)</label>
                <input
                  type="number"
                  id="piping_unit_price"
                  value={formData.piping_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.piping_unit_price ? "error" : ""}
                />
                {errors.piping_unit_price && (
                  <span className="error-text">{errors.piping_unit_price}</span>
                )}
              </div>
            </div>
          </div>

          {/* Καλωδιώσεις */}
          <div className="form-section">
            <h3>Καλωδιώσεις</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wiring_quantity">Ποσότητα (μ.)</label>
                <input
                  type="number"
                  id="wiring_quantity"
                  value={formData.wiring_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.wiring_quantity ? "error" : ""}
                />
                {errors.wiring_quantity && (
                  <span className="error-text">{errors.wiring_quantity}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="wiring_unit_price">Τιμή Μονάδας (€/μ.)</label>
                <input
                  type="number"
                  id="wiring_unit_price"
                  value={formData.wiring_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.wiring_unit_price ? "error" : ""}
                />
                {errors.wiring_unit_price && (
                  <span className="error-text">{errors.wiring_unit_price}</span>
                )}
              </div>
            </div>
          </div>

          {/* Μετατροπέας ισχύος */}
          <div className="form-section">
            <h3>Μετατροπέας Ισχύος</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="inverter_quantity">Ποσότητα (τεμ.)</label>
                <input
                  type="number"
                  id="inverter_quantity"
                  value={formData.inverter_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.inverter_quantity ? "error" : ""}
                />
                {errors.inverter_quantity && (
                  <span className="error-text">{errors.inverter_quantity}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="inverter_unit_price">Τιμή Μονάδας (€)</label>
                <input
                  type="number"
                  id="inverter_unit_price"
                  value={formData.inverter_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.inverter_unit_price ? "error" : ""}
                />
                {errors.inverter_unit_price && (
                  <span className="error-text">
                    {errors.inverter_unit_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Εγκατάσταση */}
          <div className="form-section">
            <h3>Μεταφορά & Εγκατάσταση</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="installation_quantity">Ποσότητα</label>
                <input
                  type="number"
                  id="installation_quantity"
                  value={formData.installation_quantity}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.installation_quantity ? "error" : ""}
                />
                {errors.installation_quantity && (
                  <span className="error-text">
                    {errors.installation_quantity}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="installation_unit_price">
                  Τιμή Μονάδας (€)
                </label>
                <input
                  type="number"
                  id="installation_unit_price"
                  value={formData.installation_unit_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.installation_unit_price ? "error" : ""}
                />
                {errors.installation_unit_price && (
                  <span className="error-text">
                    {errors.installation_unit_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ενεργειακοί δείκτες */}
          <div className="form-section">
            <h3>Ενεργειακοί Δείκτες & Χαρακτηριστικά</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="power_per_panel">Ισχύς ανά πλαίσιο (W)</label>
                <input
                  type="number"
                  id="power_per_panel"
                  value={formData.power_per_panel}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.power_per_panel ? "error" : ""}
                />
                {errors.power_per_panel && (
                  <span className="error-text">{errors.power_per_panel}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="collector_efficiency">
                  Βαθμός απόδοσης (%)
                </label>
                <input
                  type="number"
                  id="collector_efficiency"
                  value={formData.collector_efficiency}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className={errors.collector_efficiency ? "error" : ""}
                />
                {errors.collector_efficiency && (
                  <span className="error-text">
                    {errors.collector_efficiency}
                  </span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="installation_angle">
                  Κλίση τοποθέτησης (°)
                </label>
                <input
                  type="number"
                  id="installation_angle"
                  value={formData.installation_angle}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="90"
                  className={errors.installation_angle ? "error" : ""}
                />
                {errors.installation_angle && (
                  <span className="error-text">
                    {errors.installation_angle}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="pv_usage">Χρήση Φ/Β</label>
                <select
                  id="pv_usage"
                  value={formData.pv_usage}
                  onChange={handleChange}>
                  <option value="">Επιλέξτε...</option>
                  <option value="Για ίδια κατανάλωση">
                    Για ίδια κατανάλωση
                  </option>
                  <option value="Για πώληση ρεύματος">
                    Για πώληση ρεύματος
                  </option>
                  <option value="Μικτή χρήση">Μικτή χρήση</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pv_system_type">Τύπος Φ/Β συστήματος</label>
                <select
                  id="pv_system_type"
                  value={formData.pv_system_type}
                  onChange={handleChange}>
                  <option value="">Επιλέξτε...</option>
                  <option value="Μονοκρυσταλλικό">Μονοκρυσταλλικό</option>
                  <option value="Πολυκρυσταλλικό">Πολυκρυσταλλικό</option>
                  <option value="Λεπτού φιλμ">Λεπτού φιλμ</option>
                  <option value="Άλλο">Άλλο</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
              disabled={loading}>
              Καθαρισμός
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}>
              Ακύρωση
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Αποθήκευση..."
                : isEditMode
                ? "Ενημέρωση"
                : "Προσθήκη"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PhotovoltaicSystemModalForm;
