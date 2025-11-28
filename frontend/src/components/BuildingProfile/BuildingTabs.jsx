import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import EnergyProfileTabContent from "./EnergyProfileTabContent";
import SystemsTabContent from "./SystemsTabContent";
import ThermalZoneTabContent from "./ThermalZoneTabContent";
import ElectricalConsumptionTabContent from "./ElectricalConsumptionTabContent";
import ScenariosTabContent from "./ScenariosTabContent";
import ResultsTabContent from "./ResultsTabContent";
import ImagesTabContent from "./ImagesTabContent";
import { AdminContext, ResourceContextProvider, Resource } from "react-admin";
import { defaultTheme } from "../../utils/theme";
const dataProvider = {
  getList: (resource, params) => {
    return Promise.resolve({
      data: [],
      total: 0,
    });
  },
  getOne: () => Promise.resolve({ data: {} }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const BuildingTabs = ({ params, buildingUuid, projectUuid, buildingData, scenarioId }) => {
  const navigate = useNavigate();
  // If scenarioId exists, set active tab to Scenarios tab (index 4)
  const [activeTab, setActiveTab] = useState(scenarioId ? 4 : 0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  const tabs = [
    params.energyProfile,
    params.systems,
    params.thermalZones,
    params.electricalConsumptions,
    params.scenarios,
    params.results,
    params.images,
  ];
  const energyProfileParams = {
    content: params?.energyProfileContent,
    addConsumptionBtn:
      params?.addEnergyConsumptionButton || "Add Energy Consumption",
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleTabClick = (index) => {
    // If clicking on Scenarios tab (index 4) and we're already in a scenario,
    // navigate back to the building page without scenarioId
    if (index === 4 && scenarioId) {
      navigate(`/projects/${projectUuid}/buildings/${buildingUuid}`);
    } else {
      setActiveTab(index);
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-gray-100 rounded-xl p-1.5 mb-6 shadow-inner">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 ml-1 transition-all duration-200"
            aria-label="Scroll left">
            <FaChevronLeft className="text-primary" size={16} />
          </button>
        )}
        
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 mr-1 transition-all duration-200"
            aria-label="Scroll right">
            <FaChevronRight className="text-primary" size={16} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex relative gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-shrink-0 py-4 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
                activeTab === index
                  ? "text-white bg-primary shadow-lg transform scale-[1.02] border-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/70 bg-transparent"
              }`}
              onClick={() => handleTabClick(index)}>
              <span
                className={`${
                  activeTab === index ? "font-bold" : "font-medium"
                }`}>
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 min-h-[400px]">
          {activeTab === 0 && (
            <div className="animate-fadeIn">
              <AdminContext dataProvider={dataProvider} theme={defaultTheme}>
                <ResourceContextProvider value="energy_consumptions">
                  <EnergyProfileTabContent
                    buildingUuid={buildingUuid}
                    projectUuid={projectUuid}
                    buildingData={buildingData}
                    params={energyProfileParams}
                  />
                </ResourceContextProvider>
              </AdminContext>
            </div>
          )}
          {activeTab === 1 && (
            <div className="animate-fadeIn">
              <SystemsTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 2 && (
            <div className="animate-fadeIn">
              <ThermalZoneTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 3 && (
            <div className="animate-fadeIn">
              <ElectricalConsumptionTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 4 && (
            <div className="animate-fadeIn">
              <ScenariosTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
                scenarioId={scenarioId}
              />
            </div>
          )}
          {activeTab === 5 && (
            <div className="animate-fadeIn">
              <ResultsTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 6 && (
            <div className="animate-fadeIn">
              <ImagesTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingTabs;
