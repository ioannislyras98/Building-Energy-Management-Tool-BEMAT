import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom'; // Import hooks
import "./../css/main.css";
import "./../css/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import ProjectsView from "../components/ProjectsView";
import BuildingsView from "../components/BuildingsView";
import { Modals } from "../components/Modals"; // Assuming Modals is a named export
import { useProjects } from "../hooks/useProjects";
import { useBuildings } from "../hooks/useBuildings";
import { useModals } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const { language } = useLanguage();
  // Renamed params to paramsText to avoid conflict with useParams() from react-router-dom
  const paramsText = language === "en" ? english_text.Home : greek_text.Home;

  const navigate = useNavigate();
  const { projectUuid } = useParams(); // Get projectUuid from URL

  const { 
    projects, 
    loading: projectsLoading, // Assuming useProjects returns a loading state
    handleProjectCreated, 
    handleProjectUpdated, 
    handleDeleteProject,
    updateBuildingCount 
  } = useProjects();
  
  const { 
    buildings, 
    fetchBuildings, 
    handleBuildingCreated: addBuildingToState, // Renamed for clarity
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

  // Effect to set selectedProject based on projectUuid from URL
  // This runs on initial load and when projectUuid changes
  useEffect(() => {
    if (projectUuid && projects.length > 0) {
      const projectFromUrl = projects.find(p => p.uuid === projectUuid);
      setSelectedProject(projectFromUrl || null);
      // If projectUuid is in URL but not found in projects list (and projects are loaded), redirect
      if (!projectFromUrl && !projectsLoading) { 
        console.warn(`Project with UUID ${projectUuid} not found. Redirecting to home.`);
        navigate('/'); 
      }
    } else if (!projectUuid) {
      // If there's no projectUuid in the URL, ensure no project is selected
      setSelectedProject(null);
    }
  }, [projectUuid, projects, navigate, projectsLoading]); // Added projectsLoading

  // Effect to fetch buildings when selectedProject (derived from URL) changes
  useEffect(() => {
    if (selectedProject) {
      fetchBuildings(selectedProject.uuid);
    } else {
      clearBuildings();
    }
  }, [selectedProject, fetchBuildings, clearBuildings]);


  // Event handlers
  const handleProjectClick = (project) => {
    navigate(`/projects/${project.uuid}`);
    setSelectedProject(project); 
  };

  const backToProjects = () => {
    // Navigate to the base URL (project list). 
    // The useEffect will clear selectedProject based on the new URL.
    navigate('/');
  };

  const handleProjectDeleteConfirm = () => { // Renamed to avoid conflict
    if (selectedProject) {
      handleDeleteProject(selectedProject.uuid, paramsText) // Use paramsText
        .then(() => {
          backToProjects(); // Navigate back after successful deletion
        })
        .catch(err => {
          console.error("Error deleting project from Home:", err);
          // Error is already handled by alert in useProjects hook
        });
    }
  };

  const handleProjectUpdateSuccess = (updatedProjectData) => {
    const updatedProjectInList = handleProjectUpdated(updatedProjectData);
    // If the currently selected project is the one updated, update its state
    // This is important if the projects list is updated and we want selectedProject to reflect the latest data
    if (selectedProject && selectedProject.uuid === updatedProjectInList.uuid) {
      setSelectedProject(updatedProjectInList);
    }
  };

  const handleBuildingAdd = (newBuilding) => {
    addBuildingToState(newBuilding); // Use the renamed handler from useBuildings
    if (selectedProject) {
      updateBuildingCount(selectedProject.uuid, true); // Increment count
    }
  };

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        {/* Render based on selectedProject which is now driven by URL */}
        {!selectedProject ? (
          <ProjectsView 
            projects={projects} 
            params={paramsText} // Use paramsText
            onProjectClick={handleProjectClick} 
            onAddProject={openProjectModal}
          />
        ) : (
          <BuildingsView 
            buildings={buildings} 
            selectedProject={selectedProject} 
            params={paramsText} // Use paramsText
            onBackClick={backToProjects}
            // Pass selectedProject to openUpdateProjectModal
            onUpdateProject={() => openUpdateProjectModal(selectedProject)} 
            onDeleteProject={handleProjectDeleteConfirm} // Use renamed handler
            // Pass projectUuid to openBuildingModal
            onAddBuilding={() => openBuildingModal(selectedProject.uuid)} 
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
        // Pass selectedProject only if update modal is open, or based on modal's needs
        selectedProject={isUpdateProjectModalOpen ? selectedProject : null} 
        // Pass projectUuid for building modal if it's open and a project is selected
        projectUuid={isBuildingModalOpen && selectedProject ? selectedProject.uuid : null}
      />
    </>
  );
}