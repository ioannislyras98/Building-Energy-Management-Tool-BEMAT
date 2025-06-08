import React from "react";
import { useNavigate } from "react-router-dom";
import "./../assets/styles/main.css";
import "./../assets/styles/my_projects.css";
import { useLanguage } from "../context/LanguageContext";
import ProjectsView from "../components/ProjectsView";
import { Modals } from "../components/Modals";
import { useProjects } from "../hooks/useProjects";
import { useModals } from "../hooks/useModals";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export default function Home() {
  const { language } = useLanguage();
  const paramsText = language === "en" ? english_text.Home : greek_text.Home;

  const navigate = useNavigate();

  const { projects, handleProjectCreated } = useProjects();

  const { isModalOpen, openProjectModal, closeProjectModal } = useModals();

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.uuid}`);
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
        isModalOpen={isModalOpen}
        isBuildingModalOpen={false}
        isUpdateProjectModalOpen={false}
        closeProjectModal={closeProjectModal}
        closeBuildingModal={() => {}}
        closeUpdateProjectModal={() => {}}
        handleProjectCreated={handleProjectCreated}
        handleBuildingCreated={() => {}}
        handleProjectUpdated={() => {}}
        selectedProject={null}
        projectUuid={null}
      />
    </>
  );
}
