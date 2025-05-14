import React from 'react';
import { MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md'; // Προσθέστε εικονίδια αν χρειάζεται

// Υποθέτουμε ότι το component λαμβάνει το 'building' object και το 'params' για τα κείμενα, και το 'onAddContact'
export default function BuildingContactInfo({ building, params, onAddContact }) {
  const contacts = building?.contacts || [];

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
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">{params?.noContacts || "No contact persons added yet."}</p>
      )}
    </div>
  );
}