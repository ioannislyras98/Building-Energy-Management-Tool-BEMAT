import React, { useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const cookies = new Cookies();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the token cookie
    cookies.remove("token", { path: "/" });
    // Redirect to the login page
    navigate("/login", { replace: true });
  }, [cookies, navigate]);

  return null;
}