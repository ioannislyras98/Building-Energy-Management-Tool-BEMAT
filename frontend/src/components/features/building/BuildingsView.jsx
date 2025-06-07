import React from "react";
import {
  MdOutlineAddCircle,
  MdDelete,
  MdEdit,
  MdArrowBack,
} from "react-icons/md";
import BuildingBtn from "../../../pages/BuildingBtn";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import english_text from "../../../languages/english.json";
import greek_text from "../../../languages/greek.json";

const BuildingsView = ({
  buildings,
  selectedProject,
  params,
  onBackClick,
  onUpdateProject,
  onDeleteProject,
  onAddBuilding,
}) => {
  const navigate = useNavigate();

  const handleBuildingClick = (buildingUuid) => {
    if (selectedProject && selectedProject.uuid && buildingUuid) {
      navigate(`/projects/${selectedProject.uuid}/buildings/${buildingUuid}`);
    } else {
      console.error("Missing project or building UUID for navigation");
    }
  };

  const { language } = useLanguage();

  const text =
    language === "en"
      ? english_text.BuildingProfile
      : greek_text.BuildingProfile;

  return (
    <div className="buildings-view">
      <div className="bg-white shadow-xl border-b border-gray-200 backdrop-blur-sm mb-6">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBackClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label={params.backToProjects}>
                <MdArrowBack className="mr-2" size={18} />
                {params.backToProjects}
              </button>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                  {text?.projectLabel || "Project"}
                </span>
                <div className="relative">
                  <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent drop-shadow-sm">
                    {selectedProject.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onUpdateProject}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label={params.update}>
                <MdEdit size={18} className="mr-2" />
                {params.update}
              </button>
              <button
                onClick={onDeleteProject}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                aria-label={params.delete}>
                <MdDelete size={18} className="mr-2" />
                {params.delete}
              </button>
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="px-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {params.buildings}
          </h2>
        </div>

        <div className="buildings-grid">
          <div
            className="project-card add-project-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={onAddBuilding}
            style={{ cursor: "pointer" }}>
            <div className="flex flex-col items-center justify-center h-full">
              <MdOutlineAddCircle className="text-5xl text-primary mb-2" />
              <span className="text-primary font-medium">
                {params.addNewBuilding}
              </span>
            </div>
          </div>

          {buildings.length > 0 ? (
            buildings.map((building) => (
              <div
                key={building.uuid}
                className="building-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleBuildingClick(building.uuid)}
                style={{ cursor: "pointer" }}>
                <BuildingBtn
                  name={building.name}
                  usage={building.usage}
                  date_created={building.date_created}
                />
              </div>
            ))
          ) : (
            <div className="no-buildings">
              <p>
                {params.noBuildings ||
                  "No buildings found. Click the button above to add a new building."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingsView;
