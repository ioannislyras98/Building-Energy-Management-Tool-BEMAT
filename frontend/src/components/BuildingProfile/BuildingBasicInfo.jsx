import React from 'react'
import {
  MdEdit,
  MdBusiness,
  MdDateRange,
  MdSquareFoot,
  MdEnergySavingsLeaf
} from 'react-icons/md'

const BuildingBasicInfo = ({ building, params, onEdit }) => (
  <div className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up card-hover-effect'>
    {/* Header */}
    <div className='bg-gradient-to-r from-primary to-primary-dark p-4'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
            <MdBusiness className='text-white' size={20} />
          </div>
          <div>
            <h2 className='text-xl font-bold text-white'>
              {building?.name || params.loading}
            </h2>
            <p className='text-blue-100 text-sm'>Basic Information</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className='p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white hover:shadow-md'
        >
          <MdEdit size={20} />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className='p-6 space-y-4'>
      <div className='flex items-start space-x-3'>
        <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1'>
          <MdBusiness className='text-gray-600' size={16} />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500 mb-1'>
            {params.description}
          </p>
          <p className='text-gray-800 leading-relaxed'>
            {building?.description || 'N/A'}
          </p>
        </div>
      </div>

      <div className='flex items-center space-x-3'>
        <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
          <MdSquareFoot className='text-blue-600' size={16} />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500'>
            {params.examined_area}
          </p>
          <p className='text-gray-800 font-semibold'>
            {building?.examined_area || 'N/A'} m²
          </p>
        </div>
      </div>

      <div className='flex items-center space-x-3'>
        <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
          <MdDateRange className='text-green-600' size={16} />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500'>
            {params.yearBuilt}
          </p>
          <p className='text-gray-800 font-semibold'>
            {building?.year_built || 'N/A'}
          </p>
        </div>
      </div>

      <div className='flex items-center space-x-3'>
        <div className='w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0'>
          <MdEnergySavingsLeaf className='text-emerald-600' size={16} />
        </div>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-500'>
            {params.energyClass}
          </p>
          <div className='flex items-center space-x-2'>
            <p className='text-gray-800 font-semibold'>
              {building?.energy_class || 'N/A'}
            </p>
            {building?.energy_class && (
              <span className='px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full'>
                Class {building.energy_class}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default BuildingBasicInfo
