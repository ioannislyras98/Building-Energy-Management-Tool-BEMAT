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
  // Apply blur effect when modal is open
  useModalBlur(isOpen);
  const { refreshSidebar } = useSidebar();

  const [formData, setFormData] = useState(
    isEditMode && project
      ? {
          name: project.name,
          cost_per_kwh_fuel: project.cost_per_kwh_fuel || "",
          cost_per_kwh_electricity: project.cost_per_kwh_electricity || "",
        }
      : {
          name: "",
          cost_per_kwh_fuel: "",
          cost_per_kwh_electricity: "",
        }
  );

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
        cost_per_kwh_fuel: formData.cost_per_kwh_fuel,
        cost_per_kwh_electricity: formData.cost_per_kwh_electricity,
      }),
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        setFormData({
          name: "",
          cost_per_kwh_fuel: "",
          cost_per_kwh_electricity: "",
        });
        if (isEditMode) {
          onProjectUpdated(response);
        } else {
          onProjectCreated(response);
        }
        refreshSidebar(); // Refresh sidebar after project creation/update
        onClose();
      })
      .fail(function (error) {
        if (error.responseJSON) {
          console.error("Error message:", error.responseJSON);
          alert("Error: " + JSON.stringify(error.responseJSON.error));
        } else {
          console.error(error);
        }
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-80 border-primary-light border-2 bg-white shadow-lg">
        <form id="project-form" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-bold mb-4 text-center">{params.h2}</h2>
            <InputEntry
              entry={params.projectName}
              id="projectName"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              example={params.projectName_example}
              required
            />
            <InputEntry
              entry={params.projectFuelCost}
              id="projectFuelCost"
              type="text"
              value={formData.cost_per_kwh_fuel}
              onChange={(e) =>
                setFormData({ ...formData, cost_per_kwh_fuel: e.target.value })
              }
              example={params.projectFuelCost_example}
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
            <div className="flex justify-between mt-6">
              <button
                type="button"
                id="cancel-project-button"
                onClick={() => {
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
