import React, { useState } from 'react';
import $ from 'jquery';
import Cookies from 'universal-cookie';
import InputEntryModal from './InputEntryModal';
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const AddEnergyConsumptionModal = ({ isOpen, onClose, onConsumptionAdded, buildingUuid, projectUuid }) => {
  const { language } = useLanguage(); // Get language object
  const text = language === 'en' ? english_text.BuildingProfile : greek_text.BuildingProfile;

  const [formData, setFormData] = useState({
    energy_source: 'electricity', // Default or make it empty
    start_date: '',
    end_date: '',
    quantity: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const cookies = new Cookies(null, { path: '/' });
  const token = cookies.get('token');

  const energySources = [
    { value: 'electricity', label: text.sources?.electricity || 'Electricity' },
    { value: 'heating_oil', label: text.sources?.heatingOil || 'Heating Oil' },
    { value: 'natural_gas', label: text.sources?.naturalGas || 'Natural Gas' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setError(text.errorAuth || "Authentication required.");
      return;
    }
    setLoading(true);
    setError(null);

    const consumptionData = {
      ...formData,
      building: buildingUuid,
      project: projectUuid,
      quantity: parseFloat(formData.quantity)
    };

    $.ajax({
      url: 'http://127.0.0.1:8000/energy_consumption/create/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      data: JSON.stringify(consumptionData),
      success: () => {
        setLoading(false);
        onConsumptionAdded();
      },
      error: (jqXHR) => {
        console.error("Error adding energy consumption:", jqXHR);
        setError(jqXHR.responseJSON?.detail || jqXHR.responseJSON?.error || text.errorFailed || "Failed to add energy consumption.");
        setLoading(false);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{text.title || "Add New Energy Consumption"}</h3>
        <form onSubmit={handleSubmit}>
          <InputEntryModal
            label={text.energySource || "Energy Source"}
            type="select"
            name="energy_source"
            id="energy_source"
            value={formData.energy_source}
            onChange={handleChange}
            options={energySources}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />

          <InputEntryModal
            label={text.startDate || "Start Date"}
            type="date"
            name="start_date"
            id="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />

          <InputEntryModal
            label={text.endDate || "End Date"}
            type="date"
            name="end_date"
            id="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />

          <InputEntryModal
            label={text.quantity || "Quantity"}
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            step="any"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              {text.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? (text.saving || "Saving...") : (text.save || "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEnergyConsumptionModal;