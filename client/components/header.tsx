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

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] =
    React.useState<boolean>(false);
  const authContext = useAuthContext();
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" className={styles.title}>
            Track Track er
          </Typography>
          <Link href="/project-create">
            <IconButton color="secondary" className={styles.newProjectButton}>
              <AddCircleOutlineIcon className={styles.newProjectIcon} />
            </IconButton>
          </Link>
          {!authContext.isAuthenticated && (
            <Button
              color="secondary"
              variant="contained"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Login
            </Button>
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
