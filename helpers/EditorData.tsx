import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { convertToSectionList } from "./convertToSectionList";

export async function getEditorData(context: GetServerSidePropsContext) {
  try {
    const supabase = createServerSupabaseClient(context);
  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, content, tags, isGlobal, menuSize, restaurant_id"
    )
    .eq("id", context?.params?.id);
  let elementList: any;

  // const elements = await supabase
  //   .from("ElementLibrary")
  //   .select("*")
  //   .order("created_at", { ascending: false });
  // elementList = elements?.data?.map((item, i) => {
  //   const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL
  //     }/storage/v1/object/public/elementsThumbnail/${item.thumbnail
  //     }?${i}${Date.now()}`;

  //   return {
  //     id: item?.id?.toString(),
  //     createdBy: item?.createdBy || null,
  //     restaurant_id: item?.restaurant_id,
  //     meta: {
  //       uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
  //       blockType: "//ly.img.ubq/text",
  //       thumbUri: imagePath,
  //       width: 100,
  //       height: 10,
  //       value: item?.element,
  //       name: item?.restaurant_id,
  //     },
  //     context: {
  //       sourceId: "Custom component",
  //     },
  //   };
  // });

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
        .select("id, createdBy, content ,restaurant_id, height, width")
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
  // const sortedData = await sortResData();
  // const globalTemplates = await sortAssetsImages();
  // const response = await globalTemplates?.map((item) => {
  //   const exist = sortedData?.find(
  //     (i) => i?.restaurant_id === item?.restaurant_id
  //   );
  //   if (exist) {
  //     return {
  //       ...item,
  //       resturantDetail: item?.resturantDetail
  //         ? {
  //           ...item?.resturantDetail,
  //           name: `${item?.resturantDetail?.name}.`,
  //         }
  //         : {
  //           name: `Others.`,
  //         },
  //     };
  //   }
  //   return item;
  // });

  return {
    props: {
      data: data && context?.params?.id ? data[0] : null,
      elementsList: [], // hotfix: this was causing the payload to exceed the limit. When we release this feature, we'll need to make sure that this payload doesn't break the page. We can probably fetch this data client side or when the panel is opened.
      sectionedList: [],
      globalTemplates: [],
    },
  };
  } catch (error) {
    console.error(error);
  }
}
