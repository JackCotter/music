import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import styles from "@/styles/pages/project-create.module.scss";
import { instrumentTypes } from "@/lib/constants";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation } from "react-query";
import { createProject } from "@/utils/apiUtils";
import { useRouter } from "next/router";
import AuthWrapper from "@/components/authWrapper";

const ProjectCreate = () => {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      projectName: "",
      instruments: [],
      strictMode: false,
    },
    validationSchema: yup.object({
      projectName: yup.string().required("Project Name is required"),
    }),
    onSubmit: () => createProjectMutation(),
  });

  const createProjectQuery = async (): Promise<{ projectId: string }> => {
    return await createProject(
      formik.values.projectName,
      formik.values.instruments,
      formik.values.strictMode
    );
  };

  const { mutate: createProjectMutation, isLoading } = useMutation(
    createProjectQuery,
    {
      onSuccess(data: { projectId: string }) {
        router.push(`/project/${data.projectId}`);
      },
      onError(error) {
        console.log(error);
      },
    }
  );

  return (
    <AuthWrapper>
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.projectCreateContainer}>
          <Stack
            className={styles.formContainer}
            direction="column"
            spacing={2.5}
          >
            <Typography variant="h2" className={styles.lightTypography}>
              Create a new Project
            </Typography>
            <Divider className={styles.divider} />
            <Stack direction="row" spacing={2}>
              <TextField
                color="primary"
                label="Project Name"
                name="projectName"
                className={styles.projectNameInput}
                onChange={formik.handleChange}
                error={
                  formik.touched.projectName &&
                  Boolean(formik.errors.projectName)
                }
                helperText={
                  formik.touched.projectName && formik.errors.projectName
                }
              />
              <FormControl
                className={styles.selectContainer}
                color="primary"
                sx={{ m: 1, width: 300 }}
              >
                <InputLabel id="instrumentTypeSelect">
                  Desired Instrument Types
                </InputLabel>
                <Select
                  labelId="instrumentTypeSelect"
                  label="Desired Instrument Types"
                  name="instruments"
                  multiple
                  value={formik.values.instruments}
                  onChange={formik.handleChange}
                  input={
                    <OutlinedInput
                      id="select-multiple-chip"
                      label="Select Desired Instruments"
                    />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value: string) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {instrumentTypes.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Divider className={styles.divider} />
            <Stack direction="column" spacing={2}>
              <Stack
                className={styles.strictModeRow}
                direction="row"
                spacing={2}
              >
                <Typography variant="h5" className={styles.lightTypography}>
                  Enable Instrument Strict Mode?
                </Typography>
                <Checkbox
                  name="strictMode"
                  onChange={formik.handleChange}
                  color="primary"
                />
              </Stack>
              <Typography
                className={styles.strictModeHelperText}
                variant="body1"
              >
                Strict mode will prevent contrubutions that include instruments
                that are not in the selected instrument types.
              </Typography>
            </Stack>
            <Stack
              className={styles.submitButtonRow}
              direction="row"
              spacing={2}
            >
              <Button variant="contained" color="secondary">
                {" "}
                Cancel{" "}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {" "}
                Create{" "}
              </Button>
              {isLoading && <CircularProgress />}
            </Stack>
          </Stack>
        </div>
      </form>
    </AuthWrapper>
  );
};

export default ProjectCreate;
