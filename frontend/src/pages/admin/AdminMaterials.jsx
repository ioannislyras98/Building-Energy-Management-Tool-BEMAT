import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import Cookies from "universal-cookie";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCubes,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import InputEntryModal from "../../modals/shared/InputEntryModal";
import "../../assets/styles/forms.css";

const cookies = new Cookies();

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    thermal_conductivity: "",
    description: "",
    is_active: true,
  });

  const { language } = useLanguage();
  const text = language === "en" ? english_text.SideBar : greek_text.SideBar;

  // Apply blur effect when modal is open
  useModalBlur(showAddModal);
  const navigate = useNavigate();
  const token = cookies.get("token") || "";

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
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

  // Filtered and sorted materials
  const filteredAndSortedMaterials = useMemo(() => {
    let filteredMaterials = materials.filter(
      (material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.category_display &&
          material.category_display
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (material.category &&
          material.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig.key) {
      filteredMaterials.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle category_display for sorting
        if (sortConfig.key === "category") {
          aValue = a.category_display || a.category || "";
          bValue = b.category_display || b.category || "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredMaterials;
  }, [materials, searchTerm, sortConfig]);

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, []);

  // Reset validation state when modal opens/closes
  useEffect(() => {
    if (showAddModal) {
      setErrors({});
      setShowValidationErrors(false);
      if (!editingMaterial) {
        setFormData({
          name: "",
          category: "",
          thermal_conductivity: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [showAddModal, editingMaterial]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/materials/categories/list/",
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/materials/admin/all/",
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      } else {
        setError("Failed to fetch materials");
      }
    } catch (err) {
      setError("Error loading materials");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationErrors(true);

    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name =
        language === "en" ? "Name is required" : "Το όνομα είναι υποχρεωτικό";
    }
    if (!formData.category) {
      newErrors.category =
        language === "en"
          ? "Category is required"
          : "Η κατηγορία είναι υποχρεωτική";
    }
    if (
      !formData.thermal_conductivity ||
      formData.thermal_conductivity === ""
    ) {
      newErrors.thermal_conductivity =
        language === "en"
          ? "Thermal conductivity is required"
          : "Η θερμική αγωγιμότητα είναι υποχρεωτική";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const url = editingMaterial
        ? `http://127.0.0.1:8000/materials/${
            editingMaterial.uuid || editingMaterial.id
          }/`
        : "http://127.0.0.1:8000/materials/";

      const method = editingMaterial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingMaterial(null);
        setFormData({
          name: "",
          category: "",
          thermal_conductivity: "",
          description: "",
          is_active: true,
        });
        setErrors({});
        setShowValidationErrors(false);
        fetchMaterials();
      } else {
        setError("Failed to save material");
      }
    } catch (err) {
      setError("Error saving material");
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name || "",
      category: material.category || "",
      thermal_conductivity: material.thermal_conductivity || "",
      description: material.description || "",
      is_active: material.is_active !== undefined ? material.is_active : true,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        language === "en"
          ? "Are you sure you want to delete this material?"
          : "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το υλικό;"
      )
    ) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/materials/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          fetchMaterials();
        } else {
          setError("Failed to delete material");
        }
      } catch (err) {
        setError("Error deleting material");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">Loading...</p>
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
            <div className="flex items-center space-x-2">
              <FaCubes className="text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">
                {text.materials}
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingMaterial(null);
              setFormData({
                name: "",
                category: "",
                thermal_conductivity: "",
                description: "",
                is_active: true,
              });
            }}
            className="bg-primary hover:bg-primary-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <FaPlus />
            <span>
              {language === "en" ? "Add Material" : "Προσθήκη Υλικού"}
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "en"
                ? "Search materials by name or category..."
                : "Αναζήτηση υλικών βάσει ονόματος ή κατηγορίας..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {searchTerm && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {language === "en"
                ? `Found ${filteredAndSortedMaterials.length} material${
                    filteredAndSortedMaterials.length !== 1 ? "s" : ""
                  }`
                : `Βρέθηκαν ${filteredAndSortedMaterials.length} υλικ${
                    filteredAndSortedMaterials.length === 1 ? "ό" : "ά"
                  }`}
              {searchTerm && (
                <span className="font-medium">
                  {language === "en"
                    ? ` matching "${searchTerm}"`
                    : ` που ταιριάζουν με "${searchTerm}"`}
                </span>
              )}
            </p>
          </div>
        )}
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
                onClick={() => handleSort("category")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>{language === "en" ? "Category" : "Κατηγορία"}</span>
                  {sortConfig.key === "category" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("thermal_conductivity")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>
                    {language === "en"
                      ? "Thermal Conductivity (W/mK)"
                      : "Θερμική Αγωγιμότητα (W/mK)"}
                  </span>
                  {sortConfig.key === "thermal_conductivity" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("is_active")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>{language === "en" ? "Status" : "Κατάσταση"}</span>
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
            {filteredAndSortedMaterials.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaCubes className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      {searchTerm
                        ? language === "en"
                          ? "No materials found"
                          : "Δεν βρέθηκαν υλικά"
                        : language === "en"
                        ? "No materials available"
                        : "Δεν υπάρχουν διαθέσιμα υλικά"}
                    </p>
                    {searchTerm && (
                      <p className="mt-1">
                        {language === "en"
                          ? `Try adjusting your search term "${searchTerm}"`
                          : `Δοκιμάστε να τροποποιήσετε την αναζήτηση "${searchTerm}"`}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedMaterials.map((material) => (
                <tr
                  key={material.uuid || material.id}
                  className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {material.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-bold">
                      {material.category_display || material.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {material.thermal_conductivity
                      ? `${material.thermal_conductivity}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        material.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-primary-light text-primary-bold"
                      }`}>
                      {material.is_active
                        ? language === "en"
                          ? "Active"
                          : "Ενεργό"
                        : language === "en"
                        ? "Inactive"
                        : "Ανενεργό"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-primary hover:text-primary-bold mr-4 transition-colors duration-200">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(material.uuid || material.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <FaCubes className="modal-icon" />
                {editingMaterial
                  ? language === "en"
                    ? "Edit Material"
                    : "Επεξεργασία Υλικού"
                  : language === "en"
                  ? "Add Material"
                  : "Προσθήκη Υλικού"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <InputEntryModal
                entry={language === "en" ? "Material Name" : "Όνομα Υλικού"}
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                example={
                  language === "en"
                    ? "Enter material name"
                    : "Εισάγετε το όνομα του υλικού"
                }
                error={showValidationErrors ? errors.name : ""}
                required
              />

              <InputEntryModal
                entry={language === "en" ? "Category" : "Κατηγορία"}
                id="category"
                type="select"
                value={formData.category}
                onChange={handleChange}
                example={
                  language === "en" ? "Select Category" : "Επιλέξτε Κατηγορία"
                }
                options={categories}
                error={showValidationErrors ? errors.category : ""}
                required
              />

              <InputEntryModal
                entry={
                  language === "en"
                    ? "Thermal Conductivity (W/mK)"
                    : "Θερμική Αγωγιμότητα (W/mK)"
                }
                id="thermal_conductivity"
                type="number"
                value={formData.thermal_conductivity}
                onChange={handleChange}
                example={language === "en" ? "e.g. 0.040" : "π.χ. 0.040"}
                error={showValidationErrors ? errors.thermal_conductivity : ""}
                step="0.001"
                required
              />

              <InputEntryModal
                entry={language === "en" ? "Description" : "Περιγραφή"}
                id="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                example={
                  language === "en"
                    ? "Optional description"
                    : "Προαιρετική περιγραφή"
                }
              />

              <InputEntryModal
                entry={language === "en" ? "Status" : "Κατάσταση"}
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
                  {
                    value: "true",
                    label: language === "en" ? "Active" : "Ενεργό",
                  },
                  {
                    value: "false",
                    label: language === "en" ? "Inactive" : "Ανενεργό",
                  },
                ]}
              />
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMaterial(null);
                    setFormData({
                      name: "",
                      category: "",
                      thermal_conductivity: "",
                      description: "",
                      is_active: true,
                    });
                    setErrors({});
                    setShowValidationErrors(false);
                  }}
                  className="close-modal">
                  {language === "en" ? "Cancel" : "Άκυρο"}
                </button>
                <button type="submit" className="confirm-button">
                  {editingMaterial
                    ? language === "en"
                      ? "Update Material"
                      : "Ενημέρωση Υλικού"
                    : language === "en"
                    ? "Add Material"
                    : "Προσθήκη Υλικού"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
