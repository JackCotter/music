import React, { useContext, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/authContext";
import { useRouter } from "next/router";

type AuthWrapperProps = {
  children: React.ReactNode;
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/").then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router])

  if (loading) {
    return <div>loading...</div>
  }
  return <>{children}</>;
};

export default AuthWrapper;
