import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, IconButton } from "@mui/material";
import styles from "@/styles/components/header.module.scss";
import LoginModal from "./modals/loginModal";
import { useAuthContext } from "@/contexts/authContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] =
    React.useState<boolean>(false);
  const authContext = useAuthContext();
  const router = useRouter();

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" className={styles.title}>
            <Link href="/" className={styles.titleLink}>
              Track Track er
            </Link>
          </Typography>
          {authContext.isAuthenticated && (
            <Link href="/project-create">
              <IconButton color="secondary" className={styles.newProjectButton}>
                <AddCircleOutlineIcon className={styles.newProjectIcon} />
              </IconButton>
            </Link>
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
    </>
  );
};

export default Header;
