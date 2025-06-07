import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./../css/main.css";
import "./../css/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import ProjectsView from "../components/ProjectsView";
import BuildingsView from "../components/BuildingsView";
import { Modals } from "../components/Modals";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useProjects } from "../hooks/useProjects";
import { useBuildings } from "../hooks/useBuildings";
import { useModals } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { language } = useLanguage();
  const paramsText = language === "en" ? english_text.Home : greek_text.Home;

  const navigate = useNavigate();
  const { projectUuid } = useParams();

  const {
    projects,
    loading: projectsLoading,
    handleProjectCreated,
    handleProjectUpdated,
    handleDeleteProject,
    updateBuildingCount,
  } = useProjects();

  const {
    buildings,
    fetchBuildings,
    handleBuildingCreated: addBuildingToState,
    clearBuildings,
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
    closeUpdateProjectModal,
  } = useModals();

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
      setSelectedProject(null);
    }
  }, [projectUuid, projects, navigate, projectsLoading]);

  useEffect(() => {
    if (selectedProject) {
      fetchBuildings(selectedProject.uuid);
    } else {
      clearBuildings();
    }
  }, [selectedProject, fetchBuildings, clearBuildings]);

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.uuid}`);
    setSelectedProject(project);
  };

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
          console.error("Error deleting project from Home:", err);
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
  };

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        {!selectedProject ? (
          <ProjectsView
            projects={projects}
            params={paramsText}
            onProjectClick={handleProjectClick}
            onAddProject={openProjectModal}
          />
        ) : (
          <BuildingsView
            buildings={buildings}
            selectedProject={selectedProject}
            params={paramsText}
            onBackClick={backToProjects}
            onUpdateProject={() => openUpdateProjectModal(selectedProject)}
            onDeleteProject={handleProjectDeleteClick}
            onAddBuilding={() => openBuildingModal(selectedProject.uuid)}
          />
        )}
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
        isModalOpen={isModalOpen}
        isBuildingModalOpen={isBuildingModalOpen}
        isUpdateProjectModalOpen={isUpdateProjectModalOpen}
        closeProjectModal={closeProjectModal}
        closeBuildingModal={closeBuildingModal}
        closeUpdateProjectModal={closeUpdateProjectModal}
        handleProjectCreated={handleProjectCreated}
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
