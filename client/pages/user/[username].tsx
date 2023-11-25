import { useAuthContext } from "@/contexts/authContext";
import { getUser } from "@/utils/apiUtils";
import { useRouter } from "next/router";
import { useEffect } from "react";

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    const getUserContrubutions = async (username: string) => {
      const usercontributions = await getUser(username);
      console.log(usercontributions);
    };
    if (username === undefined) return;
    if (typeof username === "string") {
      getUserContrubutions(username);
    } else {
      console.log("Error: username is not a string");
    }
  }, [username]);
  return <div>User Profile</div>;
};

export default UserProfile;
