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

function BuildingModalForm({ isOpen, onClose, onBuildingCreated, projectUuid, params }) {
  console.log("BuildingModalForm params:", params);
  console.log("BuildingModalForm projectUuid:", projectUuid);
  const [formData, setFormData] = useState({
    name: "", // Building name
    usage: "", // Building usage
    description: "", // Building description
    year_built: "", // Year built
    address: "", // Address
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

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    
    console.log(`Field ${id} changed to: "${value}" (type: ${type})`);
    console.log("Previous state:", formData);
    
    // Δημιουργήστε το νέο state αντικείμενο πριν την ενημέρωση
    const newFormData = { ...formData };
    
    // Για τα dropdown που αναπαριστούν boolean τιμές
    if (id === "is_insulated" || id === "is_certified") {
      newFormData[id] = value === "true";
    } 
    // Για αριθμητικά πεδία
    else if (type === "number") {
      newFormData[id] = value === "" ? "" : value; // Διατήρηση κενού string αν δεν υπάρχει τιμή
    }
    // Για όλα τα άλλα πεδία (text, κλπ)
    else {
      newFormData[id] = value;
    }
    
    console.log("New state will be:", newFormData);
    
    // Ενημέρωση του state
    setFormData(newFormData);
    
    // Καθαρισμός σφάλματος όταν το πεδίο επεξεργάζεται
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
    
    // Required fields validation
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
    
    // Σημαντικό: Πρώτα ορίζουμε τα errors και μετά το showValidationErrors
    setErrors(newErrors);
    setShowValidationErrors(true);
    
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Καθαρίζουμε τυχόν προηγούμενα σφάλματα
    setErrors({});
    
    // Επικύρωση φόρμας
    const isValid = validateForm();
    
    // Αν η φόρμα δεν είναι έγκυρη, διακόπτουμε την υποβολή
    if (!isValid) {
      setTimeout(() => {
        // Χρησιμοποιούμε setTimeout για να εξασφαλίσουμε ότι το state έχει ενημερωθεί
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

    // Prepare data for API call
    const buildingData = {
      ...formData,
      project: projectUuid, // Include the project UUID
    };

    // Μετατροπή κενών τιμών σε null και βεβαίωση ότι οι αριθμοί είναι πραγματικά αριθμοί
    const decimalFields = ['total_area', 'examined_area', 'floor_height', 'altitude'];
    decimalFields.forEach(field => {
      if (buildingData[field] === "") {
        buildingData[field] = null;
      } else if (buildingData[field] !== null && buildingData[field] !== undefined) {
        buildingData[field] = Number(buildingData[field]);
      }
    });

    // Βεβαίωση ότι και άλλα αριθμητικά πεδία είναι πραγματικά αριθμοί
    const integerFields = ['year_built', 'floors_examined', 'free_facades', 'occupants'];
    integerFields.forEach(field => {
      if (buildingData[field] === "") {
        buildingData[field] = null;
      } else if (buildingData[field] !== null && buildingData[field] !== undefined) {
        buildingData[field] = parseInt(buildingData[field], 10);
      }
    });

    // API call to create building
    console.log("Data being sent to API (object):", buildingData);
    console.log("Data being sent to API (JSON string):", JSON.stringify(buildingData));
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
        console.log("Building created:", response);
        const newBuilding = {
          ...buildingData,
          uuid: response.uuid,
        };
        onBuildingCreated(newBuilding);
        onClose();
      },
      error: function (jqXHR) { // Changed 'error' to 'jqXHR' for clarity
        setShowValidationErrors(true);
        const newErrorState = {};
        console.error("AJAX error object:", jqXHR); // Log the full jqXHR object

        if (jqXHR.responseJSON) {
          // Alert the full JSON response from the backend for detailed diagnostics
          alert("Backend Error Details: " + JSON.stringify(jqXHR.responseJSON));
          
          if (typeof jqXHR.responseJSON === 'object' && jqXHR.responseJSON !== null) {
            // Handle common error structures like { field: ["message"] } or { detail: "message" }
            // or the originally anticipated { error: "message" } or { error: { field: "message" } }
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
                // Attempt to map field-specific errors
                const fieldErrors = {};
                let hasFieldErrors = false;
                for (const key in jqXHR.responseJSON) {
                    if (Array.isArray(jqXHR.responseJSON[key])) {
                        fieldErrors[key] = jqXHR.responseJSON[key].join(' ');
                        hasFieldErrors = true;
                    } else if (typeof jqXHR.responseJSON[key] === 'string') {
                        // If it's a string, assume it's an error for that key or a general one
                        fieldErrors[key] = jqXHR.responseJSON[key];
                        hasFieldErrors = true;
                    }
                }
                if (hasFieldErrors) {
                    setErrors(fieldErrors);
                } else {
                    // Fallback if responseJSON is an object but not in a recognized error format
                    newErrorState.general = "Error processing server response. Check console for details.";
                    setErrors(newErrorState);
                }
            }
          } else {
            // If responseJSON is not an object (e.g. a string)
            newErrorState.general = String(jqXHR.responseJSON);
            setErrors(newErrorState);
          }
        } else {
          // Fallback if no jqXHR.responseJSON (e.g. network error, non-JSON response)
          const defaultMessage = `An error occurred: ${jqXHR.statusText || 'Unknown error'}.`;
          const errorMessage = (params && params.errorGeneral) ? params.errorGeneral : defaultMessage;
          newErrorState.general = errorMessage;
          setErrors(newErrorState);
          alert("Error: " + errorMessage + (jqXHR.responseText ? `\nRaw Response: ${jqXHR.responseText}` : ''));
        }
      },
    });
  };

  if (!isOpen) return null;

  // Διαμόρφωση CSS κλάσης για τα πεδία με σφάλματα
  const getInputClass = (fieldName) => {
    return showValidationErrors && errors[fieldName] 
      ? "block w-full p-2 border border-red-500 bg-red-50 rounded-md shadow-sm focus:border-red-500 focus:ring focus:ring-red-200" 
      : "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50";
  };

  // Κώδικας για την εμφάνιση μηνύματος σφάλματος
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
            {/* Basic information section */}
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
            </div>

            {/* Building characteristics section */}
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

            {/* Areas and floors section */}
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

            {/* Additional building information section */}
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

            {/* Operation information section */}
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