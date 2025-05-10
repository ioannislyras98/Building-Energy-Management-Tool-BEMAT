
//router
import { useNavigate } from "react-router-dom"
//css
import "./../css/forms.css";//components
//cookie
import Cookies from 'universal-cookie';
import { useLanguage } from "../context/LanguageContext"; // Updated import
//language
import english_text from '../languages/english.json';
import greek_text from '../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

function PageNotFound () {
    const { language, toggleLanguage } = useLanguage();
    const params = language === "en" ? english_text.PageNotFound : greek_text.PageNotFound;
    return (
    <div>
      <h1>{params.h1}</h1>
      <p>{params.p}</p>
      <p>{params.p1} <a href="/">{params.link}</a> {params.p2}</p>
    </div>
  )};

  export default PageNotFound;