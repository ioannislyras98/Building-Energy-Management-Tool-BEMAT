import React, { useState } from "react";
import {
  MdPersonAdd,
  MdEdit,
  MdDelete,
  MdContacts,
  MdEmail,
  MdPhone,
  MdPerson,
  MdWork,
} from "react-icons/md";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import API_BASE_URL from "../../config/api.js";

export default function BuildingContactInfo({
  building,
  params,
  onAddContact,
  onEditContact,
  onDeleteContact,
}) {
  const contacts = building.data?.contacts || [];
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("token") || "";

  const { language } = useLanguage();
  const dialogText =
    language === "en"
      ? english_text.BuildingContactInfo
      : greek_text.BuildingContactInfo;

  const profileText =
    language === "en"
      ? english_text.BuildingProfile
      : greek_text.BuildingProfile;

  const handleEditClick = (contact) => {
    onEditContact(contact);
  };

  const handleDeleteClick = (contact) => {
    setCurrentContact(contact);
    setDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCurrentContact(null);
  };

  const confirmDelete = () => {
    if (currentContact && onDeleteContact) {
      const settings = {
        url: `${API_BASE_URL}/buildings/${building.data.uuid}/contacts/${currentContact.uuid}/delete/`,
        method: "DELETE",
        timeout: 0,
        headers: {
          Authorization: `token ${token}`,
        },
      };

      $.ajax(settings)
        .done(function (response) {
          onDeleteContact(currentContact);
        })
        .fail(function (error) {
          console.error("Error deleting contact:", error);
          alert("Error deleting contact. Please try again.");
        })
        .always(function () {
          setDeleteDialogOpen(false);
          setCurrentContact(null);
        });
    } else {
      setDeleteDialogOpen(false);
      setCurrentContact(null);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up card-hover-effect">
      {" "}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <MdContacts className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {params?.title ||
                  profileText?.contactInfo?.title ||
                  "Contact Information"}
              </h3>
              <p className="text-blue-100 text-sm">
                {contacts.length}{" "}
                {language === "en"
                  ? `contact${contacts.length !== 1 ? "s" : ""}`
                  : `επαφ${contacts.length === 1 ? "ή" : "ές"}`}
              </p>
            </div>
          </div>
          <button
            onClick={onAddContact}
            className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md">
            <MdPersonAdd className="mr-2" size={18} />
            {params?.addContactButton || "Add Contact"}
          </button>
        </div>
      </div>
      <div className="p-6">
        {contacts.length > 0 ? (
          <div className="space-y-4">
            {" "}
            {contacts.map((contact, index) => (
              <div
                key={contact.uuid}
                className="group relative bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    {" "}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {contact.name?.charAt(0)?.toUpperCase() || "C"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {contact.name}
                        </h4>
                        {contact.role && (
                          <div className="flex items-center space-x-2 mt-1">
                            <MdWork className="text-gray-400" size={14} />
                            <span className="text-sm text-gray-600">
                              {contact.role}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 ml-13">
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <MdEmail className="text-primary" size={16} />
                          <span className="text-sm text-gray-700">
                            {contact.email}
                          </span>
                        </div>
                      )}
                      {contact.phone_number && (
                        <div className="flex items-center space-x-2">
                          <MdPhone className="text-green-500" size={16} />
                          <span className="text-sm text-gray-700">
                            {contact.phone_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditClick(contact)}
                      className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 hover:text-primary-dark hover:scale-110 rounded-lg transition-all duration-200 hover:shadow-md"
                      aria-label="Edit contact">
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(contact)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      aria-label="Delete contact">
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdContacts className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">
              {params?.noContacts || "No contact persons added yet."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {profileText?.contactInfo?.addFirstContact ||
                "Add your first contact to get started"}
            </p>
          </div>
        )}
      </div>
      <ConfirmationDialog
        open={deleteDialogOpen}
        title={dialogText?.deleteConfirmTitle || "Delete Contact"}
        message={
          dialogText?.deleteConfirmMessage ||
          `Are you sure you want to delete ${
            currentContact?.name || "this contact"
          }? This action cannot be undone.`
        }
        confirmText={dialogText?.deleteConfirmButton || "Delete"}
        cancelText={dialogText?.cancelButton || "Cancel"}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        confirmColor="error"
      />
    </div>
  );
}
