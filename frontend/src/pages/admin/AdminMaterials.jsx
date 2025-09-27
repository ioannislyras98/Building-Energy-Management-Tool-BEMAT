import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import Cookies from "universal-cookie";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaCubes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const cookies = new Cookies();

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    thermal_conductivity: "",
    density: "",
    specific_heat: "",
  });

  const { language } = useLanguage();
  const text = language === "en" ? english_text.SideBar : greek_text.SideBar;
  const navigate = useNavigate();
  const token = cookies.get("token") || "";

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/materials/", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

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
    try {
      const url = editingMaterial
        ? `http://127.0.0.1:8000/materials/${editingMaterial.id}/`
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
          thermal_conductivity: "",
          density: "",
          specific_heat: "",
        });
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
      name: material.name,
      thermal_conductivity: material.thermal_conductivity || "",
      density: material.density || "",
      specific_heat: material.specific_heat || "",
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
              <FaCubes className="text-red-500" />
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
                thermal_conductivity: "",
                density: "",
                specific_heat: "",
              });
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
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

      {/* Materials List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Name" : "Όνομα"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en"
                  ? "Thermal Conductivity"
                  : "Θερμική Αγωγιμότητα"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Density" : "Πυκνότητα"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Specific Heat" : "Ειδική Θερμότητα"}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "en" ? "Actions" : "Ενέργειες"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.thermal_conductivity || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.density || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.specific_heat || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-blue-600 hover:text-blue-900 mr-4">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-900">
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingMaterial
                ? language === "en"
                  ? "Edit Material"
                  : "Επεξεργασία Υλικού"
                : language === "en"
                ? "Add Material"
                : "Προσθήκη Υλικού"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {language === "en" ? "Name" : "Όνομα"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {language === "en"
                    ? "Thermal Conductivity"
                    : "Θερμική Αγωγιμότητα"}
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.thermal_conductivity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thermal_conductivity: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {language === "en" ? "Density" : "Πυκνότητα"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.density}
                  onChange={(e) =>
                    setFormData({ ...formData, density: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {language === "en" ? "Specific Heat" : "Ειδική Θερμότητα"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specific_heat}
                  onChange={(e) =>
                    setFormData({ ...formData, specific_heat: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMaterial(null);
                    setFormData({
                      name: "",
                      thermal_conductivity: "",
                      density: "",
                      specific_heat: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  {language === "en" ? "Cancel" : "Άκυρο"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  {language === "en" ? "Save" : "Αποθήκευση"}
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
