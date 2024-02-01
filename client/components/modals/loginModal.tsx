import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { login } from "@/utils/apiUtils";
import { useMutation } from "react-query";
import { useAuthContext } from "@/contexts/authContext";
import { useState } from "react";
import styles from "@/styles/components/modals/loginModal.module.scss";

interface LoginModalProps {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}
const LoginModal = ({
  isLoginModalOpen,
  setIsLoginModalOpen,
}: LoginModalProps) => {
  const authContext = useAuthContext();
  const [errorBar, setErrorBar] = useState({ isOpen: false, message: "" });

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid Email Format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit: () => loginMutation(),
  });

  const loginQuery = async (): Promise<string> => {
    return await login(formik.values.email, formik.values.password);
  };

  const { mutate: loginMutation, isLoading } = useMutation(loginQuery, {
    onSuccess: (a: string) => {
      authContext.setLoggedIn();
      authContext.setUsername(a);
      setIsLoginModalOpen(false);
    },
    onError: (error: Error) => {
      console.log(error);
      setErrorBar({ isOpen: true, message: "Incorrect Username or Password" });
    },
  });

  return (
    <Dialog open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <form onSubmit={formik.handleSubmit} name="login">
          <Stack
            className={styles.inputFieldContainer}
            direction="column"
            spacing={2}
          >
            {errorBar.isOpen && (
              <Alert severity="error">{errorBar.message}</Alert>
            )}
            <TextField
              label="Email"
              name="email"
              type="text"
              className={styles.inputField}
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.errors.email !== undefined}
              helperText={formik.errors.email}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              className={styles.inputField}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.errors.password !== undefined}
              helperText={formik.errors.password}
            />
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => setIsLoginModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Login
              </Button>
              {isLoading && <CircularProgress />}
            </DialogActions>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
