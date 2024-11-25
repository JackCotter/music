import React, { useContext, useEffect } from "react";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/router";

type AuthWrapperProps = {
  children: React.ReactNode;
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return;
  }

  return <>{children}</>;
};

export default AuthWrapper;
