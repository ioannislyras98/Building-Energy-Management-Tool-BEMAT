import React from 'react';

const BuildingContactInfo = ({ building, params, onAddContact }) => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="text-lg font-semibold text-primary mb-2">{params.informationTitle}</h3>
    <p><span className="font-medium">{params.address}:</span> {building?.address || 'N/A'}</p>
    {/* Placeholder for General Properties */}
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-700">{params.contactPersonTitle}</h4>
      {/* Placeholder for contact details */}
      <p className="text-sm text-gray-500">{params.noContactDetails}</p>
      <button onClick={onAddContact} className="mt-2 text-sm text-primary hover:text-primary-dark">
        {params.addContactPerson}
      </button>
    </div>
  </div>
);

export default BuildingContactInfo;