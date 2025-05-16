import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../css/forms.css";
import { useLanguage } from "../context/LanguageContext"; // Updated import
//language
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import InputEntryModal from "./InputEntryModal";

const cookies = new Cookies();

// Prefecture to energy zone mapping
const PREFECTURE_TO_ZONE = {
  // Zone A prefectures
  'Ηρακλείου': 'A', 'Χανίων': 'A', 'Ρεθύμνου': 'A', 'Λασιθίου': 'A', 
  'Κυκλάδων': 'A', 'Δωδεκανήσου': 'A', 'Σάμου': 'A', 'Μεσσηνίας': 'A', 
  'Λακωνίας': 'A', 'Αργολίδας': 'A', 'Ζακύνθου': 'A', 'Κεφαλληνίας & Ιθάκης': 'A', 
  'Αρκαδίας': 'A',
  
  // Zone B prefectures
  'Αττικής': 'B', 'Κορινθίας': 'B', 'Ηλείας': 'B', 'Αχαΐας': 'B', 
  'Αιτωλοακαρνανίας': 'B', 'Φθιώτιδας': 'B', 'Φωκίδας': 'B', 'Βοιωτίας': 'B', 
  'Εύβοιας': 'B', 'Μαγνησίας': 'B', 'Λέσβου': 'B', 'Χίου': 'B', 'Κέρκυρας': 'B', 
  'Λευκάδας': 'B', 'Θεσπρωτίας': 'B', 'Πρέβεζας': 'B', 'Άρτας': 'B',
  
  // Zone C prefectures
  'Ευρυτανίας': 'C', 'Ιωαννίνων': 'C', 'Λάρισας': 'C', 'Καρδίτσας': 'C', 
  'Τρικάλων': 'C', 'Πιερίας': 'C', 'Ημαθίας': 'C', 'Πέλλας': 'C', 'Θεσσαλονίκης': 'C', 
  'Κιλκίς': 'C', 'Χαλκιδικής': 'C', 'Σερρών': 'C', 'Καβάλας': 'C', 'Ξάνθης': 'C', 
  'Ροδόπης': 'C', 'Έβρου': 'C',
  
  // Zone D prefectures
  'Γρεβενών': 'D', 'Κοζάνης': 'D', 'Καστοριάς': 'D', 'Φλώρινας': 'D', 'Δράμας': 'D'
};

// Get a sorted array of all prefecture names for a flat dropdown
const ALL_PREFECTURES = Object.keys(PREFECTURE_TO_ZONE).sort();

function BuildingModalForm({ isOpen, onClose, onBuildingCreated, projectUuid, params }) {
  const [formData, setFormData] = useState({
    name: "", // Building name
    usage: "", // Building usage
    description: "", // Building description
    year_built: "", // Year built
    address: "", // Address
    prefecture: "", // New field for prefecture
    energy_zone: "", // New field for energy zone
    is_insulated: false, // Is insulated
    is_certified: false, // Is energy class certified
    energy_class: "", // Energy class
    orientation: "", // Orientation
    total_area: "", // Total area
    examined_area: "", // Examined area
    floors_examined: "1", // Number of examined floors
    floor_height: "", // Floor height
    construction_type: "", // Construction type (δόμηση)
    free_facades: "", // Free facades
    altitude: "", // Altitude
    non_operating_days: "", // Days not operating
    operating_hours: "", // Operating hours
    occupants: "", // Number of people in building
  });

  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const token = cookies.get("token") || "";

  // Update energy zone when prefecture changes
  useEffect(() => {
    if (formData.prefecture) {
      const zone = PREFECTURE_TO_ZONE[formData.prefecture] || "";
      setFormData(prevState => ({
        ...prevState,
        energy_zone: zone
      }));
    }
  }, [formData.prefecture]);

  const handleChange = (e) => {
    const { id, value, type } = e.target;

    const newFormData = { ...formData };

    if (id === "is_insulated" || id === "is_certified") {
      newFormData[id] = value === "true";
    } else if (type === "number") {
      newFormData[id] = value === "" ? "" : value;
    } else {
      newFormData[id] = value;
    }

    setFormData(newFormData);

    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!formData.name.trim()) {
      newErrors.name = params.errorRequired || "Field is required";
      hasErrors = true;
    }

    if (!formData.usage.trim()) {
      newErrors.usage = params.errorRequired || "Field is required";
      hasErrors = true;
    }

    if (!formData.description.trim()) {
      newErrors.description = params.errorRequired;
      hasErrors = true;
    }

    if (!formData.address.trim()) {
      newErrors.address = params.errorRequired;
      hasErrors = true;
    }

    if (!formData.prefecture) {
      newErrors.prefecture = params.errorRequired;
      hasErrors = true;
    }

    if (!formData.total_area) {
      newErrors.total_area = params.errorRequired;
      hasErrors = true;
    } else if (parseFloat(formData.total_area) <= 0) {
      newErrors.total_area = params.errorPositive;
      hasErrors = true;
    }

    if (!formData.examined_area) {
      newErrors.examined_area = params.errorRequired;
      hasErrors = true;
    } else if (parseFloat(formData.examined_area) <= 0) {
      newErrors.examined_area = params.errorPositive;
      hasErrors = true;
    }

    if (!formData.floors_examined) {
      newErrors.floors_examined = params.errorRequired;
      hasErrors = true;
    } else if (parseInt(formData.floors_examined) <= 0) {
      newErrors.floors_examined = params.errorPositive;
      hasErrors = true;
    }

    setErrors(newErrors);
    setShowValidationErrors(true);

    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      setTimeout(() => {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }, 0);
      return;
    }

    const buildingData = {
      ...formData,
      project: projectUuid,
    };

    const decimalFields = ['total_area', 'examined_area', 'floor_height', 'altitude'];
    decimalFields.forEach(field => {
      if (buildingData[field] === "") {
        buildingData[field] = null;
      } else if (buildingData[field] !== null && buildingData[field] !== undefined) {
        buildingData[field] = Number(buildingData[field]);
      }
    });

    const integerFields = ['year_built', 'floors_examined', 'free_facades', 'occupants'];
    integerFields.forEach(field => {
      if (buildingData[field] === "") {
        buildingData[field] = null;
      } else if (buildingData[field] !== null && buildingData[field] !== undefined) {
        buildingData[field] = parseInt(buildingData[field], 10);
      }
    });

    $.ajax({
      url: "http://127.0.0.1:8000/buildings/create/",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      data: JSON.stringify(buildingData),
      success: function (response) {
        const newBuilding = {
          ...buildingData,
          uuid: response.uuid,
        };
        onBuildingCreated(newBuilding);
        onClose();
      },
      error: function (jqXHR) {
        setShowValidationErrors(true);
        const newErrorState = {};

        if (jqXHR.responseJSON) {
          if (typeof jqXHR.responseJSON === 'object' && jqXHR.responseJSON !== null) {
            if (jqXHR.responseJSON.error) { 
                if (typeof jqXHR.responseJSON.error === 'object') {
                    setErrors(jqXHR.responseJSON.error);
                } else {
                    newErrorState.general = String(jqXHR.responseJSON.error);
                    setErrors(newErrorState);
                }
            } else if (jqXHR.responseJSON.detail) { 
                newErrorState.general = String(jqXHR.responseJSON.detail);
                setErrors(newErrorState);
            } else { 
                const fieldErrors = {};
                let hasFieldErrors = false;
                for (const key in jqXHR.responseJSON) {
                    if (Array.isArray(jqXHR.responseJSON[key])) {
                        fieldErrors[key] = jqXHR.responseJSON[key].join(' ');
                        hasFieldErrors = true;
                    } else if (typeof jqXHR.responseJSON[key] === 'string') {
                        fieldErrors[key] = jqXHR.responseJSON[key];
                        hasFieldErrors = true;
                    }
                }
                if (hasFieldErrors) {
                    setErrors(fieldErrors);
                } else {
                    newErrorState.general = "Error processing server response. Check console for details.";
                    setErrors(newErrorState);
                }
            }
          } else {
            newErrorState.general = String(jqXHR.responseJSON);
            setErrors(newErrorState);
          }
        } else {
          const defaultMessage = `An error occurred: ${jqXHR.statusText || 'Unknown error'}.`;
          const errorMessage = (params && params.errorGeneral) ? params.errorGeneral : defaultMessage;
          newErrorState.general = errorMessage;
          setErrors(newErrorState);
        }
      },
    });
  };

  if (!isOpen) return null;

  const getInputClass = (fieldName) => {
    return showValidationErrors && errors[fieldName] 
      ? "block w-full p-2 border border-red-500 bg-red-50 rounded-md shadow-sm focus:border-red-500 focus:ring focus:ring-red-200" 
      : "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50";
  };

  const renderError = (fieldName) => {
    if (showValidationErrors && errors[fieldName]) {
      return (
        <div className="text-red-500 text-xs mt-1">
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-opacity-50 py-20">
      <div className="rounded-lg p-6 w-full max-w-xl border-primary-light border-2 bg-white shadow-lg flex flex-col max-h-[80vh]">
        <h2 className="text-lg font-bold mb-2 text-center sticky top-0 bg-white pb-2 z-10">{params.h2}</h2>
        <p className="text-sm text-gray-500 text-center mb-4 sticky top-8 bg-white z-10">
          <span className="text-red-500">*</span> {params.requiredFieldsNote}
        </p>
        
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {errors.general}
          </div>
        )}
        
        <div className="overflow-y-auto flex-grow pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.basicInfoSection}</h3>
              
              <InputEntryModal
                entry={
                  <>
                    {params.buildingName} 
                  </>
                }
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                example={params.buildingName_example}
                error={showValidationErrors ? errors.name : ""}
                required
                className={errors.name && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={
                  <>
                    {params.buildingUsage} 
                  </>
                }
                id="usage"
                name="usage"
                type="text"
                value={formData.usage}
                onChange={handleChange}
                example={params.buildingUsage_example}
                error={showValidationErrors ? errors.usage : ""}
                required
                className={errors.usage && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={
                  <>
                    {params.description} 
                  </>
                }
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                example={params.description_example}
                error={showValidationErrors ? errors.description : ""}
                required
                className={errors.description && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={params.yearBuilt}
                id="year_built"
                name="year_built"
                type="number"
                value={formData.year_built}
                onChange={handleChange}
                example={params.yearBuilt_example}
                error={showValidationErrors ? errors.year_built : ""}
                min="1800"
                max={new Date().getFullYear()}
                className={errors.year_built && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={
                  <>
                    {params.address} 
                  </>
                }
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                example={params.address_example}
                error={showValidationErrors ? errors.address : ""}
                required
                className={errors.address && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <div className="mb-4">
                <label htmlFor="prefecture" className="block text-sm mb-1">
                  {params.prefecture} <span className="text-red-500">*</span>
                </label>
                <select
                  id="prefecture"
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleChange}
                  className={getInputClass("prefecture")}
                  required
                >
                  <option value="">{params.selectPrefecture}</option>
                  {ALL_PREFECTURES.map(prefecture => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))}
                </select>
                {renderError("prefecture")}
              </div>

              <div className="mb-4">
                <label htmlFor="energy_zone" className="block text-sm mb-1">
                  {params.energyZone}
                </label>
                <input
                  type="text"
                  id="energy_zone"
                  name="energy_zone"
                  value={formData.energy_zone}
                  readOnly
                  disabled
                  className="block w-full p-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.buildingCharacteristicsSection}</h3>
              
              <div className="mb-4">
                <label htmlFor="is_insulated" className="block text-sm mb-1">{params.isInsulated}</label>
                <select
                  id="is_insulated"
                  name="is_insulated"
                  value={formData.is_insulated.toString()}
                  onChange={handleChange}
                  className={getInputClass("is_insulated")}
                >
                  <option value="false">{params.no}</option>
                  <option value="true">{params.yes}</option>
                </select>
                {renderError("is_insulated")}
              </div>

              <div className="mb-4">
                <label htmlFor="is_certified" className="block text-sm mb-1">{params.isCertified}</label>
                <select
                  id="is_certified"
                  name="is_certified"
                  value={formData.is_certified.toString()}
                  onChange={handleChange}
                  className={getInputClass("is_certified")}
                >
                  <option value="false">{params.no}</option>
                  <option value="true">{params.yes}</option>
                </select>
                {renderError("is_certified")}
              </div>

              <InputEntryModal
                entry={params.energyClass}
                id="energy_class"
                name="energy_class"
                type="text"
                value={formData.energy_class}
                onChange={handleChange}
                example={params.energyClass_example}
                error={showValidationErrors ? errors.energy_class : ""}
                className={errors.energy_class && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={params.orientation}
                id="orientation"
                name="orientation"
                type="text"
                value={formData.orientation}
                onChange={handleChange}
                example={params.orientation_example}
                error={showValidationErrors ? errors.orientation : ""}
                className={errors.orientation && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.areasAndFloorsSection}</h3>
              
              <InputEntryModal
                entry={
                  <>
                    {params.totalArea} 
                  </>
                }
                id="total_area"
                name="total_area"
                type="number"
                value={formData.total_area}
                onChange={handleChange}
                example={params.totalArea_example}
                error={showValidationErrors ? errors.total_area : ""}
                required
                min="0"
                step="0.01"
                className={errors.total_area && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={
                  <>
                    {params.examinedArea} 
                  </>
                }
                id="examined_area"
                name="examined_area"
                type="number"
                value={formData.examined_area}
                onChange={handleChange}
                example={params.examinedArea_example}
                error={showValidationErrors ? errors.examined_area : ""}
                required
                min="0"
                step="0.01"
                className={errors.examined_area && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />

              <InputEntryModal
                entry={
                  <>
                    {params.floorsExamined} 
                  </>
                }
                id="floors_examined"
                name="floors_examined"
                type="number"
                value={formData.floors_examined}
                onChange={handleChange}
                example={params.floorsExamined_example}
                error={showValidationErrors ? errors.floors_examined : ""}
                required
                min="1"
                className={errors.floors_examined && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
              
              <InputEntryModal
                entry={params.floorHeight}
                id="floor_height"
                name="floor_height"
                type="number"
                value={formData.floor_height}
                onChange={handleChange}
                example={params.floorHeight_example}
                error={showValidationErrors ? errors.floor_height : ""}
                min="0"
                step="0.01"
                className={errors.floor_height && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.additionalInfoSection}</h3>
              
              <InputEntryModal
                entry={params.constructionType}
                id="construction_type"
                name="construction_type"
                type="text"
                value={formData.construction_type}
                onChange={handleChange}
                example={params.constructionType_example}
                error={showValidationErrors ? errors.construction_type : ""}
                className={errors.construction_type && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
              
              <InputEntryModal
                entry={params.freeFacades}
                id="free_facades"
                name="free_facades"
                type="number"
                value={formData.free_facades}
                onChange={handleChange}
                example={params.freeFacades_example}
                error={showValidationErrors ? errors.free_facades : ""}
                min="0"
                max="4"
                className={errors.free_facades && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
              
              <InputEntryModal
                entry={params.altitude}
                id="altitude"
                name="altitude"
                type="number"
                value={formData.altitude}
                onChange={handleChange}
                example={params.altitude_example}
                error={showValidationErrors ? errors.altitude : ""}
                min="0"
                step="0.1"
                className={errors.altitude && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
            </div>

            <div>
              <h3 className="font-bold text-primary text-sm mb-3">{params.operationalInfoSection}</h3>
              
              <InputEntryModal
                entry={params.nonOperatingDays}
                id="non_operating_days"
                name="non_operating_days"
                type="text"
                value={formData.non_operating_days}
                onChange={handleChange}
                example={params.nonOperatingDays_example}
                error={showValidationErrors ? errors.non_operating_days : ""}
                className={errors.non_operating_days && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
              
              <InputEntryModal
                entry={params.operatingHours}
                id="operating_hours"
                name="operating_hours"
                type="text"
                value={formData.operating_hours}
                onChange={handleChange}
                example={params.operatingHours_example}
                error={showValidationErrors ? errors.operating_hours : ""}
                className={errors.operating_hours && showValidationErrors ? "border-red-50" : ""}
              />
              
              <InputEntryModal
                entry={params.occupants}
                id="occupants"
                name="occupants"
                type="number"
                value={formData.occupants}
                onChange={handleChange}
                example={params.occupants_example}
                error={showValidationErrors ? errors.occupants : ""}
                min="0"
                className={errors.occupants && showValidationErrors ? "border-red-500 bg-red-50" : ""}
              />
            </div>
          </form>
        </div>
        
        <div className="flex justify-between mt-4 pt-2 border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="close-modal">
            {params.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="confirm-button">
            {params.create}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuildingModal({ isOpen, onClose, onBuildingCreated, projectUuid }) {
  const { language } = useLanguage();
  const params = language === "en" ? english_text.BuildingModal : greek_text.BuildingModal;

  return (
    <div className="form-wrapper">
      <BuildingModalForm
        isOpen={isOpen}
        onClose={onClose}
        onBuildingCreated={onBuildingCreated}
        projectUuid={projectUuid}
        params={params}
      />
    </div>
  );
}