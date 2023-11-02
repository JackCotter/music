import React, { useContext } from "react";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/router";

type AuthWrapperProps = {
  children: React.ReactNode;
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/");
    return;
  }

  return <>{children}</>;
};

export default AuthWrapper;
