export function convertToSectionList(data: any,imageType:boolean=false) {
  return data?.reduce((result: any, item: any) => {
    const restaurantId = imageType?item.restaurant_id?.id:item.restaurant_id;

    if (!result[restaurantId]) {
      // If the section doesn't exist, create it
      result[restaurantId] = {
        resturantDetail:imageType?item?.restaurant_id:item?.resturantDetail,
        restaurant_id: restaurantId,
        items: [],
      };
    }

    // Add the item to the section
    result[restaurantId]?.items?.push(item);

    return result;
  }, {});
}
export function convertToLocationSectionList(data: any) {
  const newList = data?.reduce((result: any, item: any) => {
    const restaurantId = item.location ? item.location : item?.resturantDetail?.name;

    if (!result[restaurantId]) {
      // If the section doesn't exist, create it
      result[restaurantId] = {
        restaurant_id: restaurantId,
        items: [],
        resturantDetail: {
          name: restaurantId,
        },
      };
    }

    // Add the item to the section
    result[restaurantId]?.items?.push(item);

    return result;
  }, {});
  const updateName = Object.values(newList).map((item) => {
    return item;
  });
  return updateName;
}
