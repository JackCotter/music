import { useAuthContext } from "@/contexts/authContext";
import {
  getUser,
  listProject,
  listProjectTracks,
  pagecountProject,
  patchUser,
} from "@/utils/apiUtils";
import { commitHistoryToActivityCalendar } from "@/utils/calendarUtils";
import {
  Alert,
  AlertColor,
  Button,
  Grid,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import ActivityCalendar, { Activity } from "react-activity-calendar";
import styles from "@/styles/pages/user.module.scss";
import ProjectCard from "@/components/projectCard";
import EditIcon from "@mui/icons-material/Edit";
import { useFormik } from "formik";
import { useMutation } from "react-query";

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const authContext = useAuthContext();
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<User>();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [errorBar, setErrorBar] = useState<{
    show: boolean;
    message: string;
    severity: AlertColor;
  }>({ show: false, message: "", severity: "error" });

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
    const projectList = await listProject(page, username);
    setProjectList(projectList);
  };
  const getPageCount = async () => {
    const pageCount = await pagecountProject();
    setPageCount(pageCount);
  };

  useEffect(() => {
    if (username === undefined) return;
    if (typeof username === "string") {
      getUserData(username);
      getUserContrubutions(username);
      getProjectList(username);
      getPageCount();
    } else {
      console.log("Error: username is not a string");
    }
  }, [username]);

  useEffect(() => {
    const getProjectList = async () => {
      try {
        const projectList = await listProject(page);
        setProjectList(projectList);
      } catch (error) {
        console.error("Error fetching project list", error);
      }
    };
    getProjectList();
  }, [page]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

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
        setErrorBar({
          show: true,
          message: "Error updating description",
          severity: "error",
        });
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
        {authContext.isAuthenticated &&
          userInfo?.username === authContext.username && (
            <div className={styles.editButtonContainer}>
              {errorBar.show && (
                <Alert severity={errorBar.severity}>{errorBar.message}</Alert>
              )}
              {isEditing ? (
                <Stack direction="row">
                  <Button
                    className={styles.editButton}
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={styles.editButton}
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </Stack>
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
              <ActivityCalendar
                data={activityHistory}
                weekStart={0}
                renderBlock={(block, activity) => (
                  <Tooltip
                    placement="top"
                    arrow
                    title={`${activity.count} commits on ${activity.date}`}
                  >
                    {block}
                  </Tooltip>
                )}
              />
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
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Pagination count={pageCount} page={page} onChange={handlePageChange} />
      </Stack>
    </form>
  );
};

export default UserProfile;
