import React, { useState } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../../assets/styles/forms.css";
import { useLanguage } from "../../context/LanguageContext";
import { useModalBlur } from "../../hooks/useModals";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import InputEntryModal from "../shared/InputEntryModal";

const cookies = new Cookies();

function AddContactModalForm({
  isOpen,
  onClose,
  onContactAdded,
  buildingUuid,
  params,
}) {
  console.log("AddContactModal - isOpen:", isOpen, "params:", params);

  // Apply blur effect when modal is open
  useModalBlur(isOpen);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const token = cookies.get("token") || "";

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.name.trim()) {
      newErrors.name = params.errorRequired || "Name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = params.errorRequired || "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = params.errorEmail || "Invalid email format";
      isValid = false;
    }
    if (formData.phone_number.trim() && !/^[\d\s+()-]+$/.test(formData.phone_number)) {
      newErrors.phone_number = params.errorPhone || "Μόνο αριθμοί και σύμβολα τηλεφώνου επιτρέπονται";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("AddContactModal - handleSubmit called");
    console.log("AddContactModal - buildingUuid:", buildingUuid);
    console.log("AddContactModal - formData:", formData);

    if (!validateForm()) return;

    const submitUrl = `http://127.0.0.1:8000/buildings/${buildingUuid}/contacts/create/`;
    console.log("AddContactModal - Submit URL:", submitUrl);

    $.ajax({
      url: submitUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      data: JSON.stringify(formData),
      success: function (response) {
        onContactAdded(response);
        onClose();
        setFormData({ name: "", role: "", email: "", phone_number: "" });
      },
      error: function (error) {
        if (error.responseJSON && error.responseJSON.error) {
          const backendErrors = error.responseJSON.error;
          if (typeof backendErrors === "string") {
            setErrors({ general: backendErrors });
          } else {
            setErrors(backendErrors);
          }
        } else {
          setErrors({
            general: params.errorGeneral || "Failed to add contact.",
          });
        }
      },
    });
  };

  if (!isOpen) return null;

  console.log("AddContactModal - Rendering modal content");
  console.log("AddContactModal - params:", params);
  console.log("AddContactModal - buildingUuid:", buildingUuid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg p-6 w-96 bg-white shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{params.h2}</h2>
          {errors.general && (
            <p className="text-red-500 text-sm mb-2 text-center">
              {errors.general}
            </p>
          )}
          <InputEntryModal
            entry={params.contactName}
            id="name"
            value={formData.name}
            onChange={handleChange}
            example={params.contactName_example}
            error={errors.name}
            required
          />
          <InputEntryModal
            entry={params.contactRole}
            id="role"
            value={formData.role}
            onChange={handleChange}
            example={params.contactRole_example}
            error={errors.role}
          />
          <InputEntryModal
            entry={params.contactEmail}
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            example={params.contactEmail_example}
            error={errors.email}
            required
          />
          <InputEntryModal
            entry={params.contactPhone}
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
            example={params.contactPhone_example}
            error={errors.phone_number}
          />
          <div className="flex justify-between mt-6">
            <button type="button" onClick={onClose} className="close-modal">
              {params.cancel}
            </button>
            <button type="submit" className="confirm-button">
              {params.addContact}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddContactModal({
  isOpen,
  onClose,
  onContactAdded,
  buildingUuid,
}) {
  const { language } = useLanguage();
  const params =
    language === "en"
      ? english_text.AddContactModal
      : greek_text.AddContactModal;

  return (
    <AddContactModalForm
      isOpen={isOpen}
      onClose={onClose}
      onContactAdded={onContactAdded}
      buildingUuid={buildingUuid}
      params={params || {}}
    />
  );
}
