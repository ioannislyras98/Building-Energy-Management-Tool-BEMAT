import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../../assets/styles/forms.css";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";

const cookies = new Cookies();

const PREFECTURE_TO_ZONE = {
  Ηρακλείου: "A",
  Χανίων: "A",
  Ρεθύμνου: "A",
  Λασιθίου: "A",
  Κυκλάδων: "A",
  Δωδεκανήσου: "A",
  Σάμου: "A",
  Μεσσηνίας: "A",
  Λακωνίας: "A",
  Αργολίδας: "A",
  Αρκαδίας: "A",
  Κορινθίας: "A",
  Αχαΐας: "A",
  Ηλείας: "A",
  Αιτωλοακαρνανίας: "B",
  Φθιώτιδας: "B",
  Φωκίδας: "B",
  Βοιωτίας: "B",
  Εύβοιας: "B",
  Μαγνησίας: "B",
  Λέσβου: "B",
  Χίου: "B",
  Κέρκυρας: "B",
  Λευκάδας: "B",
  Θεσπρωτίας: "B",
  Πρέβεζας: "B",
  Άρτας: "B",
  Ιωαννίνων: "B",
  Τρικάλων: "B",
  Καρδίτσας: "B",
  Λαρίσης: "B",
  Πιερίας: "B",
  Ημαθίας: "B",
  Πέλλας: "B",
  Θεσσαλονίκης: "C",
  Αττικής: "B",
  Κιλκίς: "C",
  Χαλκιδικής: "C",
  "Σερρών (ΒΑ τμήμα)": "C",
  Καβάλας: "C",
  Ξάνθης: "C",
  Ροδόπης: "C",
  Έβρου: "C",
  Γρεβενών: "D",
  Κοζάνης: "D",
  Καστοριάς: "D",
  Φλώρινας: "D",
  "Σερρών (εκτός ΒΑ τμήματος)": "D",
  Δράμας: "D",
};

const ALL_PREFECTURES = Object.keys(PREFECTURE_TO_ZONE).sort();

function EditBuildingModalForm({
  isOpen,
  onClose,
  onBuildingUpdated,
  building,
  params,
}) {
  const [formData, setFormData] = useState({
    name: "",
    usage: "",
    description: "",
    year_built: "",
    address: "",
    prefecture: "",
    energy_zone: "",
    is_insulated: false,
    is_certified: false,
    energy_class: "",
    orientation: "",
    total_area: "",
    examined_area: "",
    floors_examined: "1",
    floor_height: "",
    construction_type: "",
    free_facades: "",
    altitude: "",
    non_operating_days: "",
    operating_hours: "",
    occupants: "",
  });
  const [errors, setErrors] = useState({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const token = cookies.get("token") || "";
  useEffect(() => {
    if (building) {
      setFormData({
        name: building.data.name || "",
        usage: building.data.usage || "",
        description: building.data.description || "",
        year_built: building.data.year_built || "",
        address: building.data.address || "",
        prefecture: building.data.prefecture || "",
        energy_zone: building.data.energy_zone || "",
        is_insulated: building.data.is_insulated || false,
        is_certified: building.data.is_certified || false,
        energy_class: building.data.energy_class || "",
        orientation: building.data.orientation || "",
        total_area: building.data.total_area || "",
        examined_area: building.data.examined_area || "",
        floors_examined: building.data.floors_examined || "1",
        floor_height: building.data.floor_height || "",
        construction_type: building.data.construction_type || "",
        free_facades: building.data.free_facades || "",
        altitude: building.data.altitude || "",
        non_operating_days: building.data.non_operating_days || "",
        operating_hours: building.data.operating_hours || "",
        occupants: building.data.occupants || "",
      });
    }
  }, [building]);

  useEffect(() => {
    if (formData.prefecture) {
      const zone = PREFECTURE_TO_ZONE[formData.prefecture] || "";
      setFormData((prevState) => ({
        ...prevState,
        energy_zone: zone,
      }));
    }
  }, [formData.prefecture]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newFormData = { ...formData };

    if (type === "checkbox") {
      newFormData[id] = checked;
    } else if (id === "is_insulated" || id === "is_certified") {
      newFormData[id] = value === "true";
    } else {
      newFormData[id] = value;
    }
    setFormData(newFormData);

    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;
    if (!formData.name?.trim()) {
      newErrors.name = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    if (!formData.address?.trim()) {
      newErrors.address = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    if (!formData.prefecture) {
      newErrors.prefecture = params.errorRequired || "Field is required";
      hasErrors = true;
    }
    setErrors(newErrors);
    setShowValidationErrors(true);
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const buildingData = { ...formData };
    const decimalFields = [
      "total_area",
      "examined_area",
      "floor_height",
      "altitude",
    ];
    decimalFields.forEach((field) => {
      if (buildingData[field] === "") buildingData[field] = null;
      else if (buildingData[field] != null)
        buildingData[field] = Number(buildingData[field]);
    });
    const integerFields = [
      "year_built",
      "floors_examined",
      "free_facades",
      "occupants",
    ];
    integerFields.forEach((field) => {
      if (buildingData[field] === "") buildingData[field] = null;
      else if (buildingData[field] != null)
        buildingData[field] = parseInt(buildingData[field], 10);
    });

    $.ajax({
      url: `http://127.0.0.1:8000/buildings/update/${building.data.uuid}/`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      data: JSON.stringify(buildingData),
      success: function (response) {
        onBuildingUpdated(response);
        onClose();
      },
      error: function (error) {
        setShowValidationErrors(true);
        if (error.responseJSON && error.responseJSON.error) {
          setErrors(error.responseJSON.error);
        } else {
          setErrors({ general: params.errorGeneral || "An error occurred." });
        }
      },
    });
  };

  if (!isOpen) return null;
  const getInputClass = (fieldName) =>
    `input-field ${
      showValidationErrors && errors[fieldName] ? "error-input" : ""
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 py-10">
      <div className="rounded-lg p-6 w-full max-w-xl border-primary-light border-2 bg-white shadow-lg flex flex-col max-h-[90vh]">
        <h2 className="text-lg font-bold mb-2 text-center sticky top-0 bg-white pb-2 z-10">
          {params.h2}
        </h2>
        {params.requiredFieldsNote && (
          <p className="text-sm text-gray-500 text-center mb-4 sticky top-8 bg-white z-10">
            <span className="text-red-500">*</span> {params.requiredFieldsNote}
          </p>
        )}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {errors.general}
          </div>
        )}

        <div className="overflow-y-auto flex-grow pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">
                {params.basicInfoSection}
              </h3>
              <InputEntryModal
                entry={params.buildingName}
                id="name"
                value={formData.name}
                onChange={handleChange}
                example={params.buildingName_example}
                error={errors.name}
                className={getInputClass("name")}
                required
              />
              <InputEntryModal
                entry={params.usage}
                id="usage"
                type="select"
                value={formData.usage}
                onChange={handleChange}
                options={params.usageOptions || []}
                error={errors.usage}
                className={getInputClass("usage")}
                required
              />
              <InputEntryModal
                entry={params.description}
                id="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                example={params.description_example}
                error={errors.description}
                className={getInputClass("description")}
                required
              />
              <InputEntryModal
                entry={params.yearBuilt}
                id="year_built"
                type="number"
                value={formData.year_built}
                onChange={handleChange}
                example={params.yearBuilt_example}
                error={errors.year_built}
                className={getInputClass("year_built")}
                min="1800"
                max={new Date().getFullYear()}
              />{" "}
              <InputEntryModal
                entry={params.address}
                id="address"
                value={formData.address}
                onChange={handleChange}
                example={params.address_example}
                error={errors.address}
                className={getInputClass("address")}
                required
              />
              <InputEntryModal
                entry={params.prefecture}
                id="prefecture"
                type="select"
                value={formData.prefecture}
                onChange={handleChange}
                example={params.selectPrefecture}
                options={ALL_PREFECTURES.map((prefecture) => ({
                  value: prefecture,
                  label: prefecture,
                }))}
                error={errors.prefecture}
                className={getInputClass("prefecture")}
                required
              />
              <InputEntryModal
                entry={params.energyZone}
                id="energy_zone"
                value={formData.energy_zone}
                onChange={handleChange}
                error={errors.energy_zone}
                className="block w-full p-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm cursor-not-allowed"
                readOnly
                disabled
              />
            </div>{" "}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">
                {params.buildingCharacteristicsSection}
              </h3>
              <InputEntryModal
                entry={params.constructionType}
                id="construction_type"
                type="select"
                value={formData.construction_type}
                onChange={handleChange}
                options={params.constructionTypeOptions || []}
                error={errors.construction_type}
                className={getInputClass("construction_type")}
              />
              <InputEntryModal
                entry={params.isInsulated}
                id="is_insulated"
                type="select"
                value={formData.is_insulated.toString()}
                onChange={handleChange}
                options={[
                  { value: "false", label: params.no },
                  { value: "true", label: params.yes },
                ]}
                error={errors.is_insulated}
                className={getInputClass("is_insulated")}
              />{" "}
              <InputEntryModal
                entry={params.isCertified}
                id="is_certified"
                type="select"
                value={formData.is_certified.toString()}
                onChange={handleChange}
                options={[
                  { value: "false", label: params.no },
                  { value: "true", label: params.yes },
                ]}
                error={errors.is_certified}
                className={getInputClass("is_certified")}
              />
              {formData.is_certified && (
                <InputEntryModal
                  entry={params.energyClass}
                  id="energy_class"
                  type="select"
                  value={formData.energy_class}
                  onChange={handleChange}
                  options={params.energyClassOptions || []}
                  error={errors.energy_class}
                  className={getInputClass("energy_class")}
                />
              )}
              <InputEntryModal
                entry={params.orientation}
                id="orientation"
                value={formData.orientation}
                onChange={handleChange}
                example={params.orientation_example}
                error={errors.orientation}
                className={getInputClass("orientation")}
              />
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">
                {params.areasAndFloorsSection}
              </h3>
              <InputEntryModal
                entry={params.totalArea}
                id="total_area"
                type="number"
                value={formData.total_area}
                onChange={handleChange}
                example={params.totalArea_example}
                error={errors.total_area}
                className={getInputClass("total_area")}
                step="0.01"
                required
              />
              <InputEntryModal
                entry={params.examinedArea}
                id="examined_area"
                type="number"
                value={formData.examined_area}
                onChange={handleChange}
                example={params.examinedArea_example}
                error={errors.examined_area}
                className={getInputClass("examined_area")}
                step="0.01"
                required
              />
              <InputEntryModal
                entry={params.floorsExamined}
                id="floors_examined"
                type="number"
                value={formData.floors_examined}
                onChange={handleChange}
                example={params.floorsExamined_example}
                error={errors.floors_examined}
                className={getInputClass("floors_examined")}
                min="1"
                required
              />
              <InputEntryModal
                entry={params.floorHeight}
                id="floor_height"
                type="number"
                value={formData.floor_height}
                onChange={handleChange}
                example={params.floorHeight_example}
                error={errors.floor_height}
                className={getInputClass("floor_height")}
                step="0.01"
              />
              <InputEntryModal
                entry={params.freeFacades}
                id="free_facades"
                type="number"
                value={formData.free_facades}
                onChange={handleChange}
                example={params.freeFacades_example}
                error={errors.free_facades}
                className={getInputClass("free_facades")}
                min="0"
                max="4"
              />
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">
                {params.additionalInfoSection}
              </h3>
              <InputEntryModal
                entry={params.altitude}
                id="altitude"
                type="number"
                value={formData.altitude}
                onChange={handleChange}
                example={params.altitude_example}
                error={errors.altitude}
                className={getInputClass("altitude")}
                step="0.01"
              />
            </div>
            <div className="pb-4">
              <h3 className="font-bold text-primary text-sm mb-3">
                {params.operationalInfoSection}
              </h3>
              <InputEntryModal
                entry={params.nonOperatingDays}
                id="non_operating_days"
                type="text"
                value={formData.non_operating_days}
                onChange={handleChange}
                example={params.nonOperatingDays_example}
                error={errors.non_operating_days}
                className={getInputClass("non_operating_days")}
              />
              <InputEntryModal
                entry={params.operatingHours}
                id="operating_hours"
                type="text"
                value={formData.operating_hours}
                onChange={handleChange}
                example={params.operatingHours_example}
                error={errors.operating_hours}
                className={getInputClass("operating_hours")}
              />
              <InputEntryModal
                entry={params.occupants}
                id="occupants"
                type="number"
                value={formData.occupants}
                onChange={handleChange}
                example={params.occupants_example}
                error={errors.occupants}
                className={getInputClass("occupants")}
                min="0"
              />
            </div>
          </form>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <button type="button" onClick={onClose} className="close-modal">
            {params.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="confirm-button">
            {params.updateBuilding}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditBuildingModal({
  isOpen,
  onClose,
  onBuildingUpdated,
  building,
}) {
  const { language } = useLanguage();
  const params =
    language === "en"
      ? english_text.EditBuildingModal
      : greek_text.EditBuildingModal;

  return (
    <EditBuildingModalForm
      isOpen={isOpen}
      onClose={onClose}
      onBuildingUpdated={onBuildingUpdated}
      building={building}
      params={params || {}}
    />
  );
}
