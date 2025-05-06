import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../../css/forms.css";
import useLanguage from "../../tools/cookies/language-cookie";
//language
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntry from "../RegisterForms/InputEntry";

const cookies = new Cookies();

function BuildingModalForm({ isOpen, onClose, onBuildingCreated, projectUuid, params }) {
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
    
    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = params.errorRequired;
    }
    
    if (!formData.usage.trim()) {
      newErrors.usage = params.errorRequired;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = params.errorRequired;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = params.errorRequired;
    }
    
    if (!formData.total_area) {
      newErrors.total_area = params.errorRequired;
    } else if (parseFloat(formData.total_area) <= 0) {
      newErrors.total_area = params.errorPositive;
    }
    
    if (!formData.examined_area) {
      newErrors.examined_area = params.errorRequired;
    } else if (parseFloat(formData.examined_area) <= 0) {
      newErrors.examined_area = params.errorPositive;
    }
    
    if (!formData.floors_examined) {
      newErrors.floors_examined = params.errorRequired;
    } else if (parseInt(formData.floors_examined) <= 0) {
      newErrors.floors_examined = params.errorPositive;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      error: function (error) {
        
        if (error.responseJSON) {
          alert("Error: " + JSON.stringify(error.responseJSON.error));
          setErrors(error.responseJSON.error);
        } else {
          setErrors({ general: params.errorGeneral });
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="rounded-lg p-6 w-full max-w-xl border-primary-light border-2 bg-white shadow-lg flex flex-col max-h-[90vh]">
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
              
              <InputEntry
                entry={
                  <>
                    {params.buildingName} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                example={params.buildingName_example}
                error={errors.name}
                required
              />

              <InputEntry
                entry={
                  <>
                    {params.buildingUsage} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="usage"
                name="usage"
                type="text"
                value={formData.usage}
                onChange={handleChange}
                example={params.buildingUsage_example}
                error={errors.usage}
                required
              />

              <InputEntry
                entry={
                  <>
                    {params.description} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                example={params.description_example}
                error={errors.description}
                required
              />

              <InputEntry
                entry={params.yearBuilt}
                id="year_built"
                name="year_built"
                type="number"
                value={formData.year_built}
                onChange={handleChange}
                example={params.yearBuilt_example}
                error={errors.year_built}
                min="1800"
                max={new Date().getFullYear()}
              />

              <InputEntry
                entry={
                  <>
                    {params.address} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                example={params.address_example}
                error={errors.address}
                required
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
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="false">{params.no}</option>
                  <option value="true">{params.yes}</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="is_certified" className="block text-sm mb-1">{params.isCertified}</label>
                <select
                  id="is_certified"
                  name="is_certified"
                  value={formData.is_certified.toString()}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="false">{params.no}</option>
                  <option value="true">{params.yes}</option>
                </select>
              </div>

              <InputEntry
                entry={params.energyClass}
                id="energy_class"
                name="energy_class"
                type="text"
                value={formData.energy_class}
                onChange={handleChange}
                example={params.energyClass_example}
                error={errors.energy_class}
              />

              <InputEntry
                entry={params.orientation}
                id="orientation"
                name="orientation"
                type="text"
                value={formData.orientation}
                onChange={handleChange}
                example={params.orientation_example}
                error={errors.orientation}
              />
            </div>

            {/* Areas and floors section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.areasAndFloorsSection}</h3>
              
              <InputEntry
                entry={
                  <>
                    {params.totalArea} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="total_area"
                name="total_area"
                type="number"
                value={formData.total_area}
                onChange={handleChange}
                example={params.totalArea_example}
                error={errors.total_area}
                required
                min="0"
                step="0.01"
              />

              <InputEntry
                entry={
                  <>
                    {params.examinedArea} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="examined_area"
                name="examined_area"
                type="number"
                value={formData.examined_area}
                onChange={handleChange}
                example={params.examinedArea_example}
                error={errors.examined_area}
                required
                min="0"
                step="0.01"
              />

              <InputEntry
                entry={
                  <>
                    {params.floorsExamined} <span style={{ color: "red" }}>*</span>
                  </>
                }
                id="floors_examined"
                name="floors_examined"
                type="number"
                value={formData.floors_examined}
                onChange={handleChange}
                example={params.floorsExamined_example}
                error={errors.floors_examined}
                required
                min="1"
              />
              
              <InputEntry
                entry={params.floorHeight}
                id="floor_height"
                name="floor_height"
                type="number"
                value={formData.floor_height}
                onChange={handleChange}
                example={params.floorHeight_example}
                error={errors.floor_height}
                min="0"
                step="0.01"
              />
            </div>

            {/* Additional building information section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">{params.additionalInfoSection}</h3>
              
              <InputEntry
                entry={params.constructionType}
                id="construction_type"
                name="construction_type"
                type="text"
                value={formData.construction_type}
                onChange={handleChange}
                example={params.constructionType_example}
                error={errors.construction_type}
              />
              
              <InputEntry
                entry={params.freeFacades}
                id="free_facades"
                name="free_facades"
                type="number"
                value={formData.free_facades}
                onChange={handleChange}
                example={params.freeFacades_example}
                error={errors.free_facades}
                min="0"
                max="4"
              />
              
              <InputEntry
                entry={params.altitude}
                id="altitude"
                name="altitude"
                type="number"
                value={formData.altitude}
                onChange={handleChange}
                example={params.altitude_example}
                error={errors.altitude}
                min="0"
                step="0.1"
              />
            </div>

            {/* Operation information section */}
            <div>
              <h3 className="font-bold text-primary text-sm mb-3">{params.operationalInfoSection}</h3>
              
              <InputEntry
                entry={params.nonOperatingDays}
                id="non_operating_days"
                name="non_operating_days"
                type="text"
                value={formData.non_operating_days}
                onChange={handleChange}
                example={params.nonOperatingDays_example}
                error={errors.non_operating_days}
              />
              
              <InputEntry
                entry={params.operatingHours}
                id="operating_hours"
                name="operating_hours"
                type="text"
                value={formData.operating_hours}
                onChange={handleChange}
                example={params.operatingHours_example}
                error={errors.operating_hours}
              />
              
              <InputEntry
                entry={params.occupants}
                id="occupants"
                name="occupants"
                type="number"
                value={formData.occupants}
                onChange={handleChange}
                example={params.occupants_example}
                error={errors.occupants}
                min="0"
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
  const { language, toggleLanguage } = useLanguage();
  const params =
    cookies.get("language") === "en"
      ? english_text.BuildingModal
      : greek_text.BuildingModal;

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