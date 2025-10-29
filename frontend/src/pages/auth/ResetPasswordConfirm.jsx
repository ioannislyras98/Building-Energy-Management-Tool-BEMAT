import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./../../assets/styles/forms.css";
import InputEntry from "./InputEntry";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import { BiHide, BiShow } from "react-icons/bi";
import { confirmPasswordReset } from "../../../services/ApiService";

const cookies = new Cookies(null, { path: "/" });

function ResetPasswordConfirmForm({ params }) {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(false);
    setSucceeded(false);

    const newPassword = event.target.newPassword.value;
    const newPasswordConfirm = event.target.newPasswordConfirm.value;

    if (newPassword !== newPasswordConfirm) {
      setPasswordsMatch(true);
      return;
    }

    setError(false);
    setSucceeded(false);
    setPasswordsMatch(false);

    try {
      await confirmPasswordReset(uid, token, newPassword, newPasswordConfirm);
      setSucceeded(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <div id="form-container" className="w-md h-md">
      <form id="register-form" onSubmit={handleSubmit}>
        <div className="logo-img"></div>
        <h2 className="register-title">{params.reset_password}</h2>
        <div className="mt-8 grid grid-cols-1 items-start gap-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <InputEntry
                entry={params.new_password}
                id="newPassword"
                type={showPassword ? "text" : "password"}
                example={params.password_text}
                className="pr-10"
              />
              <button
                type="button"
                id="show_password"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center bg-transparent border-none cursor-pointer mt-[25px] pr-[9px] hover:text-primary">
                {showPassword ? <BiShow /> : <BiHide />}
              </button>
            </div>
          </div>
          <div className="relative">
            <InputEntry
              entry={params.confirm_new_password}
              id="newPasswordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              example={params.password_text}
              className="pr-10"
            />
            <button
              type="button"
              id="show_password_confirm"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center bg-transparent border-none cursor-pointer mt-[25px] pr-[9px] hover:text-primary">
              {showPasswordConfirm ? <BiShow /> : <BiHide />}
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {params.reset_password_error}
          </div>
        )}
        {succeeded && (
          <div className="mb-4 text-primary text-sm text-center">
            {params.reset_password_success}
          </div>
        )}
        {passwordsMatch && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {params.passwords_not_match}
          </div>
        )}
        <button id="submit-form" type="submit" className="mt-6">
          {params.reset_password}
        </button>
      </form>
    </div>
  );
}
export default function ResetPasswordConfirm(data) {
  const { language, toggleLanguage } = useLanguage();
  const params =
    language === "en" ? english_text.ResetPassword : greek_text.ResetPassword;

  return (
    <div id="sign-screen">
      <div id="toggle-language">
        <button className="justify-self-end pr-6 pt-3" onClick={toggleLanguage}>
          {params.lang}
        </button>
      </div>
      <div className="form-wrapper">
        <ResetPasswordConfirmForm params={params} />
      </div>
    </div>
  );
}
