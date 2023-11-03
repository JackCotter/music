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
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation } from "react-query";
import { createProject } from "@/utils/apiUtils";
import { useRouter } from "next/router";
import AuthWrapper from "@/components/authWrapper";
import { Instrument } from "tone/build/esm/instrument/Instrument";
import InstrumentTypeSelect from "@/components/instrumentTypeSelect";

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
              <InstrumentTypeSelect
                selectedInstruments={formik.values.instruments}
                setSelectedInstruments={(instruments: string[]) =>
                  formik.setFieldValue("instruments", instruments)
                }
              />
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
