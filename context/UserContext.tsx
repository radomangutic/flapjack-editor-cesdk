import { useEffect, useState, createContext, useContext } from "react";
import {
  useUser,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { IUserDetails } from "../interfaces";

interface UserContextType {
  user: IUserDetails | null;
  isAuthenticated: boolean
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false
});

export const useUserContext = () => useContext(UserContext)

export interface Props {
  children: React.ReactNode
}

export const UserContextProvider = ({ children }: Props) => {
  const { isLoading, supabaseClient: supabase } = useSessionContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabaseUser = useUser();
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);

  useEffect(() => {
    if (supabaseUser?.id) {
      setIsAuthenticated(true)
      supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser?.id)
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            setUserDetails(null);
            return;
          }
          if (data?.restaurant_id) {
            const { data: restaurantData } = await supabase
              .from("restaurants")
              .select("*")
              .eq("id", data?.restaurant_id)
              .single();
            data.restaurant = restaurantData;
          }
          setUserDetails({
            ...data,
          });

        });
    } else if (!supabaseUser && !isLoading) {
      setIsAuthenticated(false)
      setUserDetails(null);
    }
  }, [isLoading, supabase, supabaseUser]);

  return <UserContext.Provider value={{ user: userDetails, isAuthenticated }}>{children}</UserContext.Provider>;
};
