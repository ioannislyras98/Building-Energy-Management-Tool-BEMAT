import "./../assets/styles/forms.css";
import Cookies from "universal-cookie";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

function UnauthorizedAccess() {
  const { language, toggleLanguage } = useLanguage();
  const params =
    language === "en"
      ? english_text.UnauthorizedAccess
      : greek_text.UnauthorizedAccess;
  return (
    <div>
      <h1>{params.h1}</h1>
      <p>{params.p}</p>
      <p>
        {params.p1} <a href="/">{params.link}</a> {params.p2}
      </p>
    </div>
  );
}

export default UnauthorizedAccess;
