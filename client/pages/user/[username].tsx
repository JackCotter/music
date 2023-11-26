import { useAuthContext } from "@/contexts/authContext";
import { getUser, listProjectTracks } from "@/utils/apiUtils";
import { commitHistoryToActivityCalendar } from "@/utils/calendarUtils";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ActivityCalendar, { Activity } from "react-activity-calendar";
import styles from "@/styles/pages/user.module.scss";

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const { isAuthenticated } = useAuthContext();
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<User>();

  useEffect(() => {
    const getUserContrubutions = async (username: string) => {
      const userContributions = await listProjectTracks(username);
      const userInfo = await getUser(username);
      const activityHistory: Activity[] =
        commitHistoryToActivityCalendar(userContributions);

      setActivityHistory(activityHistory);
      setUserInfo(userInfo);
    };
    if (username === undefined) return;
    if (typeof username === "string") {
      getUserContrubutions(username);
    } else {
      console.log("Error: username is not a string");
    }
  }, [username]);
  return (
    <Stack className={styles.outerWrapper} direction="column" spacing={2}>
      <Typography className={styles.username} variant="h4">
        {username}
      </Typography>
      <Stack
        className={styles.descriptionContainer}
        direction="row"
        spacing={2}
      >
        <Typography className={styles.description} variant="body1">
          {userInfo?.description}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} className={styles.activityCalendarRow}>
        <div className={styles.activityCalendarContainer}>
          {activityHistory.length > 0 ? (
            <ActivityCalendar data={activityHistory} weekStart={0} />
          ) : (
            <div>No activity</div>
          )}
        </div>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        className={styles.activityCalendarRow}
      ></Stack>
    </Stack>
  );
};

export default UserProfile;
