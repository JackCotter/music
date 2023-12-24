import {
  Alert,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "@/styles/pages/sign-up.module.scss";
import { useMutation } from "react-query";
import { createUser } from "@/utils/apiUtils";
import { useRouter } from "next/router";
import { useState } from "react";
import { AxiosError } from "axios";
import ReCAPTCHA from "react-google-recaptcha";

const SignUp = () => {
  const router = useRouter();
  const [errorBar, setErrorBar] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    description: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid Email Format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be > 8 characters")
      .max(30, "Password must be < 30 characters"),
    confirmPassword: Yup.string()
      .required("Password is required")
      .min(8, "Password must be > 8 characters")
      .max(30, "Password must be < 30 characters")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    username: Yup.string().required("Please enter a username"),
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: () => signUpMutate(),
  });

  const signUp = async () => {
    await createUser(
      formik.values.username,
      formik.values.email,
      formik.values.password,
      formik.values.description
    );
  };

  const { mutate: signUpMutate, isLoading } = useMutation(signUp, {
    onSuccess: () => {
      router.push("/");
    },
    onError: (e: AxiosError) => {
      if (!e.response) return;
      setErrorBar({
        isOpen: true,
        message: e.response.data as string,
      });
    },
  });

  const sitekey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className={styles.formContainer}>
        <Stack
          direction="column"
          className={styles.signupContainer}
          spacing={2}
        >
          <Typography variant="h3" component="div" className={styles.whiteText}>
            Sign Up!
          </Typography>
          <Stack direction="row" spacing={2}>
            <Stack className={styles.leftColumn} direction="column" spacing={2}>
              {errorBar.isOpen && (
                <Alert severity="error"> {errorBar.message}</Alert>
              )}
              <TextField
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.errors.email !== undefined}
                helperText={formik.errors.email}
              />
              <TextField
                label="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.errors.username !== undefined}
                helperText={formik.errors.username}
              />
              <TextField
                label="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.errors.password !== undefined}
                type="password"
                helperText={formik.errors.password}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.errors.confirmPassword !== undefined}
                type="password"
                helperText={formik.errors.confirmPassword}
              />
              <TextField
                label="Description"
                name="description"
                multiline
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.errors.description !== undefined}
                helperText={formik.errors.description}
              />
              {sitekey && <ReCAPTCHA theme="dark" sitekey={sitekey} />}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => router.push("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} variant="contained">
                  Submit
                </Button>
              </Stack>
            </Stack>
            <Divider
              className={styles.divider}
              orientation="vertical"
              flexItem
            />
            <Stack
              className={styles.rightColumn}
              direction="column"
              spacing={2}
            >
              <Typography
                className={styles.whiteText}
                variant="h4"
                component="div"
              >
                Why sign up?
              </Typography>
              <Typography
                className={styles.whiteText}
                variant="h6"
                component="div"
              >
                Signing up allows you to create projects, join other projects,
                and create your own tracks!
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </form>
  );
};

export default SignUp;
