import { useEffect, useState, createContext } from "react";
import {
  useUser as useSupaUser,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { IUserDetails } from "../interfaces";
import { getUser } from "../hooks";

interface UserContextType {
  user: IUserDetails | null;
  setUser?: (IUserDetails: IUserDetails | null) => any;
}

export const UserContext = createContext<UserContextType | undefined>({
  user: null,
  setUser: (userDetails: any) => null,
});

export interface Props {
  [propName: string]: any;
}

const UserContextProvider = (props: Props) => {
  const { isLoading, supabaseClient: supabase } = useSessionContext();
  const supabaseUser = useSupaUser();  
  const [user, setuser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);
  const setUser = (userDetails: any) => {
    if (userDetails) {
      setuser(userDetails);
    } else {
      setUserDetails(null);
      localStorage.clear();
    }
  };
  useEffect(() => {
    let data = getUser();
    if (data) {
      setuser(data);
    }
  }, []);
  useEffect(() => {
    if (supabaseUser) {
      setuser(supabaseUser);
    }
  }, [supabaseUser]);
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            setUserDetails({
              ...user,
              subscriptionActive: false,
              subscriptionExpiry: "",
              role: "user",
              restaurant_id: "",
            });
            return;
          }
          if (data?.restaurant_id) {
            const { data: restaurantData } = await supabase
              .from("restaurants")
              .select("*")
              .eq("id", data?.restaurant_id)
              .single();
            data.restaurant = restaurantData;
          } else if (data?.restaurant) {
            delete user.restaurant;
          }
          setUserDetails({
            ...user,
            ...data,
          });
          localStorage.setItem(
            "userData",
            JSON.stringify({ ...user, ...data })
          );
        });
    } else if (!user && !isLoading) {
      setUserDetails(null);
      localStorage.clear();
    }
  }, [user, isLoading, supabase]);

  const value = {
    user: userDetails,
    setUser,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export default UserContextProvider;
