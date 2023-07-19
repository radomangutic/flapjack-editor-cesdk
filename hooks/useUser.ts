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
          "id, createdBy, name, description, content, tags, isGlobal, menuSize,restaurant_id"
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
          "id, createdBy, name, description, tags, content, isGlobal, menuSize,restaurant_id"
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
          "id, createdBy, name, description, tags, content, isGlobal, menuSize,restaurant_id"
        )
        .order("templateOrder", { ascending: true });

    if (restaurantTemplatesError) {
      throw restaurantTemplatesError;
    }

    templateData = restaurantTemplates?.filter(
      (item) => item?.isGlobal || item?.createdBy == user?.id
    );
  }
  return templateData ?? [];
};
export const fetchAssets = async (): Promise<any[]> => {
  const user = getUser();
  let templateData;
  if (user) {
    const { restaurant_id, role, id } = user;
    if (role === "flapjack") {
      const { data: globalTemplates, error: globalTemplatesError } =
        await dbClient
          .from("assets")
          .select("id, createdBy, content ,restaurant_id");

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplates;
    } else if (restaurant_id) {
      const { data: globalTemplates, error: globalTemplatesError } =
        await dbClient
          .from("assets")
          .select("id, createdBy, content ,restaurant_id")
          .or(`restaurant_id.eq.${restaurant_id}`);

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplates;
    } else {
      const { data: globalTemplates, error: globalTemplatesError } =
        await dbClient
          .from("assets")
          .select("id, createdBy, content ,restaurant_id")
          .or(`createdBy.eq.${id}`);

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplates;
    }
  }

  return templateData ?? [];
};

export const getUser = () => {
  const user = localStorage.getItem("userData");
  if (user) {
    const userData = JSON.parse(user);
    return userData;
  }
  return null;
};
