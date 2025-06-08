import { useState } from "react";
import $ from "jquery";

export const useModals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] =
    useState(false);
  const [isEditBuildingModalOpen, setIsEditBuildingModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);

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

  const openEditBuildingModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsEditBuildingModalOpen(true);
  };

  const closeEditBuildingModal = () => {
    setIsEditBuildingModalOpen(false);
    $("#projects-wrapper").removeClass("modal-open");
  };

  const openAddContactModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsAddContactModalOpen(true);
  };

  const closeAddContactModal = () => {
    setIsAddContactModalOpen(false);
    $("#projects-wrapper").removeClass("modal-open");
  };

  const openEditContactModal = () => {
    $("#projects-wrapper").addClass("modal-open");
    setIsEditContactModalOpen(true);
  };

  const closeEditContactModal = () => {
    setIsEditContactModalOpen(false);
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
    closeUpdateProjectModal,
    isEditBuildingModalOpen,
    openEditBuildingModal,
    closeEditBuildingModal,
    isAddContactModalOpen,
    openAddContactModal,
    closeAddContactModal,
    isEditContactModalOpen,
    openEditContactModal,
    closeEditContactModal,
  };
};
