import { getUser } from "@/utils/apiUtils";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setLoggedIn: () => {},
  setLoggedOut: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setLoggedIn = () => {
    setIsAuthenticated(true);
  };

  const setLoggedOut = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const queryUser = async () => {
      try {
        const username = await getUser();
        if (username) {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    queryUser();
  }, []);
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setLoggedIn, setLoggedOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
