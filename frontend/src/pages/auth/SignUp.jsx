import React, { useState } from "react";
import "./../../assets/styles/forms.css";
import InputEntry from "./InputEntry";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";

import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import { BiHide, BiShow } from "react-icons/bi";
import { signup } from "../../../services/ApiService";

const cookies = new Cookies(null, { path: "/" });

async function submitData(event, params, setErrorMsg, language = 'en') {
  event.preventDefault();
  setErrorMsg(false);

  const firstName = event.currentTarget.querySelector("#name").value.trim();
  const lastName = event.currentTarget.querySelector("#surname").value.trim();
  const password = event.currentTarget.querySelector("#password").value;
  const confirmPassword = event.currentTarget.querySelector("#confirm-password").value;

  if (!firstName || !lastName) {
    setErrorMsg(params.errorNameRequired);
    return;
  }

  if (password !== confirmPassword) {
    setErrorMsg(params.passwords_not_match);
    return;
  }

  const payload = {
    email: event.currentTarget.querySelector("#email").value,
    password: password,
    first_name: firstName,
    last_name: lastName,
  };

  try {
    const response = await signup(payload, language);
    console.log("Signup successful:", response);
    cookies.set("token", response.token, {
      path: "/",
      expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
    });
    window.location.href = "/";
  } catch (error) {
    console.error("Signup error:", error);
    if (error.response?.status === 400) {
      const data = error.response?.data;
      
      // Check for password validation errors
      if (data?.password) {
        const passwordErrors = data.password;
        if (Array.isArray(passwordErrors) && passwordErrors.length > 0) {
          setErrorMsg(passwordErrors[0]);
        } else {
          setErrorMsg(data?.password || params.errorMessage);
        }
      } else {
        const backendError =
          data?.error || data?.email?.[0] || data?.non_field_errors?.[0];
        if (
          backendError &&
          (backendError.includes("already exists") ||
            backendError.includes("user with this email") ||
            backendError.includes("This field must be unique"))
        ) {
          setErrorMsg(params.errorMessage);
        } else {
          setErrorMsg(backendError || params.errorMessage);
        }
      }
    } else {
      setErrorMsg(params.errorGeneral);
    }
  }
}

function SignUpForm({ params }) {
  const { language } = useLanguage();
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  function handleConfirmPassword() {
    const value =
      document.getElementById("confirm-password").value ===
      document.getElementById("password").value;
    setPasswordsMatch(value);
  }

  return (
    <div id="form-container" className="">
      <form
        id="register-form"
        onSubmit={(event) => submitData(event, params, setErrorMsg, language)}>
        <div>
          <div className="logo-img"></div>
          <h2 className="register-title">{params.h2}</h2>
          <p className="alt-option">
            {params.p1}
            <a href="/login" className="link-text">
              {params.a}
            </a>
            {params.p2}
          </p>
          <div className="mt-4 grid grid-cols-1 items-start gap-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex gap-2">
                <InputEntry
                  entry={params.name}
                  id="name"
                  type="text"
                  example={params.name_example}
                />
                <InputEntry
                  entry={params.surname}
                  id="surname"
                  type="text"
                  example={params.surname_example}
                />
              </div>
              <InputEntry
                entry={params.email}
                id="email"
                type="email"
                example={params.email_example}
              />
              <div className="relative">
                <InputEntry
                  entry={params.password}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  example={params.password_text}
                />
                <button
                  type="button"
                  id="show-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center bg-transparent border-none cursor-pointer mt-[25px] pr-[9px] hover:text-primary">
                  {showPassword ? <BiShow /> : <BiHide />}
                </button>
              </div>
              <div className="relative">
                <InputEntry
                  entry={params.confirm_password}
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  example={params.password_text}
                  method={handleConfirmPassword}
                />
                <button
                  type="button"
                  id="show-confirm-password"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center bg-transparent border-none cursor-pointer mt-[25px] pr-[9px] hover:text-primary">
                  {showConfirmPassword ? <BiShow /> : <BiHide />}
                </button>
              </div>
              {!passwordsMatch && (
                <div className="text-red-500 text-[12px] justify-self-center mt-2">
                  {params.passwords_not_match}
                </div>
              )}
            </div>
          </div>
        </div>
        {errorMsg && (
          <div className="text-red-500 text-[12px] text-center mt-2">
            {typeof errorMsg === "string" ? errorMsg : params.errorMessage}
          </div>
        )}
        <button id="submit-form" type="submit" className="mt-6">
          {params.save}
        </button>
      </form>
    </div>
  );
}

export default function SignUp() {
  const { language, toggleLanguage } = useLanguage();
  const params = language === "en" ? english_text.SignUp : greek_text.SignUp;

  return (
    <div id="sign-screen">
      <div id="toggle-language">
        <button className="justify-self-end pr-6 pt-3" onClick={toggleLanguage}>
          {params.lang}
        </button>
      </div>
      <div className="form-wrapper">
        <SignUpForm params={params} />
      </div>
    </div>
  );
}
