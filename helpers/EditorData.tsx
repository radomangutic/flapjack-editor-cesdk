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
  var cookies = document.cookie.split("; ");
  console.log("cookies", cookies);
  for (var c = 0; c < cookies.length; c++) {
    var d = window.location.hostname.split(".");
    while (d.length > 0) {
      var cookieBase =
        encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) +
        "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" +
        d.join(".") +
        " ;path=";
      var p = location.pathname.split("/");
      document.cookie = cookieBase + "/";
      while (p.length > 0) {
        document.cookie = cookieBase + p.join("/");
        p.pop();
      }
      d.shift();
    }
  }
};
