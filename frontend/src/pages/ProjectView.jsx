import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import "./../assets/styles/main.css";
import "./../assets/styles/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import BuildingsView from "../components/BuildingsView";
import { Modals } from "../components/Modals";
import ConfirmationDialog from "../components/dialogs/ConfirmationDialog";
import { useProjects } from "../hooks/useProjects";
import { useBuildings } from "../hooks/useBuildings";
import { useModalBlur } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function ProjectView() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Individual modal state management
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] = useState(false);
  
  // Apply blur effects for each modal
  useModalBlur(isBuildingModalOpen);
  useModalBlur(isUpdateProjectModalOpen);
  
  const { language } = useLanguage();
  const paramsText = language === "en" ? english_text.Home : greek_text.Home;

  const navigate = useNavigate();
  const { projectUuid } = useParams();

  const {
    projects,
    loading: projectsLoading,
    handleProjectUpdated,
    handleDeleteProject,
    updateBuildingCount,
    refreshProjects,
  } = useProjects();
  const {
    buildings,
    fetchBuildings,
    handleBuildingCreated: addBuildingToState,
    clearBuildings,
  } = useBuildings();

  // Modal control functions
  const openBuildingModal = () => setIsBuildingModalOpen(true);
  const closeBuildingModal = () => setIsBuildingModalOpen(false);
  const openUpdateProjectModal = (project) => {
    setSelectedProject(project);
    setIsUpdateProjectModalOpen(true);
  };
  const closeUpdateProjectModal = () => setIsUpdateProjectModalOpen(false);
  useEffect(() => {
    if (projectUuid && projects.length > 0) {
      const projectFromUrl = projects.find((p) => p.uuid === projectUuid);
      setSelectedProject(projectFromUrl || null);
      if (!projectFromUrl && !projectsLoading) {
        console.warn(
          `Project with UUID ${projectUuid} not found. Redirecting to home.`
        );
        navigate("/");
      }
    } else if (!projectUuid) {
      navigate("/");
    }
  }, [projectUuid, projects, navigate, projectsLoading]);

  useEffect(() => {
    if (selectedProject) {
      fetchBuildings(selectedProject.uuid);
    } else {
      clearBuildings();
    }
  }, [selectedProject, fetchBuildings, clearBuildings]);

  const backToProjects = () => {
    navigate("/");
  };

  const handleProjectDeleteConfirm = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.uuid, paramsText)
        .then(() => {
          backToProjects();
          setDeleteDialogOpen(false);
        })
        .catch((err) => {
          console.error("Error deleting project from ProjectView:", err);
          setDeleteDialogOpen(false);
        });
    }
  };

  const handleProjectDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleProjectUpdateSuccess = (updatedProjectData) => {
    const updatedProjectInList = handleProjectUpdated(updatedProjectData);
    if (selectedProject && selectedProject.uuid === updatedProjectInList.uuid) {
      setSelectedProject(updatedProjectInList);
    }
  };

  const handleBuildingAdd = (newBuilding) => {
    addBuildingToState(newBuilding);
    if (selectedProject) {
      updateBuildingCount(selectedProject.uuid, true);
    }
    // Refresh projects to update completion status
    refreshProjects();
  };

  const handleSubmitProject = async () => {
    if (!selectedProject) return;
    
    try {
      const token = cookies.get("token");
      const response = await fetch(`http://127.0.0.1:8000/projects/submit/${selectedProject.uuid}/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Project submitted successfully:", data);
        
        // Update the selected project in state
        const updatedProject = { ...selectedProject, is_submitted: true };
        setSelectedProject(updatedProject);
        
        // Also update in the projects list
        handleProjectUpdated(updatedProject);
        
        // Refresh projects to get updated data
        refreshProjects();
        
        // Show success message
        alert(paramsText?.projectSubmittedSuccess || "Project submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to submit project:", errorData);
        alert(errorData.error || "Failed to submit project");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("An error occurred while submitting the project");
    }
  };

  if (!selectedProject && !projectsLoading) {
    return null; 
  }

  if (projectsLoading) {
    return (
      <div id="projects-wrapper" className="main-container">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        <BuildingsView
          buildings={buildings}
          selectedProject={selectedProject}
          params={paramsText}
          onBackClick={backToProjects}
          onUpdateProject={() => openUpdateProjectModal(selectedProject)}
          onDeleteProject={handleProjectDeleteClick}
          onAddBuilding={() => openBuildingModal()}
          onSubmitProject={handleSubmitProject}
          refreshProjects={refreshProjects}
        />
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleProjectDeleteConfirm}
        title={paramsText?.deleteProjectTitle || "Delete Project"}
        message={
          paramsText?.confirmDelete ||
          "Are you sure you want to delete this project? This action cannot be undone."
        }
        confirmText={paramsText?.deleteButton || "Delete"}
        cancelText={paramsText?.cancelButton || "Cancel"}
        confirmColor="error"
      />

      <Modals
        isModalOpen={false}
        isBuildingModalOpen={isBuildingModalOpen}
        isUpdateProjectModalOpen={isUpdateProjectModalOpen}
        closeProjectModal={() => {}}
        closeBuildingModal={closeBuildingModal}
        closeUpdateProjectModal={closeUpdateProjectModal}
        handleProjectCreated={() => {}}
        handleBuildingCreated={handleBuildingAdd}
        handleProjectUpdated={handleProjectUpdateSuccess}
        selectedProject={isUpdateProjectModalOpen ? selectedProject : null}
        projectUuid={
          isBuildingModalOpen && selectedProject ? selectedProject.uuid : null
        }
      />
    </>
  );
}
