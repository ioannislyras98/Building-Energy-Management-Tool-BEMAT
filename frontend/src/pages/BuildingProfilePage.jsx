import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import english_text from '../languages/english.json';
import greek_text from '../languages/greek.json';
import { MdEdit, MdArrowBack } from 'react-icons/md';
import BuildingBasicInfo from '../components/BuildingProfile/BuildingBasicInfo';
import BuildingContactInfo from '../components/BuildingProfile/BuildingContactInfo';
import BuildingTabs from '../components/BuildingProfile/BuildingTabs';
import Cookies from 'universal-cookie';
import $ from 'jquery';
import { useModals } from '../hooks/useModals';
import { Modals } from '../components/Modals';

const cookies = new Cookies(null, { path: '/' });

export default function BuildingProfilePage() {
  const { projectUuid, buildingUuid } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = language === 'en' ? english_text.BuildingProfile : greek_text.BuildingProfile;

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    isEditBuildingModalOpen,
    openEditBuildingModal,
    closeEditBuildingModal,
    isAddContactModalOpen,
    openAddContactModal,
    closeAddContactModal,
  } = useModals();

  const fetchBuildingDetails = () => {
    const token = cookies.get('token');
    if (!token) {
      setError(text?.errors?.auth || "Authentication required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    $.ajax({
      url: `http://127.0.0.1:8000/buildings/get/${buildingUuid}/`,
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
      success: (data) => {
        setBuilding(data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error fetching building details:", err);
        setError(err.responseJSON?.error || text?.errors?.generic || "Failed to fetch building details.");
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (buildingUuid) {
      fetchBuildingDetails();
    }
  }, [buildingUuid, text]);

  const handleEditBasicInfo = () => {
    if (building) {
      openEditBuildingModal();
    }
  };

  const handleAddContact = () => {
    if (building) {
      openAddContactModal();
    }
  };

  const handleBuildingUpdated = (updatedBuilding) => {
    fetchBuildingDetails();
  };

  const handleContactAdded = (newContact) => {
    fetchBuildingDetails();
  };

  if (loading) {
    return <div className="p-6">{text?.loading || "Loading building profile..."}</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!building) {
    return <div className="p-6">{text?.errors?.notFound || "Building not found."}</div>;
  }

  return (
    <>
    <div id="projects-wrapper" className="main-container">
      <div className="main-container p-4 md:p-6 bg-gray-100 min-h-screen">
        <button
          onClick={() => navigate(`/projects/${projectUuid}`)}
          className="mb-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <MdArrowBack className="mr-2" size={18} />
          {text?.backToBuildings || "Back to Buildings"}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 space-y-6">
            <BuildingBasicInfo building={building} params={text?.basicInfo || {}} onEdit={handleEditBasicInfo} />
            <BuildingContactInfo building={building} params={text?.contactInfo || {}} onAddContact={handleAddContact} />
          </div>
          <div className="lg:w-2/3 bg-white rounded-lg shadow">
            <BuildingTabs params={text?.tabs || {}} buildingUuid={buildingUuid} projectUuid={projectUuid} />
          </div>
        </div>
      </div>
      </div>
      <Modals
        isEditBuildingModalOpen={isEditBuildingModalOpen}
        closeEditBuildingModal={closeEditBuildingModal}
        editingBuilding={building}
        handleBuildingUpdated={handleBuildingUpdated}
        isAddContactModalOpen={isAddContactModalOpen}
        closeAddContactModal={closeAddContactModal}
        targetBuildingUuidForContact={building?.uuid}
        handleContactAdded={handleContactAdded}
      />
      
    </>
  );
}