import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { convertToSectionList } from "./convertToSectionList";
import { RestaurantData } from "../interfaces/Editor";

export async function getEditorData(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id, location"
    )
    .eq("id", context?.params?.id);
  let elementList: any;

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
      template_id: item?.template_id,
      location: item?.location,
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
  const getElementResDetail = () => {
    const responseList = elementList?.map(async (item: any) => {
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
  const ListWithName = await getElementResDetail();

  const sortResData = () => {
    const sectionedList: RestaurantData[] = Object.values(
      convertToSectionList(ListWithName)
    );
    return Promise.all(sectionedList);
  };
  const sortAssetsImages = async () => {
    const { data: globalTemplates, error: globalTemplatesError } =
      await supabase
        .from("assets")
        .select("id, createdBy, content ,restaurant_id")
        .order("created_at", { ascending: false });
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
  const response = await globalTemplates?.map((item) => {
    const exist = sortedData?.find(
      (i) => i?.restaurant_id === item?.restaurant_id
    );
    if (exist) {
      return {
        ...item,
        resturantDetail: item?.resturantDetail
          ? {
              ...item?.resturantDetail,
              name: `${item?.resturantDetail?.name}.`,
            }
          : {
              name: `Others.`,
            },
      };
    }
    return item;
  });

  return {
    props: {
      data: data && context?.params?.id ? data[0] : null,
      elementsList: ListWithName,
      sectionedList: sortedData,
      globalTemplates: response,
    },
  };
}
