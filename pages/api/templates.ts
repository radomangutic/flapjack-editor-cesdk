import type { NextApiRequest, NextApiResponse } from "next";
import { dbClient } from "../../tests/helpers/database.helper";

type Data = {
  templates?: any[]; // Update this type based on your template structure
  error: String;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { userId } = req.query;
  console.log("userId==>", userId);

  try {
    // Fetch the user details using the userId
    const { data: user, error: userError } = await dbClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      throw userError;
    }

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Use the user details as needed
    console.log("User:", user);
    let templateData;
    if (user?.role === "flapjack") {
      // Find all global templates
      const { data: globalTemplates, error: globalTemplatesError } =
        await dbClient
          .from("templates")
          .select("id, createdBy, name, description, tags, isGlobal, menuSize")
          .eq("isGlobal", true)
          .order("templateOrder", { ascending: true });

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplates;
    } else {
      // Find restaurant-specific templates based on the restaurant ID
      const { restaurant_id } = user; // Replace 'restaurantId' with the actual field name

      const { data: restaurantTemplates, error: restaurantTemplatesError } =
        await dbClient
          .from("templates")
          .select("id, createdBy, name, description, tags, isGlobal, menuSize")
          .eq("restaurant_id", restaurant_id)
          .order("templateOrder", { ascending: true });

      if (restaurantTemplatesError) {
        throw restaurantTemplatesError;
      }

      templateData = restaurantTemplates;
    }
console.log('templateData',templateData);

    res.status(200).json({
      templates: templateData,
      error: "",
    });
  } catch (error) {
    console.log("error", error);

    res.status(500);
  }
}
