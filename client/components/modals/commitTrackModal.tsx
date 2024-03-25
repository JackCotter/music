import React from "react";
import {
  Dialog,
  TextField,
  Button,
  Select,
  MenuItem,
  FormHelperText,
  DialogActions,
  DialogContent,
  Stack,
  DialogTitle,
  FormControl,
  InputLabel,
  Divider,
  Typography,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { instrumentTypes } from "@/lib/constants";
import styles from "@/styles/components/modals/commitTrackModal.module.scss";
import { createTrack } from "@/utils/apiUtils";
import { useMutation } from "react-query";

interface CommitTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recordedData: Blob | null;
  projectId: string | string[] | undefined;
  accepted?: boolean;
}

const CommitTrackModal = ({
  isOpen,
  onClose,
  onSuccess,
  recordedData,
  projectId,
  accepted,
}: CommitTrackModalProps) => {
  const [errorBar, setErrorBar] = React.useState({
    isOpen: false,
    message: "",
  });
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    instrument: Yup.string().required("Instrument is required"),
  });
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      instrument: "",
    },
    validationSchema,
    onSubmit: () => trackCreateMutation(),
  });

  const createTracks = async () => {
    if (recordedData !== null && typeof projectId === "string") {
      await createTrack(
        parseInt(projectId),
        formik.values.title,
        formik.values.description,
        formik.values.instrument,
        recordedData,
        accepted
      );
    } else {
      throw new Error("No recording data provided");
    }
  };
  const { mutate: trackCreateMutation } = useMutation(createTracks, {
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      setErrorBar({
        isOpen: true,
        message:
          error.response?.data ??
          "Error creating track, please try again later",
      });
    },
  });

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>Commit Track</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent className={styles.modalContainer}>
          {errorBar.isOpen && (
            <Alert className={styles.errorBar} severity="error">
              {" "}
              {errorBar.message}
            </Alert>
          )}
          <Stack className={styles.containerRow} direction="row" spacing={2}>
            <Stack className={styles.formColumn} direction="column" spacing={2}>
              <TextField
                id="title"
                name="title"
                label="Title"
                InputProps={{ inputProps: { maxLength: 30 } }}
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                id="description"
                name="description"
                label="Description"
                InputProps={{ inputProps: { maxLength: 100 } }}
                multiline
                minRows={4}
                maxRows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
              <FormControl>
                <InputLabel
                  error={
                    formik.touched.instrument &&
                    formik.errors.instrument !== undefined
                  }
                >
                  Instrument
                </InputLabel>
                <Select
                  id="instrument"
                  name="instrument"
                  label="Instrument"
                  value={formik.values.instrument}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.instrument &&
                    Boolean(formik.errors.instrument)
                  }
                >
                  {instrumentTypes.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.instrument && formik.errors.instrument && (
                  <FormHelperText error>
                    {formik.errors.instrument}
                  </FormHelperText>
                )}
              </FormControl>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack className={styles.descriptionColumn} direction="column">
              <Typography variant="h5">
                Contribute your Track to this project! Please add a descriptive
                title, interesting description, and what instrument you are
                contributing. Lets make music!
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>close</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CommitTrackModal;
