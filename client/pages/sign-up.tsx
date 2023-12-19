import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "@/styles/pages/sign-up.module.scss";
import { useMutation } from "react-query";
import { createUser } from "@/utils/apiUtils";

const SignUp = () => {
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
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="container">
        <Stack
          direction="column"
          className={styles.signupContainer}
          spacing={2}
        >
          <Typography variant="h3" component="div" className={styles.title}>
            Sign Up!
          </Typography>
          <Stack direction="row" spacing={2}>
            <Stack className={styles.leftColumn} direction="column" spacing={2}>
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
              <Button type="submit">Submit</Button>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <div className={styles.rightColumn}>
              <Button>Sign in with Google</Button>
            </div>
          </Stack>
        </Stack>
      </div>
    </form>
  );
};

export default SignUp;
