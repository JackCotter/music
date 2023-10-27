import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import styles from "@/styles/components/header.module.scss";
import LoginModal from "./modals/loginModal";

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] =
    React.useState<boolean>(false);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" className={styles.title}>
            Track Track er
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Login
          </Button>
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
