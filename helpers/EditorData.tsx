import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { getLogedInUser } from "../tests/helpers/database.helper";
import { getRestaurantsByLogedInUser } from "../tests/helpers/menu.helper";

export async function getEditorData(context: GetServerSidePropsContext) {
  try {
    const supabase = createServerSupabaseClient(context);
    const logedInUser = await getLogedInUser(context);
    const { data } = await supabase
      .from("templates")
      .select(
        "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id, location, printPreview"
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
  } catch (error) {
    throw error;
  }
}

export const removeAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];

    const eqPos = cookie.indexOf("=");

    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
