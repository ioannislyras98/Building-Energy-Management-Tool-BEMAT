import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("token") || null;

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(token);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }
  else{
    if(location.pathname === "/login" || location.pathname === "/signup"){
      return (
        <Navigate to="/" state={{ from: location }} replace />
      );
    }
  }
  return <Outlet />;
};
