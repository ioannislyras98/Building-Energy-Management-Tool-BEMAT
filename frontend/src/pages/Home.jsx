import React, { useState, useEffect } from "react";
import "./../css/main.css";
import "./../css/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import ProjectsView from "../components/ProjectsView";
import BuildingsView from "../components/BuildingsView";
import { Modals } from "../components/Modals";
import { useProjects } from "../hooks/useProjects";
import { useBuildings } from "../hooks/useBuildings";
import { useModals } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  
  const { language } = useLanguage();
  const params = language === "en" ? english_text.Home : greek_text.Home;

  const { 
    projects, 
    handleProjectCreated, 
    handleProjectUpdated, 
    handleDeleteProject,
    updateBuildingCount 
  } = useProjects();
  
  const { 
    buildings, 
    fetchBuildings, 
    handleBuildingCreated,
    clearBuildings 
  } = useBuildings();
  
  const { 
    isModalOpen,
    isBuildingModalOpen,
    isUpdateProjectModalOpen,
    openProjectModal,
    closeProjectModal,
    openBuildingModal,
    closeBuildingModal,
    openUpdateProjectModal,
    closeUpdateProjectModal
  } = useModals();

  // Φόρτωση buildings όταν επιλέγεται ένα project
  useEffect(() => {
    if (selectedProject) {
      fetchBuildings(selectedProject.uuid);
    } else {
      clearBuildings();
    }
  }, [selectedProject]);

  // Event handlers
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const backToProjects = () => {
    setSelectedProject(null);
  };

  const handleProjectDelete = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.uuid, params)
        .then(() => backToProjects());
    }
  };

  const handleProjectUpdateSuccess = (updatedProject) => {
    const updated = handleProjectUpdated(updatedProject);
    setSelectedProject(updated);
  };

  const handleBuildingAdd = (newBuilding) => {
    handleBuildingCreated(newBuilding);
    if (selectedProject) {
      updateBuildingCount(selectedProject.uuid, true);
    }
  };

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        {!selectedProject ? (
          <ProjectsView 
            projects={projects} 
            params={params} 
            onProjectClick={handleProjectClick} 
            onAddProject={openProjectModal}
          />
        ) : (
          <BuildingsView 
            buildings={buildings} 
            selectedProject={selectedProject} 
            params={params}
            onBackClick={backToProjects}
            onUpdateProject={openUpdateProjectModal}
            onDeleteProject={handleProjectDelete}
            onAddBuilding={openBuildingModal}
          />
        )}
      </div>

      <Modals
        isModalOpen={isModalOpen}
        isBuildingModalOpen={isBuildingModalOpen}
        isUpdateProjectModalOpen={isUpdateProjectModalOpen}
        closeProjectModal={closeProjectModal}
        closeBuildingModal={closeBuildingModal}
        closeUpdateProjectModal={closeUpdateProjectModal}
        handleProjectCreated={handleProjectCreated}
        handleBuildingCreated={handleBuildingAdd}
        handleProjectUpdated={handleProjectUpdateSuccess}
        selectedProject={selectedProject}
      />
    </>
  );
}