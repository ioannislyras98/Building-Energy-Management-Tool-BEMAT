import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../css/main.css";
import "./../css/my_projects.css";
import ProjectBtn from "./ProjectBtn";
import { MdOutlineAddCircle } from "react-icons/md";
import ProjectModal from "./modals/ProjectModal.jsx";
// You'll need to create this component for buildings
import BuildingBtn from "./BuildingBtn.jsx";
// You'll need to create this modal for adding buildings
import BuildingModal from "./modals/BuildingModal.jsx";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("token") || "";

  useEffect(() => {
    const settings = {
      url: "http://127.0.0.1:8000/projects/get/",
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        const projectsArray = Array.isArray(response)
          ? response
          : response.projects || response.data || [];
        setProjects(projectsArray);
      })
      .fail(function (error) {
        console.error(error);
      });
  }, [token]);

  // Fetch buildings when a project is selected
  useEffect(() => {
    if (selectedProject) {
      const settings = {
        url: `http://127.0.0.1:8000/buildings/get/?project=${selectedProject.uuid}`,
        method: "GET",
        timeout: 0,
        headers: {
          Authorization: `token ${token}`,
        },
      };

      $.ajax(settings)
        .done(function (response) {
          console.log("Buildings:", response);
          const buildingsArray = Array.isArray(response)
            ? response
            : response.buildings || response.data || [];
          setBuildings(buildingsArray);
        })
        .fail(function (error) {
          console.error("Failed to fetch buildings:", error);
        });
    } else {
      setBuildings([]);
    }
  }, [selectedProject, token]);

  // Callback to add the newly created project to our list
  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  // Callback to add the newly created building to our list
  const handleBuildingCreated = (newBuilding) => {
    setBuildings((prevBuildings) => [...prevBuildings, newBuilding]);
    // Update the building count of the selected project
    if (selectedProject) {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.uuid === selectedProject.uuid
            ? { ...project, buildings_count: project.buildings_count + 1 }
            : project
        )
      );
    }
  };

  // Handle project selection
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  // Handle back to projects view
  const backToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        {!selectedProject ? (
          // Projects view
          <>
            <h1 className="page-name">My Projects</h1>
            <ul id="my-projects-container">
              <li id="add-project-button-container" className="text-center">
                <div
                  id="addProjectBtn"
                  className="project-icon drop-shadow-[0_5px_15px_rgba(53,_94,_59,_0.25)] cursor-pointer"
                  onClick={() => {
                    $("#projects-wrapper").addClass("modal-open");
                    setIsModalOpen(true);
                  }}
                >
                  <MdOutlineAddCircle className="p-icon text-primary-light" />
                </div>
                <div>
                  <label className="font-bold text-primary-light">
                    Add New Project
                  </label>
                </div>
              </li>
              {projects.map((project) => (
                <li 
                  key={project.uuid} 
                  onClick={() => handleProjectClick(project)}
                >
                  <ProjectBtn
                    name={project.name}
                    buildings_count={project.buildings_count}
                    date_created={project.date_created}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          // Buildings view for selected project
          <>
            <div className="flex items-center mb-4">
              <button 
                onClick={backToProjects} 
                className="mr-4 text-primary hover:text-primary-bold"
              >
                ← Back to Projects
              </button>
              <h1 className="page-name">{selectedProject.name} - Buildings</h1>
            </div>
            <ul id="my-projects-container">
              <li id="add-project-button-container" className="text-center">
                <div
                  id="addProjectBtn"
                  className="project-icon drop-shadow-[0_5px_15px_rgba(53,_94,_59,_0.25)] cursor-pointer"
                  onClick={() => {
                    $("#projects-wrapper").addClass("modal-open");
                    setIsBuildingModalOpen(true);
                  }}
                >
                  <MdOutlineAddCircle className="p-icon text-primary-light" />
                </div>
                <div>
                  <label className="font-bold text-primary-light">
                    Add New Building
                  </label>
                </div>
              </li>
              {buildings.map((building) => (
                <li key={building.uuid}>
                  <BuildingBtn
                    name={building.name}
                    usage={building.usage}
                    total_area={building.total_area}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            $("#projects-wrapper").removeClass("modal-open");
          }}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {isBuildingModalOpen && (
        <BuildingModal
          isOpen={isBuildingModalOpen}
          onClose={() => {
            setIsBuildingModalOpen(false);
            $("#projects-wrapper").removeClass("modal-open");
          }}
          onBuildingCreated={handleBuildingCreated}
          projectUuid={selectedProject?.uuid}
        />
      )}
    </>
  );
}