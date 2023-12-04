import { getUserLoggedIn } from "@/utils/apiUtils";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  setUsername: (username: string) => void;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: "",
  setUsername: () => {},
  setLoggedIn: () => {},
  setLoggedOut: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>("");

  const setLoggedIn = () => {
    setIsAuthenticated(true);
  };

  const setLoggedOut = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const queryUser = async () => {
      try {
        const username = await getUserLoggedIn();
        if (username) {
          setIsAuthenticated(true);
          setUsername(username);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    queryUser();
  }, []);
  console.log("AuthContextProvider", isAuthenticated, username);
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        setUsername,
        setLoggedIn,
        setLoggedOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
