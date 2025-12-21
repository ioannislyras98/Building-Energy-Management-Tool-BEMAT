import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { Alert } from "@mui/material";
import {
  MdOutlineAddCircle,
  MdDelete,
  MdEdit,
  MdDownload,
} from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import AddImageModal from "../../modals/images/AddImageModal";
import EditImageModal from "../../modals/images/EditImageModal";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { getImagesByBuilding, deleteImage } from "../../../services/ApiService";

const ImagesTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ImagesTabContent || {}
      : greek_text.ImagesTabContent || {};

  const cookies = new Cookies();
  const token = cookies.get("token");

  useEffect(() => {
    fetchImages();
  }, [buildingUuid, projectUuid]);

  const fetchImages = async () => {
    if (!buildingUuid || !projectUuid) return;

    setLoading(true);
    try {
      const data = await getImagesByBuilding(buildingUuid);
      setImages(data);
    } catch (error) {
      setImages([]);
      setError(
        translations.fetchError || "Σφάλμα κατά την φόρτωση των εικόνων"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageAdded = (newImage) => {
    setImages((prevImages) => [newImage, ...prevImages]);
    setError(null);
  };

  const handleDelete = (image) => {
    setSelectedImage(image);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedImage) return;

    try {
      await deleteImage(selectedImage.uuid);
      handleImageDeleted(selectedImage.uuid);
      setOpenDeleteDialog(false);
      setSelectedImage(null);
    } catch (error) {
      setError(
        translations.deleteError || "Σφάλμα κατά την διαγραφή της εικόνας"
      );
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedImage(null);
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setOpenEditModal(true);
  };

  const handleDownloadImage = (image) => {
    const link = document.createElement("a");
    link.href = image.image_url || image.image;
    link.download = `${image.title || "image"}.${
      image.image_type ? image.image_type.split("/")[1] : "jpg"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpdated = (updatedImage) => {
    setImages((prevImages) =>
      prevImages.map((img) => (img.uuid === updatedImage.uuid ? updatedImage : img))
    );
    setError(null);
  };

  const handleImageDeleted = (deletedImageId) => {
    setImages((prevImages) =>
      prevImages.filter((img) => img.uuid !== deletedImageId)
    );
    setError(null);
  };

  const getCategoryInfo = (category) => {
    const categories = {
      exterior: {
        name: language === "en" ? "Exterior Views" : "Εξωτερικές Όψεις",
        color: "#2196F3",
      },
      interior: {
        name: language === "en" ? "Interior Views" : "Εσωτερικές Όψεις",
        color: "#4CAF50",
      },
      systems: {
        name: language === "en" ? "Building Systems" : "Συστήματα Κτιρίου",
        color: "#FF9800",
      },
      construction: {
        name:
          language === "en"
            ? "Construction Details"
            : "Κατασκευαστικά Στοιχεία",
        color: "#9C27B0",
      },
      documentation: {
        name: language === "en" ? "Documentation" : "Τεκμηρίωση",
        color: "#607D8B",
      },
      other: { name: language === "en" ? "Other" : "Άλλα", color: "#795548" },
    };
    return categories[category] || categories.other;
  };

  return (
    <div className="images-view">
      <div className="px-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {translations.title || "Εικόνες Κτιρίου"}
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            className="mb-4">
            {error}
          </Alert>
        )}

        <div className="buildings-grid">
          {/* Add Image Card */}
          <div
            className="project-card add-project-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={() => setOpenAddModal(true)}
            style={{ cursor: "pointer" }}>
            <div className="flex flex-col items-center justify-center h-full">
              <MdOutlineAddCircle className="text-5xl text-primary mb-2" />
              <span className="text-primary font-medium">
                {translations.addImage || "Προσθήκη Εικόνας"}
              </span>
            </div>
          </div>

          {/* Images */}
          {images.length > 0
            ? images.map((image) => {
                const categoryInfo = getCategoryInfo(image.category);
                return (
                  <div
                    key={image.uuid}
                    className="building-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-full flex flex-col">
                      {/* Image */}
                      <div
                        className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden cursor-pointer"
                        onClick={() => handleDownloadImage(image)}>
                        <img
                          src={image.image_url || image.image}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onLoad={(e) => {}}
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                        <div
                          className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"
                          style={{ display: "none" }}>
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          <strong>{image.title}</strong>
                        </h3>

                        <div className="mb-2">
                          <span
                            className="inline-block px-2 py-1 text-xs text-white rounded-full"
                            style={{ backgroundColor: categoryInfo.color }}>
                            <strong>
                              {translations.category || "Κατηγορία"}:
                            </strong>{" "}
                            {categoryInfo.name}
                          </span>
                        </div>

                        {image.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            <strong>
                              {translations.description || "Περιγραφή"}:
                            </strong>{" "}
                            {image.description}
                          </p>
                        )}

                        {image.tags && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">
                              <strong>
                                {translations.tags || "Ετικέτες"}:
                              </strong>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {image.tags
                                .split(",")
                                .slice(0, 3)
                                .map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag.trim()}
                                  </span>
                                ))}
                              {image.tags.split(",").length > 3 && (
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{image.tags.split(",").length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleDownloadImage(image)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          title={translations.download || "Λήψη"}>
                          <MdDownload className="mr-1" size={16} />
                          {translations.download || "Λήψη"}
                        </button>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(image)}
                            className="inline-flex items-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title={translations.edit || "Επεξεργασία"}>
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(image)}
                            className="inline-flex items-center p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title={translations.delete || "Διαγραφή"}>
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            : !loading && (
                <div className="no-buildings">
                  <p>
                    {translations.noImages ||
                      "Δεν έχουν προστεθεί εικόνες. Κάντε κλικ στο κουμπί παραπάνω για να προσθέσετε την πρώτη εικόνα."}
                  </p>
                </div>
              )}
        </div>
      </div>

      {/* Modals */}
      <AddImageModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onImageAdded={handleImageAdded}
        buildingUuid={buildingUuid}
        projectUuid={projectUuid}
      />

      <EditImageModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onImageUpdated={handleImageUpdated}
        image={selectedImage}
        buildingUuid={buildingUuid}
        projectUuid={projectUuid}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={translations.deleteConfirmTitle || "Επιβεβαίωση Διαγραφής"}
        message={
          selectedImage
            ? `${
                translations.deleteConfirmMessage ||
                "Είστε σίγουροι ότι θέλετε να διαγράψετε την εικόνα"
              } "${selectedImage.title}";`
            : ""
        }
        confirmText={translations.delete || "Διαγραφή"}
        cancelText={translations.cancel || "Ακύρωση"}
        confirmColor="error"
      />
    </div>
  );
};

export default ImagesTabContent;
