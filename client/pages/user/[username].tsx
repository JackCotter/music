import { useAuthContext } from "@/contexts/authContext";
import {
  getUser,
  listProject,
  listProjectTracks,
  patchUser,
} from "@/utils/apiUtils";
import { commitHistoryToActivityCalendar } from "@/utils/calendarUtils";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ActivityCalendar, { Activity } from "react-activity-calendar";
import styles from "@/styles/pages/user.module.scss";
import ProjectCard from "@/components/projectCard";
import EditIcon from "@mui/icons-material/Edit";
import { useFormik } from "formik";
import { useMutation } from "react-query";

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const { isAuthenticated } = useAuthContext();
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<User>();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const getUserData = async (username: string) => {
    const userInfo = await getUser(username);
    setUserInfo(userInfo);
    formik.setFieldValue("description", userInfo.description);
  };
  const getUserContrubutions = async (username: string) => {
    const userContributions = await listProjectTracks(username);
    const activityHistory: Activity[] =
      commitHistoryToActivityCalendar(userContributions);
    setActivityHistory(activityHistory);
  };
  const getProjectList = async (username: string) => {
    const projectList = await listProject(username);
    setProjectList(projectList);
  };

  useEffect(() => {
    if (username === undefined) return;
    if (typeof username === "string") {
      getUserData(username);
      getUserContrubutions(username);
      getProjectList(username);
    } else {
      console.log("Error: username is not a string");
    }
  }, [username]);

  const { mutate: updateDescription, isLoading } = useMutation(
    async () => {
      await patchUser(formik.values.description);
    },
    {
      onSuccess: () => {
        setIsEditing(false);
        if (username === undefined) return;
        getUserData(username as string);
      },
      onError: () => {
        setIsEditing(false);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      description: "",
    },
    onSubmit: async () => {
      await updateDescription();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack className={styles.outerWrapper} direction="column" spacing={2}>
        <Typography className={styles.username} variant="h4">
          {username}
        </Typography>
        {isAuthenticated && (
          <div className={styles.editButtonContainer}>
            {isEditing ? (
              <Button
                className={styles.editButton}
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
              >
                Save
              </Button>
            ) : (
              <IconButton
                className={styles.editButton}
                aria-label="edit"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon />
              </IconButton>
            )}
          </div>
        )}
        <Stack
          className={styles.descriptionContainer}
          direction="row"
          spacing={0}
        >
          {!isEditing ? (
            <Typography className={styles.description} variant="body1">
              {userInfo?.description}
            </Typography>
          ) : (
            <TextField
              className={styles.description}
              name="description"
              id="description"
              variant="outlined"
              fullWidth
              multiline
              spellCheck={false}
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          className={styles.activityCalendarRow}
        >
          <div className={styles.activityCalendarContainer}>
            {activityHistory.length > 0 ? (
              <ActivityCalendar data={activityHistory} weekStart={0} />
            ) : (
              <div>No activity</div>
            )}
          </div>
        </Stack>
      </Stack>
      <Grid
        className={styles.projectCardGrid}
        container
        direction="row"
        spacing={2}
      >
        {projectList.map((project) => (
          <Grid
            key={project.projectid}
            item
            xs={12}
            sm={6}
            md={6}
            lg={4}
            xl={3}
          >
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </form>
  );
};

export default UserProfile;
