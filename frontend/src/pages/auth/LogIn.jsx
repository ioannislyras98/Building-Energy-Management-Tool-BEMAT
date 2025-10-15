import $ from "jquery";
import React, { useState } from "react";
import "./../../assets/styles/forms.css";
import InputEntry from "./InputEntry";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import { BiHide, BiShow } from "react-icons/bi";
import API_BASE_URL from "../../config/api";

const cookies = new Cookies(null, { path: "/" });

function LogInForm({ params }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMMessage] = useState(false);
  const [forgotPasswordMessageError, setForgotPasswordMessageError] =
    useState(false);
  const [emailMissed, setEmailMissed] = useState(false);
  const [Loading, setLoading] = useState(false);

  function submitData(event) {
    event.preventDefault();

    const payload = {
      email: $(event.currentTarget).find("#email").val(),
      password: $(event.currentTarget).find("#password").val(),
    };

    var settings = {
      url: `${API_BASE_URL}/users/login/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(payload),
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        setError(false);
        cookies.set("token", response.token, {
          path: "/",
          expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
        });
        window.location.href = "/";
      })
      .fail((response) => {
        console.log(response);
        setError(true);
      });
  }
  const handleForgotPassword = (event) => {
    event.preventDefault();
    setForgotPasswordMMessage(false);
    setForgotPasswordMessageError(false);
    setEmailMissed(false);
    setLoading(true);
    const email = $("#email").val();

    if (!email) {
      setEmailMissed(true);
      setLoading(false);
      return;
    }
    var settings = {
      url: `${API_BASE_URL}/users/password-reset/`,
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ email: email }),
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        setForgotPasswordMMessage(true);
        setForgotPasswordMessageError(false);
        setLoading(false);
      })
      .fail(function (error) {
        console.log(error);
        setForgotPasswordMessageError(true);
        setForgotPasswordMMessage(false);
        setLoading(false);
      });
  };

  return (
    <div id="form-container" className="w-md h-md">
      <form id="register-form" onSubmit={submitData}>
        <div>
          <div className="logo-img"></div>
          <h2 className="register-title">{params.h2}</h2>
          <p className="alt-option">
            {params.p1}
            <a href="/signup" className="link-text">
              {params.a}
            </a>
            {params.p2}
          </p>
          <div className="mt-8 grid grid-cols-1 items-start gap-3">
            <div className="grid grid-cols-1 gap-3">
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
                  className="pr-10"
                />
                <button
                  type="button"
                  id="show-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center bg-transparent border-none cursor-pointer mt-[25px] pr-[9px] hover:text-primary">
                  {showPassword ? <BiShow /> : <BiHide />}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-[12px] justify-self-center mt-2">
                  {params.notfound}
                </div>
              )}
            </div>
          </div>
        </div>
        <button id="submit-form" type="submit" className="mt-6">
          {params.save}
        </button>
        <div className="text-center mt-4">
          <a
            id="forgot-password"
            className="text-primary text-xs hover:underline cursor-pointer"
            onClick={handleForgotPassword}>
            {params.forgot_password}
          </a>
        </div>
        {Loading && (
          <div role="status" className="flex justify-center items-center mt-4">
            <svg
              aria-hidden="true"
              className=" inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {forgotPasswordMessage && (
          <div className="bg-primary-light font-bold rounded h-[45px] text-primary-bold text-[12px] text-center mt-2">
            {params.forgot_password_message}
          </div>
        )}
        {forgotPasswordMessageError && (
          <div className="text-red-500 text-[12px] text-center mt-2">
            {params.forgot_password_message_error}
          </div>
        )}
        {emailMissed && (
          <div className="text-red-500 text-[12px] text-center mt-2">
            {params.email_missed}
          </div>
        )}
      </form>
    </div>
  );
}

export default function LogIn(data) {
  const { language, toggleLanguage } = useLanguage();
  const params = language === "en" ? english_text.LogIn : greek_text.LogIn;

  return (
    <div id="sign-screen">
      <div id="toggle-language">
        <button className="justify-self-end pr-6 pt-3" onClick={toggleLanguage}>
          {params.lang}
        </button>
      </div>
      <div className="form-wrapper">
        <LogInForm params={params} />
      </div>
    </div>
  );
}
