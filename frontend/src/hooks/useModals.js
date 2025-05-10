import { useState } from 'react';
import $ from 'jquery';

export const useModals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] = useState(false);

  const openProjectModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    $("#projects-wrapper").removeClass("modal-open");
  };

  const openBuildingModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsBuildingModalOpen(true);
  };

  const closeBuildingModal = () => {
    setIsBuildingModalOpen(false);
    $("#projects-wrapper").removeClass("modal-open");
  };

  const openUpdateProjectModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsUpdateProjectModalOpen(true);
  };

  const closeUpdateProjectModal = () => {
    setIsUpdateProjectModalOpen(false);
    $("#projects-wrapper").removeClass("modal-open");
  };
  
  return {
    isModalOpen,
    isBuildingModalOpen,
    isUpdateProjectModalOpen,
    openProjectModal,
    closeProjectModal,
    openBuildingModal,
    closeBuildingModal,
    openUpdateProjectModal,
    closeUpdateProjectModal
  };
};