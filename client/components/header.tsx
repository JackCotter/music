import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, IconButton } from "@mui/material";
import styles from "@/styles/components/header.module.scss";
import LoginModal from "./modals/loginModal";
import { useAuthContext } from "@/contexts/authContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useRouter } from "next/router";
import { logout } from "@/utils/apiUtils";
import LogoutModal from "./modals/logoutModal";

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] =
    React.useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] =
    React.useState<boolean>(false);
  const authContext = useAuthContext();
  const router = useRouter();

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" className={styles.title}>
            <Link href="/" className={styles.titleLink}>
              {process.env.NEXT_PUBLIC_APP_NAME ?? "Project Tracker"}
            </Link>
          </Typography>
          {authContext.isAuthenticated && (
            <div>
              <Link href="/project-create">
                <IconButton
                  color="secondary"
                  className={styles.dashboardRightButton}
                >
                  <AddCircleOutlineIcon className={styles.dashboardRightIcon} />
                </IconButton>
              </Link>
              <Link href={`/user/${authContext.username}`}>
                <IconButton
                  color="secondary"
                  className={styles.dashboardRightButton}
                >
                  <AccountCircleIcon className={styles.dashboardRightIcon} />
                </IconButton>
              </Link>
              <IconButton
                color="secondary"
                className={styles.dashboardRightButton}
                onClick={() => setIsLogoutModalOpen(true)}
                aria-label="logoutButton"
              >
                <LogoutIcon className={styles.dashboardRightIcon} />
              </IconButton>
            </div>
          )}
          {!authContext.isAuthenticated && (
            <div className={styles.authButtons}>
              <Button
                name="signup"
                className={styles.authButton}
                color="primary"
                variant="contained"
                onClick={() => router.push("/sign-up")}
              >
                Sign Up
              </Button>
              <Button
                name="login"
                className={styles.authButton}
                color="primary"
                variant="contained"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <LoginModal
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
      <LogoutModal
        isLogoutModalOpen={isLogoutModalOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
      />
    </>
  );
};

export default Header;
