import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { FaCalculator, FaEdit, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useModalBlur } from "../hooks/useModals";
import InputEntryModal from "../modals/shared/InputEntryModal";
import "../assets/styles/forms.css";
import API_BASE_URL from "../config/api.js";

const cookies = new Cookies(null, { path: "/" });

function AdminNumericValues() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const token = cookies.get("token");

  const [numericValues, setNumericValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useModalBlur(showEditModal);

  useEffect(() => {
    if (token) {
      fetchNumericValues();
    } else {
      setError("Δεν έχετε συνδεθεί. Παρακαλώ κάντε login.");
    }
  }, [token]);

  useEffect(() => {
    if (showEditModal) {
      setErrors({});
      setShowValidationErrors(false);
    }
  }, [showEditModal]);

  const fetchNumericValues = async () => {
    try {
      setLoading(true);

      if (!token) {
        setError("Δεν έχετε συνδεθεί. Παρακαλώ κάντε login.");
        setLoading(false);
        return;
      }

      const response = await $.ajax({
        url: `${API_BASE_URL}/numeric_values/`,
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setNumericValues(response);
      setError(null);
    } catch (err) {
      console.error("Error fetching numeric values:", err);
      if (err.status === 401) {
        setError("Μη εξουσιοδοτημένη πρόσβαση. Παρακαλώ κάντε login ξανά.");
      } else {
        setError("Αποτυχία φόρτωσης αριθμητικών τιμών");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (numericValue) => {
    setEditingValue(numericValue);
    setFormData({
      name: numericValue.name || "",
      value: numericValue.value || "",
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationErrors(true);

    // Validation - only value is required
    const newErrors = {};
    if (!formData.value || formData.value === "") {
      newErrors.value = "Η τιμή είναι υποχρεωτική";
    } else if (parseFloat(formData.value) < 0) {
      newErrors.value = "Η τιμή πρέπει να είναι θετική";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await $.ajax({
        url: `${API_BASE_URL}/numeric_values/${editingValue.uuid}/`,
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ value: parseFloat(formData.value) }),
      });

      setNumericValues(
        numericValues.map((nv) =>
          nv.uuid === editingValue.uuid
            ? { ...nv, value: parseFloat(formData.value) }
            : nv
        )
      );

      setShowEditModal(false);
      setEditingValue(null);
      setFormData({ name: "", value: "" });
      setErrors({});
      setShowValidationErrors(false);
    } catch (err) {
      console.error("Error updating numeric value:", err);
      if (err.status === 401) {
        setError("Μη εξουσιοδοτημένη πρόσβαση. Παρακαλώ κάντε login ξανά.");
      } else {
        setError("Αποτυχία ενημέρωσης τιμής");
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-container p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div className="admin-container p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <FaArrowLeft className="mr-2" size={18} />
              {language === "en" ? "Back to Admin" : "Επιστροφή στο Admin"}
            </button>
            <div className="flex items-center space-x-3">
              <FaCalculator className="text-primary text-xl" />
              <h1 className="text-2xl font-bold text-gray-800">
                {language === "en" ? "Numeric Values" : "Αριθμητικές Τιμές"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Name" : "Όνομα"}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Value" : "Τιμή"}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Created By" : "Δημιουργήθηκε από"}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Last Updated" : "Τελευταία Ενημέρωση"}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Actions" : "Ενέργειες"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {numericValues.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaCalculator className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      {language === "en"
                        ? "No numeric values available"
                        : "Δεν υπάρχουν διαθέσιμες αριθμητικές τιμές"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              numericValues.map((nv) => (
                <tr key={nv.uuid} className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {nv.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {nv.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {nv.created_by_username || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {nv.updated_at
                      ? new Date(nv.updated_at).toLocaleDateString("el-GR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(nv)}
                      className="text-primary hover:text-primary-bold transition-colors duration-200">
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingValue && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <FaCalculator className="modal-icon" />
                {language === "en"
                  ? "Edit Numeric Value"
                  : "Επεξεργασία Αριθμητικής Τιμής"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <InputEntryModal
                entry={language === "en" ? "Name" : "Όνομα"}
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={true}
                required={false}
              />

              <InputEntryModal
                entry={language === "en" ? "Value" : "Τιμή"}
                id="value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                example={
                  language === "en"
                    ? "Enter numeric value"
                    : "Εισάγετε αριθμητική τιμή"
                }
                error={showValidationErrors ? errors.value : ""}
                step="0.01"
                required
              />

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingValue(null);
                    setFormData({ name: "", value: "" });
                    setErrors({});
                    setShowValidationErrors(false);
                  }}
                  className="close-modal">
                  {language === "en" ? "Cancel" : "Άκυρο"}
                </button>
                <button type="submit" className="confirm-button">
                  {language === "en" ? "Update Value" : "Ενημέρωση Τιμής"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNumericValues;
