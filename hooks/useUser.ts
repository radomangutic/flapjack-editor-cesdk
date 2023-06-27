import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { dbClient } from "../tests/helpers/database.helper";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context.user;
};

export const userProfile = async (userId: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [userProfileData, setuserProfileData] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: user, error: userError } = await dbClient
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setuserProfileData(user);
    };
    fetchUserProfile();
  }, [userId]);

  return userProfileData;
};
