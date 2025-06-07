import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import { MdEdit, MdArrowBack } from "react-icons/md";
import BuildingBasicInfo from "../components/BuildingProfile/BuildingBasicInfo";
import BuildingContactInfo from "../components/BuildingProfile/BuildingContactInfo";
import BuildingTabs from "../components/BuildingProfile/BuildingTabs";
import Cookies from "universal-cookie";
import $ from "jquery";
import { useModals } from "../hooks/useModals";
import { Modals } from "../components/Modals";

const cookies = new Cookies(null, { path: "/" });

export default function BuildingProfilePage() {
  const { projectUuid, buildingUuid } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text =
    language === "en"
      ? english_text.BuildingProfile
      : greek_text.BuildingProfile;

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
    const token = cookies.get("token");
    if (!token) {
      setError(text?.errors?.auth || "Authentication required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    $.ajax({
      url: `http://127.0.0.1:8000/buildings/get/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        setBuilding(data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error fetching building details:", err);
        setError(
          err.responseJSON?.error ||
            text?.errors?.generic ||
            "Failed to fetch building details."
        );
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    if (buildingUuid) {
      fetchBuildingDetails();
    }
  }, [buildingUuid, text]);

  const handleEditBasicInfo = () => {
    console.log("Edit Basic Info button clicked");
    if (building) {
      openEditBuildingModal();
    }
  };

  const handleAddContact = () => {
    console.log("Add Contact button clicked");
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

  const handleContactEdited = (editedContact) => {
    fetchBuildingDetails();
  };

  const handleContactDeleted = (deletedContact) => {
    fetchBuildingDetails();
  };

  const handleDeleteBuilding = (buildingToDelete) => {
    const token = cookies.get("token");
    if (!token) {
      alert(text?.errors?.auth || "Authentication required.");
      return;
    }

    const settings = {
      url: `http://127.0.0.1:8000/buildings/delete/${buildingToDelete.uuid}/`,
      method: "DELETE",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    $.ajax(settings)
      .done(function (response) {
        console.log("Building deleted successfully:", response);
        // Navigate back to buildings list
        navigate(`/projects/${projectUuid}`);
      })
      .fail(function (error) {
        console.error("Error deleting building:", error);
        alert(
          text?.errors?.generic ||
            "An error occurred while deleting the building."
        );
      });
  };

  if (loading) {
    return (
      <div className="p-6">
        {text?.loading || "Loading building profile..."}
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!building) {
    return (
      <div className="p-6">
        {text?.errors?.notFound || "Building not found."}
      </div>
    );
  }

  return (
    <>
      <div id="projects-wrapper" className="main-container">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          {" "}
          <div className="bg-white shadow-xl border-b border-gray-200 backdrop-blur-sm">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => {
                      console.log("Back to Buildings button clicked");
                      navigate(`/projects/${projectUuid}`);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <MdArrowBack className="mr-2" size={18} />
                    {text?.backToBuildings || "Back to Buildings"}
                  </button>{" "}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                      {text?.projectLabel || "Project"}
                    </span>
                    <div className="relative">
                      <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent drop-shadow-sm">
                        {building?.project_name || "Project Name"}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3 space-y-6">
                <BuildingBasicInfo
                  building={building}
                  params={text?.basicInfo || {}}
                  onEdit={handleEditBasicInfo}
                  onDelete={handleDeleteBuilding}
                />
                <BuildingContactInfo
                  building={building}
                  params={text?.contactInfo || {}}
                  onAddContact={handleAddContact}
                  onEditContact={handleContactEdited}
                  onDeleteContact={handleContactDeleted}
                />
              </div>
              <div className="lg:w-2/3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <BuildingTabs
                  params={text?.tabs || {}}
                  buildingUuid={buildingUuid}
                  projectUuid={projectUuid}
                  buildingData={building}
                />
              </div>
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
