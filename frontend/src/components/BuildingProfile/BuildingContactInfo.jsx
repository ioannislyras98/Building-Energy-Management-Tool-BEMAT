import React, { useState } from 'react'
import { MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import EditContactModal from '../../modals/EditContactModal'
import $ from 'jquery'
import Cookies from 'universal-cookie'
import { useLanguage } from '../../context/LanguageContext'
import english_text from '../../languages/english.json'
import greek_text from '../../languages/greek.json'

export default function BuildingContactInfo ({
  building,
  params,
  onAddContact,
  onEditContact,
  onDeleteContact
}) {
  const contacts = building?.contacts || []
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentContact, setCurrentContact] = useState(null)
  const cookies = new Cookies()
  const token = cookies.get('token') || ''
  const { language } = useLanguage()

  // Get the appropriate text based on the current language
  const dialogText =
    language === 'en'
      ? english_text.BuildingContactInfo
      : greek_text.BuildingContactInfo

  const handleEditClick = contact => {
    setCurrentContact(contact)
    setEditModalOpen(true)
  }

  const handleDeleteClick = contact => {
    setCurrentContact(contact)
    setDeleteDialogOpen(true)
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setCurrentContact(null)
  }

  const confirmDelete = () => {
    if (currentContact && onDeleteContact) {
      const settings = {
        url: `http://127.0.0.1:8000/buildings/${building.uuid}/contacts/${currentContact.uuid}/delete/`,
        method: 'DELETE',
        timeout: 0,
        headers: {
          Authorization: `token ${token}`
        }
      }

      $.ajax(settings)
        .done(function (response) {
          // If successful, update the UI through the provided callback
          onDeleteContact(currentContact)
        })
        .fail(function (error) {
          console.error('Error deleting contact:', error)
          alert('Error deleting contact. Please try again.')
        })
        .always(function () {
          setDeleteDialogOpen(false)
          setCurrentContact(null)
        })
    } else {
      setDeleteDialogOpen(false)
      setCurrentContact(null)
    }
  }

  // Remove the API call from handleContactUpdated as it will now be handled in the modal
  const handleContactUpdated = updatedContact => {
    if (onEditContact) {
      onEditContact(updatedContact)
    }
    setEditModalOpen(false)
    setCurrentContact(null)
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl font-semibold text-gray-800'>
          {params?.title || 'Contact Information'}
        </h3>{' '}
        <button
          onClick={onAddContact}
          className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
        >
          <MdPersonAdd className='mr-2' size={18} />
          {params?.addContactButton || 'Add Contact'}
        </button>
      </div>

      {contacts.length > 0 ? (
        <ul className='space-y-3'>
          {contacts.map(contact => (
            <li
              key={contact.uuid}
              className='p-3 bg-gray-50 rounded-md border border-gray-200'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-gray-700'>
                    {params.name}: {contact.name}
                  </p>
                  {contact.role && (
                    <p className='text-sm text-gray-500'>
                      {params.role}: {contact.role}
                    </p>
                  )}
                  {contact.email && (
                    <p className='text-sm text-gray-500'>
                      {params.email}: {contact.email}
                    </p>
                  )}
                  {contact.phone_number && (
                    <p className='text-sm text-gray-500'>
                      {params.phone_number}: {contact.phone_number}
                    </p>
                  )}
                </div>{' '}
                <div className='flex space-x-2'>
                  <button
                    onClick={() => handleEditClick(contact)}
                    className='p-1.5 text-primary hover:bg-blue-100 rounded-full'
                    aria-label='Edit contact'
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(contact)}
                    className='p-1.5 text-red-600 hover:bg-red-100 rounded-full'
                    aria-label='Delete contact'
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-500'>
          {params?.noContacts || 'No contact persons added yet.'}
        </p>
      )}

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onContactUpdated={handleContactUpdated}
        contact={currentContact}
        buildingUuid={building.uuid}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
        keepMounted={false}
      >
        <DialogTitle id='delete-dialog-title'>
          {dialogText.deleteContactTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            {dialogText.deleteContactConfirmation}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color='primary'>
            {dialogText.cancelButton}
          </Button>
          <Button
            onClick={confirmDelete}
            color='error'
            autoFocus
            id='delete-confirm-button'
          >
            {dialogText.deleteButton}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
