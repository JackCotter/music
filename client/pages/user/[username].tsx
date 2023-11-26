import { useAuthContext } from "@/contexts/authContext";
import { getUser } from "@/utils/apiUtils";
import { commitHistoryToActivityCalendar } from "@/utils/calendarUtils";
import { act } from "@testing-library/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ActivityCalendar, { Activity } from "react-activity-calendar";

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
    <div>
      {activityHistory.length > 0 ? (
        <ActivityCalendar data={activityHistory} weekStart={0} />
      ) : (
        <div>No activity</div>
      )}
    </div>
  );
};

export default UserProfile;
