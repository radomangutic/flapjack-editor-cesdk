import { User } from "@supabase/supabase-js";

export interface IUserDetails extends User {
  subscriptionActive: boolean;
  subscriptionExpiry: string;
  role: string;
}
