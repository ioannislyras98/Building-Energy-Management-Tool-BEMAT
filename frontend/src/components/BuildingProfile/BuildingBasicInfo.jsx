import React from 'react';
import { MdEdit } from 'react-icons/md';

const BuildingBasicInfo = ({ building, params, onEdit }) => (
  <div className="p-4 mb-4 bg-white rounded-lg shadow">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-semibold text-primary">{building?.name || params.loading}</h2>
      <button onClick={onEdit} className="text-primary hover:text-primary-dark p-1">
        <MdEdit size={20} />
      </button>
    </div>
    <p><span className="font-medium">{params.description}:</span> {building?.description || 'N/A'}</p>
    <p><span className="font-medium">{params.examined_area}:</span> {building?.examined_area || 'N/A'} m²</p>
    <p><span className="font-medium">{params.yearBuilt}:</span> {building?.year_built || 'N/A'}</p>
    <p><span className="font-medium">{params.energyClass}:</span> {building?.energy_class || 'N/A'}</p>
  </div>
);

export default BuildingBasicInfo;