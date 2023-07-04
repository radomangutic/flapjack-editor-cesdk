import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { dbClient } from "../tests/helpers/database.helper";
import { ITemplateDetails } from "../interfaces";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context.user;
};
export const fetchTemplates = async (
  user: any
): Promise<ITemplateDetails[]> => {
  let templateData;
  if (user?.role === "flapjack") {
    const { data: globalTemplates, error: globalTemplatesError } =
      await dbClient
        .from("templates")
        .select(
          "id, createdBy, name, description, content, tags, isGlobal, menuSize"
        )
        .order("templateOrder", { ascending: true });

    if (globalTemplatesError) {
      throw globalTemplatesError;
    }

    templateData = globalTemplates;
  } else if (user?.restaurant_id) {
    // Find restaurant-specific templates based on the restaurant ID
    const { restaurant_id } = user; // Replace 'restaurantId' with the actual field name

    const { data: restaurantTemplates, error: restaurantTemplatesError } =
      await dbClient
        .from("templates")
        .select(
          "id, createdBy, name, description, tags, content, isGlobal, menuSize"
        )
        .or(`restaurant_id.eq.${restaurant_id},isGlobal.eq.true`)
        .order("templateOrder", { ascending: true });

    if (restaurantTemplatesError) {
      throw restaurantTemplatesError;
    }

    templateData = restaurantTemplates;
  } else {
    const { data: restaurantTemplates, error: restaurantTemplatesError } =
      await dbClient
        .from("templates")
        .select(
          "id, createdBy, name, description, tags, content, isGlobal, menuSize"
        )
        .eq("isGlobal", true)
        .order("templateOrder", { ascending: true });

    if (restaurantTemplatesError) {
      throw restaurantTemplatesError;
    }

    templateData = restaurantTemplates;
  }
  return templateData ?? [];
};
