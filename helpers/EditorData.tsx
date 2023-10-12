import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { getLogedInUser } from "../tests/helpers/database.helper";
import {
  getRestaurantsByLogedInUser,
} from "../tests/helpers/menu.helper";

export async function getEditorData(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const logedInUser = await getLogedInUser(supabase);
  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id, location"
    )
    .eq("id", context?.params?.id);

  const restaurantList = await getRestaurantsByLogedInUser(logedInUser);
  
  return {
    props: {
      data: data && context?.params?.id ? data[0] : null,
      restaurantList: restaurantList,
      user: logedInUser,
    },
  };
}
