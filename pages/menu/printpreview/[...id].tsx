import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails, IUserDetails } from "../../../interfaces";
import Editor from "../../../components/Editor/Editor";
import PrivatePage from "../../../components/PrivatePage/PrivatePage";
import { getLogedInUser } from "../../../tests/helpers/database.helper";

const Menu = ({
  data,
  layout,
  user,
}: {
  data: ITemplateDetails;
  images: string[];
  user: IUserDetails;
  layout: any;
}) => {
  if (!data) {
    return <PrivatePage text="The dog ate this menu!" />;
  }
  return (
    <>
      <Editor template={data} layout={layout} user={user} preview />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const logedInUser = await getLogedInUser(context);
  console.log(context.params)
  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id"
    )
    .eq("id", context?.params?.id?.[1]);
  const { data: layout } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id"
    )
    .eq("id", context?.params?.id?.[0]);

  const { data: images, error } = await supabase.storage
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
    }, // will be passed to the page component as props
  };
}

export default Menu;
