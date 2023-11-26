import { useAuthContext } from "@/contexts/authContext";
import { getUser } from "@/utils/apiUtils";
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

  useEffect(() => {
    const getUserContrubutions = async (username: string) => {
      const usercontributions = await getUser(username);
      const activityHistory: Activity[] =
        commitHistoryToActivityCalendar(usercontributions);
      console.log(activityHistory);

      setActivityHistory(activityHistory);
    };
    if (username === undefined) return;
    if (typeof username === "string") {
      getUserContrubutions(username);
    } else {
      console.log("Error: username is not a string");
    }
  }, [username]);
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h4">{username}</Typography>
      <Stack direction="row" spacing={2} className={styles.activityCalendarRow}>
        <div className={styles.activityCalendarContainer}>
          {activityHistory.length > 0 ? (
            <ActivityCalendar data={activityHistory} weekStart={0} />
          ) : (
            <div>No activity</div>
          )}
        </div>
      </Stack>
    </Stack>
  );
};

export default UserProfile;
