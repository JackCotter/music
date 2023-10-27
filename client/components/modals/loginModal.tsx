import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { login } from "@/utils/apiUtils";
import { useMutation } from "react-query";
import { useAuthContext } from "@/contexts/authContext";

interface LoginModalProps {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}
const LoginModal = ({
  isLoginModalOpen,
  setIsLoginModalOpen,
}: LoginModalProps) => {
  const authContext = useAuthContext();

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

  const loginQuery = async () => {
    console.log(formik.values.email, formik.values.password);
    login(formik.values.email, formik.values.password);
  };

  const { mutate: loginMutation, isLoading } = useMutation(loginQuery, {
    onSuccess: (a) => {
      authContext.setLoggedIn();
      setIsLoginModalOpen(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Dialog open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack direction="column" spacing={2}>
            <div>
              <TextField
                label="Email"
                name="email"
                type="text"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.errors.email !== undefined}
                helperText={formik.errors.email}
              />
            </div>
            <div>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.errors.password !== undefined}
                helperText={formik.errors.password}
              />
            </div>
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
