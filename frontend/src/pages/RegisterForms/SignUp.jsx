// import React, { useState, useCallback } from "react";

//jquery
import $ from "jquery";
//hooks
import React, { useState } from 'react';
//css
import "./../../css/forms.css";
//components
import InputEntry from "./InputEntry";
//cookie
import Cookies from 'universal-cookie';
import useLanguage from "../../tools/cookies/language-cookie";
//language
import english_text from '../../languages/english.json';
import greek_text from '../../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

function submitData(event, data) {
  const payload = {
    "email": $(event.currentTarget).find("#email").val(),
    "password": $(event.currentTarget).find("#password").val(),     //pswd encrypted?
    "first_name": $(event.currentTarget).find("#name").val(),
    "last_name": $(event.currentTarget).find("#surname").val()
  }
}

function SignUpForm({ params }) {
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  function handleConfirmPassword(event) {
    const value = $("#confirm-password").val() === $("#password").val();
    setPasswordsMatch(value);
  }

  return (
    <div id="form-container" className="w-md h-md">
      <form id="register-form" onSubmit={submitData}>
        <div>
          <div class="logo-img"></div>
          <h2 className="register-title">{params.h2}</h2>
          <p className="alt-option">
            {params.p1}
            <a href="/login" className="link-text">
              {params.a}
            </a>{params.p2}
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
              {/*bale toggle hide/show pswd me hook ktl*/}
              <InputEntry
                entry={params.password}
                id="password"
                type="password"
                example={params.password_text}
                // method={handleConfirmPassword}
              />
              <InputEntry
                entry={params.confirm_password}
                id="confirm-password"
                type="password"
                example={params.password_text}
                method={handleConfirmPassword}
              />
              {!passwordsMatch && (
                <div className="text-red-500 text-[12px] text-end mr-6">
                  Passwords do not match.
                </div>
              )}
            </div>
          </div>
        </div>
        <button id="submit-form" type="submit" className="mt-6">{params.save}</button>
      </form>
    </div>)
}

export default function SignUp(data) {
  const { language, toggleLanguage } = useLanguage();
  const params = cookies.get("language") === "en" ? english_text.SignUp : greek_text.SignUp;

  return (
    <div id="sign-screen">
      <div id="toggle-language">
        <button className="justify-self-end pr-6 pt-3" onClick={toggleLanguage}>{params.lang}</button>
      </div>
      <div className="flex justify-center items-center pt-24">
        <SignUpForm params={params} />
      </div>
    </div>
  );
}

