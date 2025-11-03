import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import "./../../assets/styles/forms.css";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import { updateImage } from "../../../services/ApiService";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";

const cookies = new Cookies();

function EditImageModalForm({
  isOpen,
  onClose,
  onImageUpdated,
  image,
  params,
}) {
  useModalBlur(isOpen);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const token = cookies.get("token") || "";

  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title || "",
        description: image.description || "",
        category: image.category || "",
        tags: image.tags || "",
      });
    }
  }, [image]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          image:
            params.errorFileType ||
            "Επιτρέπονται μόνο εικόνες (JPEG, PNG, GIF)",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors({
          image:
            params.errorFileSize ||
            "Το αρχείο είναι πολύ μεγάλο (μέγιστο 10MB)",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const base64String = e.target.result;
        setSelectedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64String,
        });
        setErrors({ ...errors, image: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = params.errorRequired || "Title is required";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = params.errorRequired || "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      building: image.building,
      project: image.project,
    };
    if (selectedFile) {
      submitData.image = selectedFile.base64;
      submitData.image_name = selectedFile.name;
      submitData.image_type = selectedFile.type;
      submitData.image_size = selectedFile.size;
    }

    try {
      const response = await updateImage(image.id, submitData);
      onImageUpdated(response);
      onClose();
      setSelectedFile(null);
    } catch (error) {
      if (error.response?.data?.error) {
        const backendErrors = error.response.data.error;
        if (typeof backendErrors === "string") {
          setErrors({ general: backendErrors });
        } else {
          setErrors(backendErrors);
        }
      } else {
        setErrors({
          general: params.errorGeneral || "Failed to update image.",
        });
      }
    }
  };

  const categoryOptions = [
    { value: "exterior", label: params.categoryExterior || "Εξωτερικές Όψεις" },
    { value: "interior", label: params.categoryInterior || "Εσωτερικές Όψεις" },
    { value: "systems", label: params.categorySystems || "Συστήματα Κτιρίου" },
    {
      value: "construction",
      label: params.categoryConstruction || "Κατασκευαστικά Στοιχεία",
    },
    {
      value: "documentation",
      label: params.categoryDocumentation || "Τεκμηρίωση",
    },
    { value: "other", label: params.categoryOther || "Άλλα" },
  ];

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-96 bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{params.h2}</h2>
          {errors.general && (
            <p className="text-red-500 text-sm mb-2 text-center">
              {errors.general}
            </p>
          )}

          {/* Current Image Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {params.currentImage || "Τρέχουσα Εικόνα"}
            </label>
            <img
              src={image.image_url || image.image}
              alt={image.title}
              className="w-full h-32 object-cover rounded border"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {params.newImage || "Νέα Εικόνα"} (
              {params.optional || "προαιρετικό"})
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="input-field"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
            )}
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          <InputEntryModal
            entry={params.imageTitle}
            id="title"
            value={formData.title}
            onChange={handleChange}
            example={params.imageTitle_example}
            error={errors.title}
            required
          />

          <InputEntryModal
            entry={params.imageCategory}
            id="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            example={params.imageCategory_example}
            options={categoryOptions}
            error={errors.category}
            required
          />

          <InputEntryModal
            entry={params.imageDescription}
            id="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            example={params.imageDescription_example}
            error={errors.description}
          />

          <InputEntryModal
            entry={params.imageTags}
            id="tags"
            value={formData.tags}
            onChange={handleChange}
            example={params.imageTags_example}
            error={errors.tags}
          />

          <div className="flex justify-between mt-6">
            <button type="button" onClick={onClose} className="close-modal">
              {params.cancel}
            </button>
            <button type="submit" className="confirm-button">
              {params.updateImage}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditImageModal({
  isOpen,
  onClose,
  onImageUpdated,
  image,
}) {
  const { language } = useLanguage();
  const params =
    language === "en" ? english_text.EditImageModal : greek_text.EditImageModal;

  return (
    <EditImageModalForm
      isOpen={isOpen}
      onClose={onClose}
      onImageUpdated={onImageUpdated}
      image={image}
      params={params || {}}
    />
  );
}
