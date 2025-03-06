// import React, { useState, useCallback } from "react";
import "./../App.css";
import Cookies from 'universal-cookie';
// import { UserList } from './components/UserList';
import useLanguage from "../tools/cookies/language-cookie";
import english_text from './../languages/english.json';
import greek_text from './../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

function InputEntry({ type, example }) {
  const classType = ["Name", "Surname"].includes(type) ? "flex-auto w-1/2" : "block";
  return (
    <label className={classType}>
      <span className="text-gray-700 font-bold">{type}</span>
      <input
        type="text"
        className="form-input mt-1 block w-full rounded-md"
        placeholder={example}
      />
    </label>)
}

function SignUpForm({ params }) {
  return (
    <div className="bg-stone-100 px-6 text-gray-900  w-md h-md pb-4 opacity-85 rounded-md">
      <div className="mx-auto max-w-xl py-12 md:max-w-4xl">
        <h2 className="text-2xl font-bold">{params.h2}</h2>
        <p className="mt-2 text-lg text-gray-500">
          {params.p1}
          <a href="/login" className="text-blue-600">
            {params.a}
          </a>{params.p2}
        </p>
        <div className="mt-8 grid grid-cols-1 items-start gap-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-2">
              <InputEntry
                type={params.name}
                example={params.name_example}
              />
              <InputEntry
                type={params.surname}
                example={params.surname_example}
              />
            </div>
            <InputEntry
              type={params.email}
              example={params.email_example}
            />
            {/*bale toggle hide/show pswd me hook ktl*/}
            <InputEntry
              type={params.password}
              example={params.password_text}
            />
            <InputEntry
              type={params.confirm_password}
              example={params.password_text}
            />
          </div>
        </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded float-right">{params.save}</button>
    </div>)
}

export default function SignUp(data) {
  const { language, toggleLanguage } = useLanguage();
  const params = cookies.get("language") === "en" ? english_text.SignUp : greek_text.SignUp;

  return (
    <div className="h-screen w-screen bg-cover bg-linear-to-t from-teal-950 to-stone-900 flex flex-col">
      <div className="text-stone-500 hover:text-stone-100 float-right flex flex-row-reverse">
        <button className="justify-self-end pr-6 pt-3" onClick={toggleLanguage}>{params.lang}</button>
      </div>
      <div className="flex justify-center items-center pt-24">
        <SignUpForm params={params} />
      </div>
    </div>
  );
}

