import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const cookies = new Cookies();

const ActivityTabContent = ({ building, project }) => {
  const { language } = useLanguage();
  const translations = language === "en" ? english_text.ActivityTab : greek_text.ActivityTab;
  
  // Debug: Log the received props
  console.log("ActivityTabContent received props:", { building, project });
  console.log("Building object keys:", building ? Object.keys(building) : 'building is null/undefined');
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    action_type: '',
    days: ''
  });
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const token = cookies.get("token") || "";

  // Fetch activities for the building
  const fetchActivities = async () => {
    console.log("fetchActivities called with building:", building);
    
    // Try to get UUID from building object
    let buildingUuid = null;
    if (building && building.uuid) {
      buildingUuid = building.uuid;
    } else if (building && building.data && building.data.uuid) {
      buildingUuid = building.data.uuid;
    } else if (building && typeof building === 'string') {
      buildingUuid = building;
    } else {
      // Fallback to a known UUID for testing
      console.log("No building UUID found, using fallback");
      buildingUuid = 'e633a5cc-d5e2-4abf-af62-011b6e2cf70b';
    }
    
    console.log("Using building UUID:", buildingUuid);
    
    setLoading(true);
    setError(null);
    
    try {
      let url = `http://127.0.0.1:8000/building-activities/building/${buildingUuid}/`;
      console.log("Fetching from URL:", url);
      
      // Add query parameters
      const params = new URLSearchParams();
      if (filter.action_type) params.append('action_type', filter.action_type);
      if (filter.days) params.append('days', filter.days);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setActivities(data.results || data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity statistics
  const fetchStats = async () => {
    console.log("fetchStats called with building:", building);
    
    // Try to get UUID from building object (same logic as fetchActivities)
    let buildingUuid = null;
    if (building && building.uuid) {
      buildingUuid = building.uuid;
    } else if (building && building.data && building.data.uuid) {
      buildingUuid = building.data.uuid;
    } else if (building && typeof building === 'string') {
      buildingUuid = building;
    } else {
      // Fallback to a known UUID for testing
      console.log("No building UUID found for stats, using fallback");
      buildingUuid = 'e633a5cc-d5e2-4abf-af62-011b6e2cf70b';
    }
    
    console.log("Using building UUID for stats:", buildingUuid);
    
    setLoadingStats(true);
    
    try {
      const url = `http://127.0.0.1:8000/building-activities/building/${buildingUuid}/stats/`;
      console.log("Fetching stats from URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Stats response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received stats data:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [building, filter]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get icon for activity type
  const getActivityIcon = (activityType) => {
    const iconMap = {
      'create': '➕',
      'update': '✏️', 
      'delete': '🗑️',
      'contact': '👤',
      'image': '🖼️',
      'system': '⚙️',
      'material': '🧱',
      'energy': '⚡',
      'calculation': '🧮',
      'export': '📤',
      'import': '📥',
      'other': '📝',
    };
    return iconMap[activityType] || '📝';
  };

  // Get color class for activity type
  const getActivityColor = (activityType) => {
    const colorMap = {
      'create': 'text-green-600 bg-green-50',
      'update': 'text-blue-600 bg-blue-50',
      'delete': 'text-red-600 bg-red-50',
      'contact': 'text-purple-600 bg-purple-50',
      'image': 'text-pink-600 bg-pink-50',
      'system': 'text-indigo-600 bg-indigo-50',
      'material': 'text-yellow-600 bg-yellow-50',
      'energy': 'text-orange-600 bg-orange-50',
      'calculation': 'text-teal-600 bg-teal-50',
      'export': 'text-gray-600 bg-gray-50',
      'import': 'text-cyan-600 bg-cyan-50',
      'other': 'text-gray-500 bg-gray-50',
    };
    return colorMap[activityType] || 'text-gray-500 bg-gray-50';
  };

  // Action type options for filter
  const actionTypeOptions = [
    { value: '', label: translations.allTypes || 'Όλοι οι Τύποι' },
    { value: 'create', label: translations.create || 'Δημιουργία' },
    { value: 'update', label: translations.update || 'Ενημέρωση' },
    { value: 'delete', label: translations.delete || 'Διαγραφή' },
    { value: 'contact', label: translations.contact || 'Επαφή' },
    { value: 'image', label: translations.image || 'Εικόνα' },
    { value: 'system', label: translations.system || 'Σύστημα' },
    { value: 'material', label: translations.material || 'Υλικό' },
    { value: 'energy', label: translations.energy || 'Ενέργεια' },
    { value: 'calculation', label: translations.calculation || 'Υπολογισμός' },
    { value: 'export', label: translations.export || 'Εξαγωγή' },
    { value: 'import', label: translations.import || 'Εισαγωγή' },
    { value: 'other', label: translations.other || 'Άλλο' },
  ];

  const timeFilterOptions = [
    { value: '', label: translations.allTime || 'Όλος ο Χρόνος' },
    { value: '1', label: translations.lastDay || 'Τελευταία Ημέρα' },
    { value: '7', label: translations.lastWeek || 'Τελευταία Εβδομάδα' },
    { value: '30', label: translations.lastMonth || 'Τελευταίος Μήνας' },
    { value: '90', label: translations.last3Months || 'Τελευταίοι 3 Μήνες' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{translations.loading || "Φόρτωση..."}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <div className="text-lg mb-2">{translations.errorLoading || "Σφάλμα κατά τη φόρτωση"}</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {translations.title || "Ιστορικό Δραστηριοτήτων"}
          </h2>
          {!loadingStats && stats && (
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>
                <strong>{stats.total_activities}</strong> {translations.totalActivities || "συνολικές δραστηριότητες"}
              </span>
              <span>
                <strong>{stats.recent_activities}</strong> {translations.recentActivities || "πρόσφατες (7 ημέρες)"}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.filterByType || "Φίλτρο κατά Τύπο"}
            </label>
            <select
              name="action_type"
              value={filter.action_type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {actionTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.filterByTime || "Φίλτρο κατά Χρόνο"}
            </label>
            <select
              name="days"
              value={filter.days}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Statistics */}
        {!loadingStats && stats && stats.activities_by_type && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {stats.activities_by_type.slice(0, 4).map((item, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{item.count}</div>
                <div className="text-xs text-gray-600">
                  {actionTypeOptions.find(opt => opt.value === item.action_type)?.label || item.action_type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">{translations.noActivities || "Δεν βρέθηκαν δραστηριότητες"}</div>
            <div className="text-sm">{translations.noActivitiesDesc || "Οι δραστηριότητες θα εμφανιστούν εδώ καθώς γίνονται αλλαγές στο κτίριο."}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border-l-4 border-blue-200 bg-gray-50 rounded-r-lg">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.action_type)}`}>
                  {getActivityIcon(activity.action_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{activity.created_at_formatted}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{activity.time_since}</span>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      <strong>{translations.user || "Χρήστης"}:</strong> {activity.user_display_name}
                    </span>
                    <span>
                      <strong>{translations.type || "Τύπος"}:</strong> {activity.action_type_display}
                    </span>
                    {activity.extra_data && Object.keys(activity.extra_data).length > 0 && (
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        {translations.viewDetails || "Προβολή λεπτομερειών"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTabContent;
