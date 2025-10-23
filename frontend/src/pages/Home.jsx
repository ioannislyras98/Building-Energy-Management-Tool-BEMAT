import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../assets/styles/main.css";
import "./../assets/styles/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import ProjectsView from "../components/ProjectsView";
import { Modals } from "../components/Modals";
import { useProjects } from "../hooks/useProjects";
import { useModalBlur } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export default function Home() {
  const { language } = useLanguage();
  const paramsText = language === "en" ? english_text.Home : greek_text.Home;

  const navigate = useNavigate();

  const { projects, handleProjectCreated, refreshProjects } = useProjects();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  useModalBlur(isProjectModalOpen);

  const openProjectModal = () => setIsProjectModalOpen(true);
  const closeProjectModal = () => setIsProjectModalOpen(false);

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.uuid}`);
  };

  const handleProjectCreatedWithRefresh = (newProject) => {
    handleProjectCreated(newProject);
    refreshProjects();
  };

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        <ProjectsView
          projects={projects}
          params={paramsText}
          onProjectClick={handleProjectClick}
          onAddProject={openProjectModal}
        />
      </div>

      <Modals
        isModalOpen={isProjectModalOpen}
        isBuildingModalOpen={false}
        isUpdateProjectModalOpen={false}
        closeProjectModal={closeProjectModal}
        closeBuildingModal={() => {}}
        closeUpdateProjectModal={() => {}}
        handleProjectCreated={handleProjectCreatedWithRefresh}
        handleBuildingCreated={() => {}}
        handleProjectUpdated={() => {}}
        selectedProject={null}
        projectUuid={null}
      />
    </>
  );
}
