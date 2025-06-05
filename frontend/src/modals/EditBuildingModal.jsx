import React, { useState, useEffect } from 'react'
import $ from 'jquery'
import Cookies from 'universal-cookie'
import './../css/forms.css'
import { useLanguage } from '../context/LanguageContext'
import english_text from '../languages/english.json'
import greek_text from '../languages/greek.json'
import InputEntryModal from './InputEntryModal'

const cookies = new Cookies()

function EditBuildingModalForm ({
  isOpen,
  onClose,
  onBuildingUpdated,
  building,
  params
}) {
  const [formData, setFormData] = useState({
    name: '',
    usage: '',
    description: '',
    year_built: '',
    address: '',
    is_insulated: false,
    is_certified: false,
    energy_class: '',
    orientation: '',
    total_area: '',
    examined_area: '',
    floors_examined: '1',
    floor_height: '',
    construction_type: '',
    free_facades: '',
    altitude: '',
    non_operating_days: '',
    operating_hours: '',
    occupants: ''
  })
  const [errors, setErrors] = useState({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const token = cookies.get('token') || ''

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name || '',
        usage: building.usage || '',
        description: building.description || '',
        year_built: building.year_built || '',
        address: building.address || '',
        is_insulated: building.is_insulated || false,
        is_certified: building.is_certified || false,
        energy_class: building.energy_class || '',
        orientation: building.orientation || '',
        total_area: building.total_area || '',
        examined_area: building.examined_area || '',
        floors_examined: building.floors_examined || '1',
        floor_height: building.floor_height || '',
        construction_type: building.construction_type || '',
        free_facades: building.free_facades || '',
        altitude: building.altitude || '',
        non_operating_days: building.non_operating_days || '',
        operating_hours: building.operating_hours || '',
        occupants: building.occupants || ''
      })
    }
  }, [building])

  const handleChange = e => {
    const { id, value, type, checked } = e.target
    const newFormData = { ...formData }

    if (type === 'checkbox') {
      newFormData[id] = checked
    } else if (id === 'is_insulated' || id === 'is_certified') {
      newFormData[id] = value === 'true'
    } else {
      newFormData[id] = value
    }
    setFormData(newFormData)

    if (errors[id]) {
      setErrors({ ...errors, [id]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let hasErrors = false
    if (!formData.name?.trim()) {
      newErrors.name = params.errorRequired || 'Field is required'
      hasErrors = true
    }
    if (!formData.address?.trim()) {
      newErrors.address = params.errorRequired || 'Field is required'
      hasErrors = true
    }
    setErrors(newErrors)
    setShowValidationErrors(true)
    return !hasErrors
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    const buildingData = { ...formData }
    const decimalFields = [
      'total_area',
      'examined_area',
      'floor_height',
      'altitude'
    ]
    decimalFields.forEach(field => {
      if (buildingData[field] === '') buildingData[field] = null
      else if (buildingData[field] != null)
        buildingData[field] = Number(buildingData[field])
    })
    const integerFields = [
      'year_built',
      'floors_examined',
      'free_facades',
      'occupants'
    ]
    integerFields.forEach(field => {
      if (buildingData[field] === '') buildingData[field] = null
      else if (buildingData[field] != null)
        buildingData[field] = parseInt(buildingData[field], 10)
    })

    $.ajax({
      url: `http://127.0.0.1:8000/buildings/update/${building.uuid}/`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`
      },
      data: JSON.stringify(buildingData),
      success: function (response) {
        onBuildingUpdated(response)
        onClose()
      },
      error: function (error) {
        setShowValidationErrors(true)
        if (error.responseJSON && error.responseJSON.error) {
          setErrors(error.responseJSON.error)
        } else {
          setErrors({ general: params.errorGeneral || 'An error occurred.' })
        }
      }
    })
  }

  if (!isOpen) return null

  const getInputClass = fieldName =>
    `input-field ${
      showValidationErrors && errors[fieldName] ? 'error-input' : ''
    }`
  const renderError = fieldName =>
    showValidationErrors && errors[fieldName] ? (
      <div className='text-red-500 text-xs mt-1'>{errors[fieldName]}</div>
    ) : null

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center bg-opacity-50 py-10'>
      <div className='rounded-lg p-6 w-full max-w-xl border-primary-light border-2 bg-white shadow-lg flex flex-col max-h-[90vh]'>
        <h2 className='text-lg font-bold mb-2 text-center sticky top-0 bg-white pb-2 z-10'>
          {params.h2}
        </h2>
        {params.requiredFieldsNote && (
          <p className='text-sm text-gray-500 text-center mb-4 sticky top-8 bg-white z-10'>
            <span className='text-red-500'>*</span> {params.requiredFieldsNote}
          </p>
        )}
        {errors.general && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4'>
            {errors.general}
          </div>
        )}

        <div className='overflow-y-auto flex-grow pr-2'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='border-b border-gray-200 pb-4'>
              <h3 className='font-bold text-primary text-sm mb-3'>
                {params.basicInfoSection}
              </h3>
              <InputEntryModal
                entry={params.buildingName}
                id='name'
                value={formData.name}
                onChange={handleChange}
                example={params.buildingName_example}
                error={errors.name}
                className={getInputClass('name')}
                required
              />
              <InputEntryModal
                entry={params.usage}
                id='usage'
                type='select'
                value={formData.usage}
                onChange={handleChange}
                options={params.usageOptions || []}
                error={errors.usage}
                className={getInputClass('usage')}
                required
              />
              <InputEntryModal
                entry={params.description}
                id='description'
                type='textarea'
                value={formData.description}
                onChange={handleChange}
                example={params.description_example}
                error={errors.description}
                className={getInputClass('description')}
                required
              />
              <InputEntryModal
                entry={params.yearBuilt}
                id='year_built'
                type='number'
                value={formData.year_built}
                onChange={handleChange}
                example={params.yearBuilt_example}
                error={errors.year_built}
                className={getInputClass('year_built')}
                min='1800'
                max={new Date().getFullYear()}
              />
              <InputEntryModal
                entry={params.address}
                id='address'
                value={formData.address}
                onChange={handleChange}
                example={params.address_example}
                error={errors.address}
                className={getInputClass('address')}
                required
              />
            </div>

            <div className='border-b border-gray-200 pb-4'>
              <h3 className='font-bold text-primary text-sm mb-3'>
                {params.buildingCharacteristicsSection}
              </h3>
              <InputEntryModal
                entry={params.constructionType}
                id='construction_type'
                type='select'
                value={formData.construction_type}
                onChange={handleChange}
                options={params.constructionTypeOptions || []}
                error={errors.construction_type}
                className={getInputClass('construction_type')}
              />
              <div className='mb-4'>
                <label htmlFor='is_insulated' className='block text-sm mb-1'>
                  {params.isInsulated}
                </label>
                <select
                  id='is_insulated'
                  name='is_insulated'
                  value={formData.is_insulated}
                  onChange={handleChange}
                  className={getInputClass('is_insulated')}
                >
                  <option value='false'>{params.no}</option>
                  <option value='true'>{params.yes}</option>
                </select>
                {renderError('is_insulated')}
              </div>

              <div className='mb-4'>
                <label htmlFor='is_certified' className='block text-sm mb-1'>
                  {params.isCertified}
                </label>
                <select
                  id='is_certified'
                  name='is_certified'
                  value={formData.is_certified}
                  onChange={handleChange}
                  className={getInputClass('is_certified')}
                >
                  <option value='false'>{params.no}</option>
                  <option value='true'>{params.yes}</option>
                </select>
                {renderError('is_certified')}
              </div>
              <InputEntryModal
                entry={params.isCertified}
                id='is_certified'
                type='select'
                value={formData.is_certified}
                onChange={handleChange}
                options={[
                  { value: 'true', label: params.yes || 'Yes' },
                  { value: 'false', label: params.no || 'No' }
                ]}
                error={errors.is_certified}
                className={getInputClass('is_certified')}
              />
              {formData.is_certified && (
                <InputEntryModal
                  entry={params.energyClass}
                  id='energy_class'
                  type='select'
                  value={formData.energy_class}
                  onChange={handleChange}
                  options={params.energyClassOptions || []}
                  error={errors.energy_class}
                  className={getInputClass('energy_class')}
                />
              )}
            </div>

            <div className='border-b border-gray-200 pb-4'>
              <h3 className='font-bold text-primary text-sm mb-3'>
                {params.areasAndFloorsSection}
              </h3>
              <InputEntryModal
                entry={params.totalArea}
                id='total_area'
                type='number'
                value={formData.total_area}
                onChange={handleChange}
                example={params.totalArea_example}
                error={errors.total_area}
                className={getInputClass('total_area')}
                step='0.01'
                required
              />
              <InputEntryModal
                entry={params.examinedArea}
                id='examined_area'
                type='number'
                value={formData.examined_area}
                onChange={handleChange}
                example={params.examinedArea_example}
                error={errors.examined_area}
                className={getInputClass('examined_area')}
                step='0.01'
                required
              />
              <InputEntryModal
                entry={params.floorsExamined}
                id='floors_examined'
                type='number'
                value={formData.floors_examined}
                onChange={handleChange}
                example={params.floorsExamined_example}
                error={errors.floors_examined}
                className={getInputClass('floors_examined')}
                min='1'
                required
              />
              <InputEntryModal
                entry={params.floorHeight}
                id='floor_height'
                type='number'
                value={formData.floor_height}
                onChange={handleChange}
                example={params.floorHeight_example}
                error={errors.floor_height}
                className={getInputClass('floor_height')}
                step='0.01'
              />
              <InputEntryModal
                entry={params.freeFacades}
                id='free_facades'
                type='number'
                value={formData.free_facades}
                onChange={handleChange}
                example={params.freeFacades_example}
                error={errors.free_facades}
                className={getInputClass('free_facades')}
                min='0'
                max='4'
              />
            </div>

            <div className='border-b border-gray-200 pb-4'>
              <h3 className='font-bold text-primary text-sm mb-3'>
                {params.additionalInfoSection}
              </h3>
              <InputEntryModal
                entry={params.altitude}
                id='altitude'
                type='number'
                value={formData.altitude}
                onChange={handleChange}
                example={params.altitude_example}
                error={errors.altitude}
                className={getInputClass('altitude')}
                step='0.01'
              />
            </div>
            
            <div className='pb-4'>
              <h3 className='font-bold text-primary text-sm mb-3'>
                {params.operationalInfoSection}
              </h3>
              <InputEntryModal
                entry={params.nonOperatingDays}
                id='non_operating_days'
                type='text'
                value={formData.non_operating_days}
                onChange={handleChange}
                example={params.nonOperatingDays_example}
                error={errors.non_operating_days}
                className={getInputClass('non_operating_days')}
              />
              <InputEntryModal
                entry={params.operatingHours}
                id='operating_hours'
                type='text'
                value={formData.operating_hours}
                onChange={handleChange}
                example={params.operatingHours_example}
                error={errors.operating_hours}
                className={getInputClass('operating_hours')}
              />
              <InputEntryModal
                entry={params.occupants}
                id='occupants'
                type='number'
                value={formData.occupants}
                onChange={handleChange}
                example={params.occupants_example}
                error={errors.occupants}
                className={getInputClass('occupants')}
                min='0'
              />
            </div>
          </form>
        </div>
        <div className='flex justify-between mt-4 pt-2 border-t border-gray-200 bg-white sticky bottom-0 z-10'>
          <button type='button' onClick={onClose} className='close-modal'>
            {params.cancel}
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            className='confirm-button'
          >
            {params.updateBuilding}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditBuildingModal ({
  isOpen,
  onClose,
  onBuildingUpdated,
  building
}) {
  const { language } = useLanguage()
  const params =
    language === 'en'
      ? english_text.EditBuildingModal
      : greek_text.EditBuildingModal

  return (
    <EditBuildingModalForm
      isOpen={isOpen}
      onClose={onClose}
      onBuildingUpdated={onBuildingUpdated}
      building={building}
      params={params || {}}
    />
  )
}
