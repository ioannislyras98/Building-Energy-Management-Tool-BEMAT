import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import InputEntryModal from "../modals/shared/InputEntryModal";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import Cookies from "universal-cookie";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../../services/ApiService";

const cookies = new Cookies(null, { path: "/" });

export default function Settings() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params =
    language === "en" ? english_text.Settings || {} : greek_text.Settings || {};

  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    current_password: "",
  });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [language]);

  const fetchUserData = async () => {
    const token = cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await $.ajax({
        url: `${API_BASE_URL}/users/me/`,
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.data) {
        setUserData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
          current_password: "",
        });
      }
    } catch (error) {
      setError(
        language === "en"
          ? "Failed to load user data"
          : "Αποτυχία φόρτωσης στοιχείων χρήστη"
      );
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!userData.current_password.trim()) {
      setError(
        language === "en"
          ? "Current password is required"
          : "Ο τρέχων κωδικός απαιτείται"
      );
      setLoading(false);
      return;
    }

    const token = cookies.get("token");

    try {
      await $.ajax({
        url: `${API_BASE_URL}/users/update-profile/`,
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Language": language === "en" ? "en" : "gr",
        },
        data: JSON.stringify(userData),
      });

      setMessage(
        params.profileUpdated ||
          (language === "en"
            ? "Profile updated successfully!"
            : "Το προφίλ ενημερώθηκε επιτυχώς!")
      );
      setUserData((prev) => ({ ...prev, current_password: "" }));
    } catch (error) {
      setError(
        language === "en"
          ? "Failed to update profile"
          : "Αποτυχία ενημέρωσης προφίλ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (passwords.new_password !== passwords.confirm_password) {
      setError(
        language === "en"
          ? "New passwords don't match"
          : "Οι νέοι κωδικοί δεν ταιριάζουν"
      );
      setLoading(false);
      return;
    }

    if (passwords.new_password.length < 8) {
      setError(
        language === "en"
          ? "Password must be at least 8 characters"
          : "Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες"
      );
      setLoading(false);
      return;
    }

    const token = cookies.get("token");

    try {
      await $.ajax({
        url: `${API_BASE_URL}/users/change-password/`,
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Language": language === "en" ? "en" : "gr",
        },
        data: JSON.stringify({
          old_password: passwords.current_password,
          new_password: passwords.new_password,
          new_password_confirm: passwords.confirm_password,
        }),
      });

      setMessage(
        params.passwordChanged ||
          (language === "en"
            ? "Password changed successfully!"
            : "Ο κωδικός άλλαξε επιτυχώς!")
      );
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      setError(
        language === "en"
          ? "Failed to change password"
          : "Αποτυχία αλλαγής κωδικού"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserDataChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordsChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="admin-container p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <FaArrowLeft className="mr-2" size={18} />
              {params.back || (language === "en" ? "Back" : "Επιστροφή")}
            </button>
            <div className="flex items-center space-x-2">
              <FaUser className="text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">
                {params.title || (language === "en" ? "Settings" : "Ρυθμίσεις")}
              </h1>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-600">
          {params.description ||
            (language === "en"
              ? "Manage your account settings and preferences"
              : "Διαχειριστείτε τις ρυθμίσεις και τις προτιμήσεις του λογαριασμού σας")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg mb-6">
          <nav className="flex space-x-8 border-b border-gray-200 px-6 pt-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <FaUser className="inline mr-2" />
              {params.profile || (language === "en" ? "Profile" : "Προφίλ")}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <FaLock className="inline mr-2" />
              {params.password || (language === "en" ? "Password" : "Κωδικός")}
            </button>
          </nav>

          <div className="p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputEntryModal
                    entry={
                      params.firstName ||
                      (language === "en" ? "First Name" : "Όνομα")
                    }
                    id="first_name"
                    type="text"
                    value={userData.first_name}
                    onChange={handleUserDataChange}
                    example={
                      language === "en"
                        ? "Enter your first name"
                        : "Εισάγετε το όνομά σας"
                    }
                    required
                  />

                  <InputEntryModal
                    entry={
                      params.lastName ||
                      (language === "en" ? "Last Name" : "Επώνυμο")
                    }
                    id="last_name"
                    type="text"
                    value={userData.last_name}
                    onChange={handleUserDataChange}
                    example={
                      language === "en"
                        ? "Enter your last name"
                        : "Εισάγετε το επώνυμό σας"
                    }
                    required
                  />

                  <div className="md:col-span-2">
                    <InputEntryModal
                      entry={
                        params.email ||
                        (language === "en"
                          ? "Email Address"
                          : "Διεύθυνση Email")
                      }
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={handleUserDataChange}
                      example={
                        language === "en"
                          ? "Enter your email"
                          : "Εισάγετε το email σας"
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputEntryModal
                      entry={
                        params.currentPasswordVerification ||
                        (language === "en"
                          ? "Current Password (required for verification)"
                          : "Τρέχων Κωδικός (απαιτείται για επαλήθευση)")
                      }
                      id="current_password"
                      type="password"
                      value={userData.current_password}
                      onChange={handleUserDataChange}
                      example={
                        params.currentPasswordPlaceholder ||
                        (language === "en"
                          ? "Enter your current password"
                          : "Εισάγετε τον τρέχοντα κωδικό σας")
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaSave className="mr-2" size={16} />
                    {loading
                      ? params.saving ||
                        (language === "en" ? "Saving..." : "Αποθήκευση...")
                      : params.saveChanges ||
                        (language === "en"
                          ? "Save Changes"
                          : "Αποθήκευση Αλλαγών")}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-6">
                  <InputEntryModal
                    entry={
                      params.currentPassword ||
                      (language === "en"
                        ? "Current Password"
                        : "Τρέχων Κωδικός")
                    }
                    id="current_password"
                    type="password"
                    value={passwords.current_password}
                    onChange={handlePasswordsChange}
                    example={
                      language === "en"
                        ? "Enter your current password"
                        : "Εισάγετε τον τρέχοντα κωδικό"
                    }
                    required
                  />

                  <InputEntryModal
                    entry={
                      params.newPassword ||
                      (language === "en" ? "New Password" : "Νέος Κωδικός")
                    }
                    id="new_password"
                    type="password"
                    value={passwords.new_password}
                    onChange={handlePasswordsChange}
                    example={
                      language === "en"
                        ? "Enter new password"
                        : "Εισάγετε νέο κωδικό"
                    }
                    required
                  />

                  <InputEntryModal
                    entry={
                      params.confirmPassword ||
                      (language === "en"
                        ? "Confirm New Password"
                        : "Επιβεβαίωση Νέου Κωδικού")
                    }
                    id="confirm_password"
                    type="password"
                    value={passwords.confirm_password}
                    onChange={handlePasswordsChange}
                    example={
                      language === "en"
                        ? "Confirm new password"
                        : "Επιβεβαιώστε τον νέο κωδικό"
                    }
                    required
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaLock className="mr-2" size={16} />
                    {loading
                      ? params.changing ||
                        (language === "en" ? "Changing..." : "Αλλαγή...")
                      : params.changePassword ||
                        (language === "en"
                          ? "Change Password"
                          : "Αλλαγή Κωδικού")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
