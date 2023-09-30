export function convertToSectionList (data: any) {
  return data?.reduce((result: any, item: any) => {
    const restaurantId = item.restaurant_id;

    if (!result[restaurantId]) {
      // If the section doesn't exist, create it
      result[restaurantId] = {
        restaurant_id: restaurantId,
        items: []
      };
    }

    // Add the item to the section
    result[restaurantId]?.items?.push(item);

    return result;
  }, {});
}
