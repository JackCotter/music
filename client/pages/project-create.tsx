import {
  Box,
  Card,
  Chip,
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

const ProjectCreate = () => {
  const formik = useFormik({
    initialValues: {
      projectName: "",
      instruments: [],
    },
    validationSchema: yup.object({
      projectName: yup.string().required("Project Name is required"),
      instruments: yup.array().required("At least one instrument is required"),
    }),
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack className={styles.formContainer} direction="column" spacing={2}>
        <Typography variant="h2" className={styles.projectCreateTitle}>
          Create a new Project
        </Typography>
        <Divider className={styles.divider} />
        <Stack direction="row" spacing={2}>
          <TextField
            color="secondary"
            label="Project Name"
            className={styles.projectNameInput}
          />
          <FormControl
            className={styles.selectContainer}
            color="secondary"
            sx={{ m: 1, width: 300 }}
          >
            <InputLabel id="instrumentTypeSelect">
              Select Desired Instrument Types
            </InputLabel>
            <Select
              labelId="instrumentTypeSelect"
              name="instruments"
              multiple
              value={formik.values.instruments}
              onChange={formik.handleChange}
              // sx={{
              //   color: "white",
              //   ".MuiOutlinedInput-notchedOutline": {
              //     borderColor: "rgba(228, 219, 233, 0.25)",
              //   },
              //   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              //     borderColor: "rgba(228, 219, 233, 0.25)",
              //   },
              //   "&:hover .MuiOutlinedInput-notchedOutline": {
              //     borderColor: "rgba(228, 219, 233, 0.25)",
              //   },
              //   ".MuiSvgIcon-root ": {
              //     fill: "white !important",
              //   },
              // }}
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
      </Stack>
    </form>
  );
};

export default ProjectCreate;
