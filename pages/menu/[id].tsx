import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";
import { getUser } from "../../hooks";
import PrivatePage from "../../components/PrivatePage/PrivatePage";

const Menu = ({
  data,
  elementsList,
}: {
  data: ITemplateDetails;
  elementsList: any;
}) => {
  const user = getUser();
  if (user?.role !== "flapjack") {
    if (!data?.isGlobal && user?.restaurant_id !== data?.restaurant_id) {
      return <PrivatePage login={!user} />;
    }
  }

  if (!data) {
    return <PrivatePage text="The dog ate this menu!" />;
  }
  const elements =
    user?.role === "flapjack"
      ? elementsList
      : elementsList.filter((item: any) => item?.createdBy === user?.id);
  return (
    <>
      <Editor template={data} elementsList={elements} />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);

  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id"
    )
    .eq("id", context?.params?.id);
  let elementList: any;

  if (data) {
    const elements = await supabase.from("ElementLibrary").select("*");

    elementList = elements?.data?.map((item, i) => {
      const imagePath = `${
        process.env.NEXT_PUBLIC_SUPABASE_URL
      }/storage/v1/object/public/elementsThumbnail/${
        item.thumbnail
      }?${i}${Date.now()}`;
      console.log(imagePath);
      
      return {
        id: item?.id?.toString(),
        createdBy: item?.createdBy || null,
        meta: {
          uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
          blockType: "//ly.img.ubq/text",
          thumbUri: imagePath,
          width: 100,
          height: 10,
          value: item?.element,
          name: "dddddwestg",
        },
        context: {
          sourceId: "textgroup",
        },
      };
    });
  }

  return {
    props: { data: data ? data[0] : null, elementsList: elementList }, // will be passed to the page component as props
  };
}

export default Menu;
