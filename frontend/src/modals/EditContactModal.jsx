import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import "./../css/forms.css";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import InputEntryModal from "./InputEntryModal";

const cookies = new Cookies();

function EditContactModalForm({ isOpen, onClose, onContactUpdated, contact, params }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const token = cookies.get("token") || "";

  // Populate form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        role: contact.role || "",
        email: contact.email || "",
        phone_number: contact.phone_number || "",
      });
    }
  }, [contact]);

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
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    $.ajax({
      url: `http://127.0.0.1:8000/buildings/contacts/update/${contact.uuid}/`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      data: JSON.stringify(formData),
      success: function (response) {
        onContactUpdated(response);
        onClose();
      },
      error: function (error) {
        if (error.responseJSON && error.responseJSON.error) {
            const backendErrors = error.responseJSON.error;
            if (typeof backendErrors === 'string') {
                setErrors({ general: backendErrors });
            } else {
                setErrors(backendErrors);
            }
        } else {
          setErrors({ general: params.errorGeneral || "Failed to update contact." });
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="rounded-lg p-6 w-96 border-primary-light border-2 bg-white shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4 text-center">{params.h2 || "Edit Contact"}</h2>
          {errors.general && <p className="text-red-500 text-sm mb-2 text-center">{errors.general}</p>}
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
            <button type="button" onClick={onClose} className="close-modal">{params.cancel || "Cancel"}</button>
            <button type="submit" className="confirm-button">{params.updateContact || "Update Contact"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditContactModal({ isOpen, onClose, onContactUpdated, contact }) {
  const { language } = useLanguage();
  const params = language === "en" ? english_text.EditContactModal : greek_text.EditContactModal;

  return (
    
    <EditContactModalForm
      isOpen={isOpen}
      onClose={onClose}
      onContactUpdated={onContactUpdated}
      contact={contact}
      params={params || {}} // Ensure params is always an object
    />
  );
}
