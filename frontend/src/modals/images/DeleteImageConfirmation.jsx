import React, { useState } from "react";
import Cookies from "universal-cookie";
import "./../../assets/styles/forms.css";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

function DeleteImageConfirmationForm({ isOpen, onClose, onImageDeleted, image, params }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cookies = new Cookies();
  const token = cookies.get("token");

  // Apply blur effect when modal is open
  useModalBlur(isOpen);

  const handleDelete = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/building-images/${image.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        onImageDeleted(image.id);
        onClose();
      } else {
        setError(params.deleteError || "Σφάλμα κατά την διαγραφή της εικόνας");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError(params.deleteError || "Σφάλμα κατά την διαγραφή της εικόνας");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-96 bg-white shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center text-red-600">
          {params.h2}
        </h2>
        <div className="mb-6 text-center">
          <p className="text-gray-700 mb-2">{params.message}</p>
          {image && (
            <p className="font-semibold text-gray-900">"{image.title}"</p>
          )}
          <p className="text-sm text-red-600 mt-2">{params.warning}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-between">
          <button 
            type="button" 
            onClick={onClose} 
            className="close-modal"
            disabled={loading}
          >
            {params.cancel}
          </button>
          <button 
            type="button" 
            onClick={handleDelete} 
            className="confirm-button bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (params.deleting || "Διαγραφή...") : params.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeleteImageConfirmation({ isOpen, onClose, onImageDeleted, image }) {
  const { language } = useLanguage();
  const params =
    language === "en"
      ? english_text.DeleteImageConfirmation
      : greek_text.DeleteImageConfirmation;

  return (
    <DeleteImageConfirmationForm
      isOpen={isOpen}
      onClose={onClose}
      onImageDeleted={onImageDeleted}
      image={image}
      params={params || {}}
    />
  );
}
