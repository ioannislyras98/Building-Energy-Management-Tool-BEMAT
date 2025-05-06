import React, { useState } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import InputEntry from "../RegisterForms/InputEntry";
import useLanguage from "../../tools/cookies/language-cookie";
//language
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import "./../../css/forms.css";

const cookies = new Cookies();

function ProjectModalForm({ isOpen, onClose, onProjectCreated, params }) {
  const [projectName, setProjectName] = useState("");
  const [projectElectricityCost, setProjectElectricityCost] = useState(0);
  const [projectFuelCost, setProjectFuelCost] = useState(0);
  const token = cookies.get("token") || "";

  const submitData = (e) => {
    e.preventDefault();
    const settings = {
      url: "http://127.0.0.1:8000/projects/create/",
      method: "POST",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: projectName,
        cost_per_kwh_fuel: projectFuelCost,
        cost_per_kwh_electricity: projectElectricityCost,
      }),
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        setProjectName("");
        setProjectElectricityCost(0);
        setProjectFuelCost(0);
        window.location.reload();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className=" rounded-lg p-6 w-80 border-primary-light border-2 bg-white shadow-lg">
        <form id="create-project-form" onSubmit={submitData}>
          <div>
            <h2 className="text-lg font-bold mb-4 text-center">{params.h2}</h2>
            <InputEntry
              entry={params.projectName}
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              example={params.projectName_example}
              required
            />
            <InputEntry
              entry={params.projectFuelCost}
              id="projectFuelCost"
              type="text"
              value={projectFuelCost}
              onChange={(e) => setProjectFuelCost(e.target.value)}
              example={params.projectFuelCost_example}
              required
            />
            <InputEntry
              entry={params.projectElectricityCost}
              id="projectElectricityCost"
              type="text"
              value={projectElectricityCost}
              onChange={(e) => setProjectElectricityCost(e.target.value)}
              example={params.projectElectricityCost_example}
              required
            />
            <div className="flex justify-between mt-6">
              <button
                type="button"
                id="cancel-project-button"
                onClick={() => {
                  window.location.reload();
                }}
                className="close-modal">
                {params.cancel}
              </button>
              <button
                type="submit"
                id="create-project-button"
                className="confirm-button">
                {params.create}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default function ProjectModal(isOpen, onClose, onProjectCreated) {
  const { language, toggleLanguage } = useLanguage();
  const params =
    cookies.get("language") === "en"
      ? english_text.ProjectModal
      : greek_text.ProjectModal;

  return (
      <div className="form-wrapper">
        <ProjectModalForm
          isOpen={isOpen}
          onClose={onClose}
          onProjectCreated={onProjectCreated}
          params={params}
        />
      </div>
  );
}
