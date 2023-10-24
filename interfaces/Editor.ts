interface RestaurantDetail {
  id: number;
  created_at: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  location: string[];
}

interface Item {
  id: string;
  createdBy: string;
  restaurant_id: string;
  template_id: string;
  location: string | null;
  meta: Record<string, any>; // Use Record<string, any> if the structure of meta and context is unknown
  context: Record<string, any>;
  resturantDetail: RestaurantDetail; // Note: 'resturantDetail' has the same structure as 'RestaurantDetail' interface
}

export interface RestaurantData {
  resturantDetail: RestaurantDetail;
  restaurant_id: string;
  items: Item[];
}
