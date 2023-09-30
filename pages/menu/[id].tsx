import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";
import { getUser } from "../../hooks";
import PrivatePage from "../../components/PrivatePage/PrivatePage";
import { convertToSectionList } from "../../helpers/convertToSectionList";

const Menu = ({
  data,
  elementsList,
  sectionedList,
  globalTemplates,
}: {
  data: ITemplateDetails;
  elementsList: any;
  sectionedList?: any;
  globalTemplates: any;
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
      : elementsList.filter(
          (item: any) => item?.restaurant_id === user?.restaurant_id
        );

  return (
    <>
      <Editor
        template={data}
        elementsList={elements}
        sectionedList={sectionedList}
        globalTemplates={user?.role === "flapjack" ? globalTemplates : []}
      />
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
    const elements = await supabase
      .from("ElementLibrary")
      .select("*")
      .order("created_at", { ascending: false });
    elementList = elements?.data?.map((item, i) => {
      const imagePath = `${
        process.env.NEXT_PUBLIC_SUPABASE_URL
      }/storage/v1/object/public/elementsThumbnail/${
        item.thumbnail
      }?${i}${Date.now()}`;

      return {
        id: item?.id?.toString(),
        createdBy: item?.createdBy || null,
        restaurant_id: item?.restaurant_id,
        meta: {
          uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
          blockType: "//ly.img.ubq/text",
          thumbUri: imagePath,
          width: 100,
          height: 10,
          value: item?.element,
          name: item?.restaurant_id,
        },
        context: {
          sourceId: "Custom component",
        },
      };
    });
  }

  const sortResData = () => {
    const sectionedList = Object.values(convertToSectionList(elementList));
    const responseList = sectionedList?.map(async (item: any) => {
      const resturantDetail = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", item?.restaurant_id)
        .single();

      return {
        ...item,
        resturantDetail: resturantDetail?.data,
      };
    });
    return Promise.all(responseList);
  };
  const sortAssetsImages = async () => {
    const { data: globalTemplates, error: globalTemplatesError } =
      await supabase
        .from("assets")
        .select("id, createdBy, content ,restaurant_id");
    const sectionedList = Object.values(convertToSectionList(globalTemplates));
    const responseList = sectionedList?.map(async (item: any) => {
      const resturantDetail = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", item?.restaurant_id)
        .single();

      return {
        ...item,
        resturantDetail: resturantDetail?.data,
      };
    });
    return Promise.all(responseList);
  };
  const sortedData = await sortResData();
  const globalTemplates = await sortAssetsImages();
  const response = await globalTemplates?.filter((item) => {
    const exist = sortedData?.find(
      (i) => i?.restaurant_id === item?.restaurant_id
    );
    return !exist && true;
  });

  return {
    props: {
      data: data ? data[0] : null,
      elementsList: elementList,
      sectionedList: sortedData,
      globalTemplates: response,
    }, // will be passed to the page component as props
  };
}

export default Menu;
