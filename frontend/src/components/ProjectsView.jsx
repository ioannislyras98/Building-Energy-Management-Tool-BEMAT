import React from "react";
import { MdOutlineAddCircle } from "react-icons/md";
import ProjectBtn from "./ProjectBtn";

const ProjectsView = ({ projects, params, onProjectClick, onAddProject }) => {
  return (
    <div className="my-projects">
      <div className="header-section">
        <h1 className="page-name">{params.myProjects}</h1>
      </div>

      <div className="projects-grid">
        <div className="project-card add-project-card" onClick={onAddProject}>
          <div className="flex flex-col items-center justify-center h-full">
            <MdOutlineAddCircle className="text-5xl text-primary mb-2" />
            <span className="text-primary font-medium">
              {params.addNewProject}
            </span>
          </div>
        </div>
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.uuid}
              className="project-card"
              onClick={() => onProjectClick(project)}>
              <ProjectBtn
                uuid={project.uuid}
                name={project.name}
                buildings_count={project.buildings_count}
                date_created={project.date_created}
                is_submitted={project.is_submitted}
                completion_status={project.completion_status}
              />
            </div>
          ))
        ) : (
          <div
            className="no-projects"
            style={{ display: projects.length === 0 ? "block" : "none" }}>
            <p>
              {params.noProjects ||
                "No projects found. Click the + card to create a new project."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;
