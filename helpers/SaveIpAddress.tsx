import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";

export async function saveIpAdddressData(context: GetServerSidePropsContext) {
  try {
    const supabase = createServerSupabaseClient(context);
    const { req, res, params } = context;
    const forwarded = req.headers["x-forwarded-for"]
    const ip = forwarded ? (forwarded as string).split(/, /)[0] : req.connection.remoteAddress
    // Add the IP address to the database
    const { data, error } = await supabase
      .from('tv_menu_ips')
      .insert([{ ip_address: ip, slug: params?.slug }]);

    return {
      props: {

      },
    };
  } catch (error) {
    throw error;
  }
}
