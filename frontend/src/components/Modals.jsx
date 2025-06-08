import React from "react";
import ProjectModal from "../modals/project/ProjectModal";
import BuildingModal from "../modals/building/BuildingModal";
import EditBuildingModal from "../modals/building/EditBuildingModal";
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
  // Props for EditBuildingModal
  isEditBuildingModalOpen,
  closeEditBuildingModal,
  editingBuilding,
  handleBuildingUpdated,
  // Props for AddContactModal
  isAddContactModalOpen,
  closeAddContactModal,
  targetBuildingUuidForContact,
  handleContactAdded,
  // Props for EditContactModal
  isEditContactModalOpen,
  closeEditContactModal,
  currentContact,
  handleContactUpdated,
}) => {
  console.log("Modals - AddContact props:", {
    isAddContactModalOpen,
    targetBuildingUuidForContact,
    shouldRenderModal: isAddContactModalOpen && targetBuildingUuidForContact,
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
        <EditBuildingModal
          isOpen={isEditBuildingModalOpen}
          onClose={closeEditBuildingModal}
          building={editingBuilding}
          onBuildingUpdated={handleBuildingUpdated}
        />
      )}

      {isAddContactModalOpen && (
        <AddContactModal
          isOpen={isAddContactModalOpen}
          onClose={closeAddContactModal}
          buildingUuid={targetBuildingUuidForContact || ""}
          onContactAdded={handleContactAdded}
        />
      )}

      {isEditContactModalOpen && currentContact && (
        <EditContactModal
          isOpen={isEditContactModalOpen}
          onClose={closeEditContactModal}
          contact={currentContact}
          buildingUuid={targetBuildingUuidForContact || ""}
          onContactUpdated={handleContactUpdated}
        />
      )}

      {/* Debug: Log when AddContactModal should render */}
      {isAddContactModalOpen &&
        console.log(
          "Modals - Rendering AddContactModal with buildingUuid:",
          targetBuildingUuidForContact
        )}
    </>
  );
};
