import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import Cookies from "universal-cookie";
import InputEntryModal from "../../modals/shared/InputEntryModal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/forms.css";

const cookies = new Cookies();

const AdminPrefectures = () => {
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrefecture, setEditingPrefecture] = useState(null);
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    zone: "",
    temperature_winter: "",
    temperature_summer: "",
    is_active: true,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const { language } = useLanguage();
  const text =
    language === "en"
      ? english_text.AdminPrefectures
      : greek_text.AdminPrefectures;
  const commonText =
    language === "en" ? english_text.AdminCommon : greek_text.AdminCommon;
  const navigate = useNavigate();
  const token = cookies.get("token") || "";

  // Apply blur effect when modal is open
  useModalBlur(showAddModal);

  const zoneOptions = [
    { value: "", label: text.selectZone },
    { value: "A", label: "Ζώνη Α" },
    { value: "B", label: "Ζώνη Β" },
    { value: "C", label: "Ζώνη Γ" },
    { value: "D", label: "Ζώνη Δ" },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  // Reset validation state when modal opens/closes
  useEffect(() => {
    if (showAddModal) {
      setErrors({});
      setShowValidationErrors(false);
      if (!editingPrefecture) {
        setFormData({
          name: "",
          zone: "",
          temperature_winter: "",
          temperature_summer: "",
          is_active: true,
        });
      }
    }
  }, [showAddModal, editingPrefecture]);

  useEffect(() => {
    fetchPrefectures();
  }, []);

  const fetchPrefectures = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/prefectures/admin/all/",
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrefectures(data);
      } else {
        setError("Failed to fetch prefectures");
      }
    } catch (err) {
      setError("Error loading prefectures");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationErrors(true);

    // Basic validation - all fields required
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = text.nameRequired;
    }
    if (!formData.zone) {
      newErrors.zone = text.zoneRequired;
    }
    if (!formData.temperature_winter || formData.temperature_winter === "") {
      newErrors.temperature_winter = text.winterTempRequired;
    }
    if (!formData.temperature_summer || formData.temperature_summer === "") {
      newErrors.temperature_summer = text.summerTempRequired;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const url = editingPrefecture
        ? `http://127.0.0.1:8000/prefectures/${
            editingPrefecture.uuid || editingPrefecture.id
          }/`
        : "http://127.0.0.1:8000/prefectures/";

      const method = editingPrefecture ? "PUT" : "POST";

      const submitData = {
        ...formData,
        temperature_winter: parseFloat(formData.temperature_winter),
        temperature_summer: parseFloat(formData.temperature_summer),
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingPrefecture(null);
        setFormData({
          name: "",
          zone: "",
          temperature_winter: "",
          temperature_summer: "",
          is_active: true,
        });
        setErrors({});
        setShowValidationErrors(false);
        fetchPrefectures();
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setError(text.saveFailed);
        }
      }
    } catch (err) {
      setError(text.saveError);
    }
  };

  const handleEdit = (prefecture) => {
    setEditingPrefecture(prefecture);
    setFormData({
      name: prefecture.name || "",
      zone: prefecture.zone || "",
      temperature_winter: prefecture.temperature_winter || "",
      temperature_summer: prefecture.temperature_summer || "",
      is_active:
        prefecture.is_active !== undefined ? prefecture.is_active : true,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(text.deleteConfirm)) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/prefectures/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (response.ok) {
          fetchPrefectures();
        } else {
          setError("Failed to delete prefecture");
        }
      } catch (err) {
        setError("Error deleting prefecture");
      }
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPrefectures = useMemo(() => {
    let sortableItems = [...prefectures];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [prefectures, sortConfig]);

  if (loading) {
    return (
      <div className="admin-container p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-container p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors duration-200">
              Admin
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary" />
                {text.prefectures}
              </span>
            </div>
          </li>
        </ol>
      </nav>

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
              <FaMapMarkerAlt className="text-primary text-xl" />
              <h1 className="text-2xl font-bold text-gray-800">{text.title}</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingPrefecture(null);
              setFormData({
                name: "",
                zone: "",
                temperature_winter: "",
                temperature_summer: "",
                is_active: true,
              });
            }}
            className="bg-primary hover:bg-primary-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <FaPlus />
            <span>{text.addPrefecture}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-primary-light border border-primary text-primary-bold px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("name")}>
                <div className="flex items-center space-x-1">
                  <span>{language === "en" ? "Name" : "Όνομα"}</span>
                  {sortConfig.key === "name" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("zone")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>{language === "en" ? "Zone" : "Ζώνη"}</span>
                  {sortConfig.key === "zone" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("temperature_winter")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>{language === "en" ? "Winter °C" : "Χειμώνας °C"}</span>
                  {sortConfig.key === "temperature_winter" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("temperature_summer")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>
                    {language === "en" ? "Summer °C" : "Καλοκαίρι °C"}
                  </span>
                  {sortConfig.key === "temperature_summer" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("is_active")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>{language === "en" ? "Active" : "Ενεργό"}</span>
                  {sortConfig.key === "is_active" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Actions" : "Ενέργειες"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPrefectures.map((prefecture) => (
              <tr
                key={prefecture.uuid || prefecture.id}
                className="table-row-hover">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {prefecture.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-bold">
                    {prefecture.zone || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {prefecture.temperature_winter
                    ? `${prefecture.temperature_winter}°C`
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                  {prefecture.temperature_summer
                    ? `${prefecture.temperature_summer}°C`
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      prefecture.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-primary-light text-primary-bold"
                    }`}>
                    {prefecture.is_active ? text.active : text.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(prefecture)}
                    className="text-primary hover:text-primary-bold mr-4 transition-colors duration-200">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(prefecture.uuid || prefecture.id)
                    }
                    className="text-primary hover:text-primary-bold transition-colors duration-200">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <FaMapMarkerAlt className="modal-icon" />
                {editingPrefecture ? text.editPrefecture : text.addPrefecture}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <InputEntryModal
                entry={text.prefectureName}
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                example={text.enterName}
                error={showValidationErrors ? errors.name : ""}
                required
              />

              <InputEntryModal
                entry={text.energyZone}
                id="zone"
                type="select"
                value={formData.zone}
                onChange={handleChange}
                options={zoneOptions}
                error={showValidationErrors ? errors.zone : ""}
                required
              />

              <InputEntryModal
                entry={text.winterTemp}
                id="temperature_winter"
                type="number"
                value={formData.temperature_winter}
                onChange={handleChange}
                example={text.exampleWinter}
                error={showValidationErrors ? errors.temperature_winter : ""}
                step="0.1"
                required
              />

              <InputEntryModal
                entry={text.summerTemp}
                id="temperature_summer"
                type="number"
                value={formData.temperature_summer}
                onChange={handleChange}
                example={text.exampleSummer}
                error={showValidationErrors ? errors.temperature_summer : ""}
                step="0.1"
                required
              />

              <InputEntryModal
                entry={text.activeStatus}
                id="is_active"
                type="select"
                value={formData.is_active ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.value === "true",
                  })
                }
                options={[
                  { value: "true", label: text.active },
                  { value: "false", label: text.inactive },
                ]}
                error={showValidationErrors ? errors.is_active : ""}
              />

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPrefecture(null);
                    setFormData({
                      name: "",
                      zone: "",
                      temperature_winter: "",
                      temperature_summer: "",
                      is_active: true,
                    });
                    setErrors({});
                    setShowValidationErrors(false);
                  }}
                  className="close-modal">
                  {commonText.cancel}
                </button>
                <button type="submit" className="confirm-button">
                  {editingPrefecture
                    ? text.updatePrefecture
                    : text.addPrefecture}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrefectures;
