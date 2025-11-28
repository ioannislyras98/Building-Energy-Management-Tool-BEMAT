import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import Cookies from "universal-cookie";
import InputEntryModal from "../../modals/shared/InputEntryModal";
import ConfirmationDialog from "../../components/dialogs/ConfirmationDialog";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/forms.css";
import {
  getAllPrefecturesAdmin,
  createPrefecture,
  updatePrefecture,
  deletePrefecture,
} from "../../../services/ApiService";

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
    solar_radiation: "",
    annual_solar_radiation: "",
    is_active: true,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prefectureToDelete, setPrefectureToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedPrefectures, setSelectedPrefectures] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const { language } = useLanguage();
  const text =
    language === "en"
      ? english_text.AdminPrefectures
      : greek_text.AdminPrefectures;
  const commonText =
    language === "en" ? english_text.AdminCommon : greek_text.AdminCommon;
  const navigate = useNavigate();
  const token = cookies.get("token") || "";

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
          solar_radiation: "",
          annual_solar_radiation: "",
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
      const data = await getAllPrefecturesAdmin();
      setPrefectures(data);
    } catch (err) {
      setError("Error loading prefectures");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidationErrors(true);
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
      const submitData = {
        ...formData,
        temperature_winter: parseFloat(formData.temperature_winter),
        temperature_summer: parseFloat(formData.temperature_summer),
        solar_radiation: formData.solar_radiation ? parseFloat(formData.solar_radiation) : null,
        annual_solar_radiation: formData.annual_solar_radiation ? parseFloat(formData.annual_solar_radiation) : null,
      };

      if (editingPrefecture) {
        await updatePrefecture(
          editingPrefecture.uuid || editingPrefecture.id,
          submitData
        );
      } else {
        await createPrefecture(submitData);
      }

      setShowAddModal(false);
      setEditingPrefecture(null);
      setFormData({
        name: "",
        zone: "",
        temperature_winter: "",
        temperature_summer: "",
        solar_radiation: "",
        annual_solar_radiation: "",
        is_active: true,
      });
      setErrors({});
      setShowValidationErrors(false);
      fetchPrefectures();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(text.saveError);
      }
    }
  };

  const handleEdit = (prefecture) => {
    setEditingPrefecture(prefecture);
    setFormData({
      name: prefecture.name || "",
      zone: prefecture.zone || "",
      temperature_winter: prefecture.temperature_winter || "",
      temperature_summer: prefecture.temperature_summer || "",
      solar_radiation: prefecture.solar_radiation || "",
      annual_solar_radiation: prefecture.annual_solar_radiation || "",
      is_active:
        prefecture.is_active !== undefined ? prefecture.is_active : true,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (prefecture) => {
    setPrefectureToDelete(prefecture);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!prefectureToDelete) return;

    try {
      await deletePrefecture(prefectureToDelete.uuid || prefectureToDelete.id);
      fetchPrefectures();
      setDeleteDialogOpen(false);
      setPrefectureToDelete(null);
    } catch (err) {
      setError("Error deleting prefecture");
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPrefectureToDelete(null);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPrefectures(sortedPrefectures.map((p) => p.uuid || p.id));
    } else {
      setSelectedPrefectures([]);
    }
  };

  const handleSelectPrefecture = (prefectureId, checked) => {
    if (checked) {
      setSelectedPrefectures([...selectedPrefectures, prefectureId]);
    } else {
      setSelectedPrefectures(
        selectedPrefectures.filter((id) => id !== prefectureId)
      );
      setSelectAll(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const deletePromises = selectedPrefectures.map((id) =>
        deletePrefecture(id)
      );
      await Promise.all(deletePromises);
      fetchPrefectures();
      setSelectedPrefectures([]);
      setSelectAll(false);
      setBulkDeleteDialogOpen(false);
    } catch (err) {
      setError("Error deleting prefectures");
    }
  };

  const handleBulkDeleteDialogClose = () => {
    setBulkDeleteDialogOpen(false);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPrefectures = useMemo(() => {
    let filteredItems = prefectures.filter(
      (prefecture) =>
        prefecture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prefecture.zone &&
          prefecture.zone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [prefectures, sortConfig, searchTerm]);

  if (loading) {
    return (
      <div className="admin-container p-6 bg-gray-50 min-h-screen flex items-center justify-center">
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

      {/* Search */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "en"
                ? "Search prefectures by name or zone..."
                : "Αναζήτηση νομών βάσει ονόματος ή ζώνης..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPrefectures.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {language === "en"
                ? `${selectedPrefectures.length} prefecture${
                    selectedPrefectures.length !== 1 ? "s" : ""
                  } selected`
                : `${selectedPrefectures.length} νομ${
                    selectedPrefectures.length === 1 ? "ός" : "οί"
                  } επιλεγμέν${selectedPrefectures.length === 1 ? "ος" : "οι"}`}
            </span>
            <button
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200">
              🗑️{" "}
              {language === "en" ? "Delete Selected" : "Διαγραφή Επιλεγμένων"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {searchTerm && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {language === "en"
                ? `Found ${sortedPrefectures.length} prefecture${
                    sortedPrefectures.length !== 1 ? "s" : ""
                  }`
                : `Βρέθηκαν ${sortedPrefectures.length} νομ${
                    sortedPrefectures.length === 1 ? "ός" : "οί"
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
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll && sortedPrefectures.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </th>
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
                onClick={() => handleSort("solar_radiation")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>
                    {language === "en" ? "Solar Rad. (kWh/m²/day)" : "Ηλ. Ακτ. (kWh/m²/ημέρα)"}
                  </span>
                  {sortConfig.key === "solar_radiation" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleSort("annual_solar_radiation")}>
                <div className="flex items-center justify-center space-x-1">
                  <span>
                    {language === "en" ? "Annual Solar (kWh/m²/yr)" : "Ετήσια Ηλ. (kWh/m²/έτος)"}
                  </span>
                  {sortConfig.key === "annual_solar_radiation" && (
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
            {sortedPrefectures.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaMapMarkerAlt className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      {searchTerm
                        ? language === "en"
                          ? "No prefectures found"
                          : "Δεν βρέθηκαν νομοί"
                        : language === "en"
                        ? "No prefectures available"
                        : "Δεν υπάρχουν διαθέσιμοι νομοί"}
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
              sortedPrefectures.map((prefecture) => (
                <tr
                  key={prefecture.uuid || prefecture.id}
                  className="table-row-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPrefectures.includes(
                        prefecture.uuid || prefecture.id
                      )}
                      onChange={(e) =>
                        handleSelectPrefecture(
                          prefecture.uuid || prefecture.id,
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {prefecture.solar_radiation
                      ? `${prefecture.solar_radiation}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {prefecture.annual_solar_radiation
                      ? `${prefecture.annual_solar_radiation}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prefecture.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
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
                      onClick={() => handleDeleteClick(prefecture)}
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
                entry={language === "en" ? "Daily Solar Radiation (kWh/m²/day)" : "Μέση Ημερήσια Ηλιακή Ακτινοβολία (kWh/m²/ημέρα)"}
                id="solar_radiation"
                type="number"
                value={formData.solar_radiation}
                onChange={handleChange}
                example={language === "en" ? "e.g., 5.0" : "π.χ., 5.0"}
                error={showValidationErrors ? errors.solar_radiation : ""}
                step="0.1"
              />

              <InputEntryModal
                entry={language === "en" ? "Annual Solar Radiation (kWh/m²/year)" : "Ετήσια Ηλιακή Ακτινοβολία (kWh/m²/έτος)"}
                id="annual_solar_radiation"
                type="number"
                value={formData.annual_solar_radiation}
                onChange={handleChange}
                example={language === "en" ? "e.g., 1600" : "π.χ., 1600"}
                error={showValidationErrors ? errors.annual_solar_radiation : ""}
                step="0.1"
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
                      solar_radiation: "",
                      annual_solar_radiation: "",
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title={language === "en" ? "Delete Prefecture" : "Διαγραφή Νομού"}
        message={
          prefectureToDelete
            ? `${
                language === "en"
                  ? "Are you sure you want to delete"
                  : "Είστε βέβαιοι ότι θέλετε να διαγράψετε τον νομό"
              } "${prefectureToDelete.name}"?`
            : ""
        }
        confirmText={language === "en" ? "Delete" : "Διαγραφή"}
        cancelText={language === "en" ? "Cancel" : "Άκυρο"}
        confirmColor="error"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        title={
          language === "en"
            ? "Delete Selected Prefectures"
            : "Διαγραφή Επιλεγμένων Νομών"
        }
        message={
          selectedPrefectures.length > 0
            ? `${
                language === "en"
                  ? `Are you sure you want to delete ${
                      selectedPrefectures.length
                    } selected prefecture${
                      selectedPrefectures.length !== 1 ? "s" : ""
                    }?`
                  : `Είστε βέβαιοι ότι θέλετε να διαγράψετε ${
                      selectedPrefectures.length
                    } επιλεγμέν${
                      selectedPrefectures.length === 1 ? "ο νομό" : "ους νομούς"
                    }?`
              }`
            : ""
        }
        confirmText={language === "en" ? "Delete All" : "Διαγραφή Όλων"}
        cancelText={language === "en" ? "Cancel" : "Άκυρο"}
        confirmColor="error"
      />
    </div>
  );
};

export default AdminPrefectures;
