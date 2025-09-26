import React, { useState } from "react";
import {
  MdEdit,
  MdDelete,
  MdBusiness,
  MdDateRange,
  MdSquareFoot,
  MdEnergySavingsLeaf,
} from "react-icons/md";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const BuildingBasicInfo = ({ building, params, onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { language } = useLanguage();

  console.log("BuildingBasicInfo received props:", { building, params });

  const dialogText =
    language === "en"
      ? english_text.BuildingProfile
      : greek_text.BuildingProfile;

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(building);
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up card-hover-effect">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <MdBusiness className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {building.data?.name || params.loading}
                </h2>
                <p className="text-blue-100 text-sm">
                  {dialogText?.basicInfo?.title || "Basic Information"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white hover:shadow-md"
                aria-label="Edit building">
                <MdEdit size={20} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-red-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white hover:shadow-md"
                aria-label="Delete building">
                <MdDelete size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <MdBusiness className="text-green-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                {params.description}
              </p>
              <p className="text-gray-800 leading-relaxed">
                {building.data?.description || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdSquareFoot className="text-green-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">
                {params.examined_area}
              </p>
              <p className="text-gray-800 font-semibold">
                {building.data?.examined_area || "N/A"} m²
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdDateRange className="text-green-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">
                {params.yearBuilt}
              </p>
              <p className="text-gray-800 font-semibold">
                {building.data?.year_built || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdEnergySavingsLeaf className="text-emerald-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">
                {params.energyClass}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-gray-800 font-semibold">
                  {building.data?.energy_class || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={dialogText?.deleteBuildingTitle || "Delete Building"}
        message={
          dialogText?.deleteBuildingConfirmation ||
          "Are you sure you want to delete this building? This action cannot be undone."
        }
        confirmText={dialogText?.deleteButton || "Delete"}
        cancelText={dialogText?.cancelButton || "Cancel"}
        confirmColor="error"
      />
    </>
  );
};

export default BuildingBasicInfo;
