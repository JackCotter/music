import { useAuthContext } from "@/contexts/authContext";
import { logout } from "@/utils/apiUtils";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

interface LogoutModalProps {
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (isOpen: boolean) => void;
}

const LogoutModal = ({
  isLogoutModalOpen,
  setIsLogoutModalOpen,
}: LogoutModalProps) => {
  const [errorBar, setErrorBar] = useState({ isOpen: false, message: "" });
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const authContext = useAuthContext();
  const router = useRouter();

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
    if (errorBar.isOpen) {
      setErrorBar({ isOpen: false, message: "" });
    }
  };

  const logoutButtonClick = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      authContext.setLoggedOut();
      router.push("/");
      closeLogoutModal();
    } catch {
      setErrorBar({ isOpen: true, message: "An error occured" });
    }
    setIsLoggingOut(false);
  };
  return (
    <Dialog open={isLogoutModalOpen} onClose={closeLogoutModal}>
      <DialogTitle>Are you sure you want to logout?</DialogTitle>
      <Stack direction="column" justifyContent="center" alignItems="center">
        <DialogContent>
          {errorBar.isOpen && (
            <Alert severity="error">{errorBar.message}</Alert>
          )}
          <DialogActions>
            <Button variant="contained" onClick={closeLogoutModal}>
              Cancel
            </Button>
            <Button variant="contained" onClick={logoutButtonClick}>
              Logout
            </Button>
            {isLoggingOut && <CircularProgress />}
          </DialogActions>
        </DialogContent>
      </Stack>
    </Dialog>
  );
};

export default LogoutModal;
