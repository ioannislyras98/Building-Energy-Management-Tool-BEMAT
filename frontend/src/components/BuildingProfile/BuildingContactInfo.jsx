import React, { useState } from 'react';
import { MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import EditContactModal from '../../modals/EditContactModal';

export default function BuildingContactInfo({ building, params, onAddContact, onEditContact, onDeleteContact }) {
  const contacts = building?.contacts || [];
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);

  const handleEditClick = (contact) => {
    setCurrentContact(contact);
    setEditModalOpen(true);
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
      onDeleteContact(currentContact);
    }
    setDeleteDialogOpen(false);
    setCurrentContact(null);
  };

  const handleContactUpdated = (updatedContact) => {
    if (onEditContact) {
      onEditContact(updatedContact);
    }
    setEditModalOpen(false);
    setCurrentContact(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{params?.title || "Contact Information"}</h3>
        <button
          onClick={onAddContact}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <MdPersonAdd className="mr-2" size={18} />
          {params?.addContactButton || "Add Contact"}
        </button>
      </div>

      {contacts.length > 0 ? (
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact.uuid} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-700">{params.name}: {contact.name}</p>
                  {contact.role && <p className="text-sm text-gray-500">{params.role}: {contact.role}</p>}
                  {contact.email && <p className="text-sm text-gray-500">{params.email}: {contact.email}</p>}
                  {contact.phone_number && <p className="text-sm text-gray-500">{params.phone_number}: {contact.phone_number}</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(contact)} 
                    className="p-1.5 var(--primary-color) hover:bg-blue-100 rounded-full"
                    aria-label="Edit contact"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(contact)} 
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"
                    aria-label="Delete contact"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">{params?.noContacts || "No contact persons added yet."}</p>
      )}

      {/* Edit Contact Modal */}
      <EditContactModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onContactUpdated={handleContactUpdated}
        contact={currentContact}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>{params?.deleteContact || "Delete Contact"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {params?.deleteConfirmation || "Are you sure you want to delete this contact? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            {params?.cancel || "Cancel"}
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            {params?.delete || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}