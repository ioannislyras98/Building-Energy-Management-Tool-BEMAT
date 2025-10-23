import React from "react";
import ProjectModal from "../modals/project/ProjectModal";
import BuildingModal from "../modals/building/BuildingModal";
import AddContactModal from "../modals/contact/AddContactModal";
import EditContactModal from "../modals/contact/EditContactModal";

export const Modals = ({
  isModalOpen,
  isBuildingModalOpen,
  isUpdateProjectModalOpen,
  closeProjectModal,
  closeBuildingModal,
  closeUpdateProjectModal,
  handleProjectCreated,
  handleBuildingCreated,
  projectUuid,
  handleProjectUpdated,
  selectedProject,
  isEditBuildingModalOpen,
  closeEditBuildingModal,
  editingBuilding,
  handleBuildingUpdated,
  isAddContactModalOpen,
  closeAddContactModal,
  buildingUuid,
  handleContactCreated,
  isEditContactModalOpen,
  closeEditContactModal,
  currentContact,
  handleContactUpdated,
}) => {
  console.log("Modals - AddContact props:", {
    isAddContactModalOpen,
    buildingUuid,
    shouldRenderModal: isAddContactModalOpen && buildingUuid,
  });

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
          projectUuid={projectUuid}
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

      {isEditBuildingModalOpen && editingBuilding && (
        <BuildingModal
          isOpen={isEditBuildingModalOpen}
          onClose={closeEditBuildingModal}
          onBuildingCreated={handleBuildingUpdated}
          projectUuid={editingBuilding?.project || projectUuid}
          editItem={editingBuilding}
        />
      )}

      {isAddContactModalOpen && (
        <AddContactModal
          isOpen={isAddContactModalOpen}
          onClose={closeAddContactModal}
          buildingUuid={buildingUuid || ""}
          onContactAdded={handleContactCreated}
        />
      )}

      {isEditContactModalOpen && currentContact && (
        <EditContactModal
          isOpen={isEditContactModalOpen}
          onClose={closeEditContactModal}
          contact={currentContact}
          buildingUuid={buildingUuid || ""}
          onContactUpdated={handleContactUpdated}
        />
      )}

      {isAddContactModalOpen &&
        console.log(
          "Modals - Rendering AddContactModal with buildingUuid:",
          buildingUuid
        )}
    </>
  );
};
