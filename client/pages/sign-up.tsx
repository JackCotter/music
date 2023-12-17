import { Button, Stack, TextField } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const SignUp = () => {
  const initialValues = {
    email: "",
    password: "",
    username: "",
    description: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid Email Format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must be less than 30 characters"),
    username: Yup.string().required("Please enter a username"),
    description: Yup.string(),
  });
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack direction="column">
        <TextField
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.errors.email !== undefined}
          helperText={formik.errors.email}
        />
        <TextField
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          error={formik.errors.username !== undefined}
          helperText={formik.errors.username}
        />
        <TextField
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.errors.password !== undefined}
          helperText={formik.errors.password}
        />
        <TextField
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.errors.description !== undefined}
          helperText={formik.errors.description}
        />
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
};

export default SignUp;
