import React from "react";
import { MdOutlineAddCircle, MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import BuildingBtn from "../pages/BuildingBtn";

const BuildingsView = ({
  buildings,
  selectedProject,
  params,
  onBackClick,
  onUpdateProject,
  onDeleteProject,
  onAddBuilding,
}) => {
  return (
    <div className="buildings-view">
      <div className="header-section">
        <div className="flex items-center">
          <button 
            onClick={onBackClick} 
            className="back-button mr-4"
            aria-label={params.backToProjects}
          >
            <MdArrowBack className="mr-1" />
            {params.backToProjects}
          </button>
          <h1 className="page-name">{selectedProject.name}</h1>
        </div>
        
        <div className="flex gap-2 mr-4"> {/* Added mr-4 for right margin */}
          <button 
            onClick={onUpdateProject}
            className="action-button update-button"
            aria-label={params.update}
          >
            <MdEdit size={18} className="mr-4" />
            {params.update}
          </button>
          <button 
            onClick={onDeleteProject}
            className="action-button delete-button"
            aria-label={params.delete}
          >
            <MdDelete size={18} className="mr-1" />
            {params.delete}
          </button>
        </div>
      </div>

      <div className="section-divider">
        <h2 className="section-title">{params.buildings}</h2>
      </div>

      <div className="buildings-grid">
        {/* Add New Building Card */}
        <div
          className="project-card add-project-card" // You can use building-card add-building-card if you have specific styles
          onClick={onAddBuilding}
          style={{ cursor: 'pointer' }} // Ensure it's clear it's clickable
        >
          <div className="flex flex-col items-center justify-center h-full">
            <MdOutlineAddCircle className="text-5xl text-primary mb-2" />
            <span className="text-primary font-medium">{params.addNewBuilding}</span>
          </div>
        </div>

        {/* Existing Buildings */}
        {buildings.length > 0 ? (
          buildings.map((building) => (
            <div 
              key={building.uuid} 
              className="building-card" // Assuming you have a .building-card style
            >
              <BuildingBtn 
                name={building.name} 
                usage={building.usage} 
                date_created={building.date_created} 
              />
            </div>
          ))
        ) : (
          <div className="no-buildings">
            <p>{params.noBuildings || "No buildings found. Click the button above to add a new building."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingsView;