import React, { useState } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import InputEntry from "../../pages/auth/InputEntry";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import { useSidebar } from "../../context/SidebarContext";
import API_BASE_URL from "../../config/api.js";

import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import "./../../assets/styles/forms.css";

const cookies = new Cookies();

function ProjectModalForm({
  isOpen,
  onClose,
  onProjectCreated,
  onProjectUpdated,
  project,
  isEditMode,
  params,
}) {
  useModalBlur(isOpen);
  const { refreshSidebar } = useSidebar();

  const [formData, setFormData] = useState(
    isEditMode && project
      ? {
          name: project.name,
          cost_per_kwh_electricity: project.cost_per_kwh_electricity || "",
          oil_price_per_liter: project.oil_price_per_liter || "",
          natural_gas_price_per_m3: project.natural_gas_price_per_m3 || "",
          biomass_price_per_kg: project.biomass_price_per_kg || "",
        }
      : {
          name: "",
          cost_per_kwh_electricity: "",
          oil_price_per_liter: "",
          natural_gas_price_per_m3: "",
          biomass_price_per_kg: "",
        }
  );

  const [errorMessage, setErrorMessage] = useState("");

  const token = cookies.get("token") || "";

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isEditMode
      ? `${API_BASE_URL}/projects/update/${project.uuid}/`
      : `${API_BASE_URL}/projects/create/`;

    const method = isEditMode ? "PUT" : "POST";

    const settings = {
      url: url,
      method: method,
      timeout: 0,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: formData.name,
        cost_per_kwh_electricity: formData.cost_per_kwh_electricity,
        oil_price_per_liter: formData.oil_price_per_liter || null,
        natural_gas_price_per_m3: formData.natural_gas_price_per_m3,
        biomass_price_per_kg: formData.biomass_price_per_kg || null,
      }),
    };

    $.ajax(settings)
      .done(function (response) {
        setErrorMessage("");
        setFormData({
          name: "",
          cost_per_kwh_electricity: "",
          oil_price_per_liter: "",
          natural_gas_price_per_m3: "",
          biomass_price_per_kg: "",
        });
        if (isEditMode) {
          onProjectUpdated(response);
        } else {
          onProjectCreated(response);
        }
        refreshSidebar(); 
        onClose();
      })
      .fail(function (error) {
        if (error.responseJSON && error.responseJSON.error) {
          const errorMsg = error.responseJSON.error;
          // Check if it's a duplicate name error
          if (errorMsg.includes("already exists") || errorMsg.includes("υπάρχει ήδη")) {
            setErrorMessage(params.errorDuplicateName);
          } else {
            setErrorMessage(errorMsg);
          }
        } else if (error.responseJSON && error.responseJSON.message) {
          const errorMsg = error.responseJSON.message;
          // Check if it's a duplicate name error
          if (errorMsg.includes("already exists") || errorMsg.includes("υπάρχει ήδη")) {
            setErrorMessage(params.errorDuplicateName);
          } else {
            setErrorMessage(errorMsg);
          }
        } else {
          setErrorMessage(params.errorGeneral);
        }
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-80 border-primary-light border-2 bg-white shadow-lg">
        <form id="project-form" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-bold mb-4 text-center">
              {isEditMode ? params.h2_edit : params.h2}
            </h2>
            <InputEntry
              entry={params.projectName}
              id="projectName"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
              example={params.projectName_example}
              required
            />
            <InputEntry
              entry={params.projectElectricityCost}
              id="projectElectricityCost"
              type="text"
              value={formData.cost_per_kwh_electricity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_per_kwh_electricity: e.target.value,
                })
              }
              example={params.projectElectricityCost_example}
              required
            />
            <InputEntry
              entry={params.oilPricePerLiter || "Τιμή πετρελαίου (€/λίτρο)"}
              id="oilPricePerLiter"
              type="text"
              value={formData.oil_price_per_liter}
              onChange={(e) =>
                setFormData({ ...formData, oil_price_per_liter: e.target.value })
              }
              example={params.oilPricePerLiter_example || "1.200"}
              required
            />
            <InputEntry
              entry={params.naturalGasPricePerM3 || "Τιμή φυσικού αερίου (€/m³)"}
              id="naturalGasPricePerM3"
              type="text"
              value={formData.natural_gas_price_per_m3}
              onChange={(e) =>
                setFormData({ ...formData, natural_gas_price_per_m3: e.target.value })
              }
              example={params.naturalGasPricePerM3_example || "0.800"}
              required
            />
            <InputEntry
              entry={params.biomassPricePerKg || "Τιμή βιομάζας (€/kg)"}
              id="biomassPricePerKg"
              type="text"
              value={formData.biomass_price_per_kg}
              onChange={(e) =>
                setFormData({ ...formData, biomass_price_per_kg: e.target.value })
              }
              example={params.biomassPricePerKg_example || "0.250"}
              required={false}
            />
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                id="cancel-project-button"
                onClick={() => {
                  setErrorMessage("");
                  onClose();
                }}
                className="close-modal">
                {params.cancel}
              </button>
              <button
                type="submit"
                id="submit-project-button"
                className="confirm-button">
                {isEditMode ? params.updateProject : params.createProject}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  onProjectUpdated,
  project,
  isEditMode,
}) {
  const { language } = useLanguage();
  const params =
    language === "en" ? english_text.ProjectModal : greek_text.ProjectModal;

  return (
    <ProjectModalForm
      isOpen={isOpen}
      onClose={onClose}
      onProjectCreated={onProjectCreated}
      onProjectUpdated={onProjectUpdated}
      project={project}
      isEditMode={isEditMode}
      params={params}
    />
  );
}
