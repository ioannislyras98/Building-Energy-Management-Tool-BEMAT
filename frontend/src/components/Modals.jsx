import React from 'react';
import ProjectModal from '../modals/ProjectModal';
import BuildingModal from '../modals/BuildingModal';

export const Modals = ({ 
  isModalOpen,
  isBuildingModalOpen,
  isUpdateProjectModalOpen,
  closeProjectModal,
  closeBuildingModal,
  closeUpdateProjectModal,
  handleProjectCreated,
  handleBuildingCreated,
  handleProjectUpdated,
  selectedProject
}) => {
  return (
    <>
      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          onClose={closeProjectModal}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {isBuildingModalOpen && (
        <BuildingModal
          isOpen={isBuildingModalOpen}
          onClose={closeBuildingModal}
          onBuildingCreated={handleBuildingCreated}
          projectUuid={selectedProject?.uuid}
        />
      )}

      {isUpdateProjectModalOpen && (
        <ProjectModal
          isOpen={isUpdateProjectModalOpen}
          onClose={closeUpdateProjectModal}
          onProjectUpdated={handleProjectUpdated}
          project={selectedProject}
          isEditMode={true}
        />
      )}
    </>
  );
};