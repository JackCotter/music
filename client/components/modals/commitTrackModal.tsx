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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { instrumentTypes } from "@/lib/constants";
import styles from "@/styles/components/modals/commitTrackModal.module.scss";

interface CommitTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordedData: Blob | null;
}

const CommitTrackModal = ({
  isOpen,
  onClose,
  recordedData,
}: CommitTrackModalProps) => {
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
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>Commit Track</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack className={styles.containerRow} direction="row" spacing={2}>
            <Stack className={styles.formColumn} direction="column" spacing={2}>
              <TextField
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                id="description"
                name="description"
                label="Description"
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
