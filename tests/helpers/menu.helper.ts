import {
  convertToLocationSectionList,
  convertToSectionList,
} from "../../helpers/convertToSectionList";
import { IUserDetails } from "../../interfaces";
import { dbClient } from "./database.helper";

export const getRestaurantsByLogedInUser = async (
  logedInUser: IUserDetails | null
) => {
  if (logedInUser?.role === "flapjack") {
    const { data, error } = await dbClient
      .from("restaurants")
      .select("id,name,location");
    if (error) {
      return [];
    }
    return data;
  } else {
    const { data, error } = await dbClient
      .from("restaurants")
      .select("id,name,location")
      .eq("id", logedInUser?.restaurant_id);
    if (error) {
      return [];
    }
    return data;
  }
};
const sortAssetsImages = async () => {
  const { data: globalTemplates, error: globalTemplatesError } = await dbClient
    .from("assets")
    .select("id, createdBy, content ,restaurant_id (id, name)")
    .order("created_at", { ascending: false });
  if (globalTemplatesError) {
    return [];
  }
  const sectionedList = Object?.values(
    convertToSectionList(globalTemplates, true)
  );
  return sectionedList ?? [];
};
export const getElementsWithRestaurant = async (
  user: IUserDetails | null,
  templateId?: number
) => {
  const elements = await dbClient
    .from("ElementLibrary")
    .select(
      "id,created_at,element,template_id,createdBy,thumbnail,location,restaurant_id (id, name)"
    )
    .order("created_at", { ascending: false });
  //Refactor data according to requirements
  const elementList = elements?.data?.map((item: any, i) => {
    const imagePath = `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/elementsThumbnail/${
      item.thumbnail
    }?${i}${Date.now()}`;

    return {
      id: item?.id?.toString(),
      createdBy: item?.createdBy || null,
      restaurant_id: item?.restaurant_id?.id,
      template_id: item?.template_id,
      location: item?.location,
      meta: {
        uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
        blockType: "//ly.img.ubq/text",
        thumbUri: imagePath,
        width: 100,
        height: 10,
        value: item?.element,
        name: item?.restaurant_id?.id,
      },
      context: {
        sourceId: "Custom component",
      },
      resturantDetail: item?.restaurant_id,
    };
  });
  //Current  templates Elemnts or user restayran elements
  const libraryElements =
    user?.role == "flapjack"
      ? elementList?.filter((item: any) => {
          if (!templateId) {
            return item;
          }
          return item?.template_id === templateId;
        })
      : elementList?.filter(
          (item: any) => item?.restaurant_id?.toString() === user?.restaurant_id
        );
  //Reactor restaurant list base on name
  const restaurantList = Object.values(convertToSectionList(elementList));
  //Refactor based on restaurant locaton
  const locationSectionedList = convertToLocationSectionList(libraryElements);
  //Element section list based on user
  const ElementsSectionList =
    user?.role == "flapjack"
      ? restaurantList
      : locationSectionedList?.length > 1
      ? locationSectionedList
      : [];
  const globalTemplates =
    user?.role == "flapjack" ? await sortAssetsImages() : [];

  return {
    libraryElements: libraryElements ?? [],
    ElementsSectionList: ElementsSectionList ?? [],
    globalTemplates,
  };
};
