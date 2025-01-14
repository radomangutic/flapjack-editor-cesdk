import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails, IUserDetails } from "../../../interfaces";
import Editor from "../../../components/Editor/Editor";
import PrivatePage from "../../../components/PrivatePage/PrivatePage";
import { getLogedInUser } from "../../../tests/helpers/database.helper";
import { useState } from 'react'

/**
 * This route is used as a "print preview" that allows the user to see what their menu will look before downloading it.
 * It is used primarily for laying out several menus onto a single page.
 */

const Menu = ({
  data,
  layout,
  user,
  menuContent
}: {
  data: ITemplateDetails;
  images: string[];
  user: IUserDetails;
  layout: any;
  menuContent: ITemplateDetails;
}) => {
  const [loader, setloader] = useState(false);
  if (!data) {
    return <PrivatePage text="The dog ate this menu!" />;
  }
  return (
    <>
      <Editor
        menuContent={menuContent}
        template={layout}
        layout={data}
        user={user}
        allowExport={true}
        preview
        loader={loader}
        setloader={setloader}
      />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const logedInUser = await getLogedInUser(context);
  // console.log(context.params)
  const { data, error } = await supabase
    .from("menu_preview")
    .select("*"
    )
    .eq("menu_id", context?.params?.id?.[0]);

  // console.log(data, "this is an error")
  const { data: layout } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id"
    )
    .eq("id", context?.params?.id?.[1]);
  // Get data from the actual menu that is being previewed
  const { data: menuContent } = await supabase
    .from("templates")
    .select(
      "name"
    )
    .eq("id", context?.params?.id?.[0]);
  const { data: images } = await supabase.storage
    .from("renderings")
    .list(`${context?.params?.id}`, {
      limit: 6,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  let imageUrls: string[] = [];
  if (images?.length) {
    images.forEach(async (image, i) => {
      const {
        data: { publicUrl: imageUrl },
      } = await supabase.storage
        .from("renderings")
        .getPublicUrl(`${context?.params?.id}/${image.name}`);
      imageUrls.push(imageUrl);
    });
  }
  return {
    props: {
      data: data ? data[0] : null,
      layout: layout ? layout[0] : null,
      images: imageUrls,
      user: logedInUser,
      menuContent: menuContent ? menuContent[0] : null
    }, // will be passed to the page component as props
  };
}

export default Menu;
