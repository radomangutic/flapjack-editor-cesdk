import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { dbClient } from "../tests/helpers/database.helper";
import { ITemplateDetails, IUserDetails } from "../interfaces";
import { v4 as uuidv4 } from "uuid";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context.user;
};
export const useSetUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context.setUser;
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
          "id, updatedAt, createdBy, name, description, content, tags, isGlobal, menuSize,restaurant_id, location"
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
          "id, createdBy, updatedAt, name, description, tags, content, isGlobal, menuSize,restaurant_id, location"
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
          "id, createdBy, name, updatedAt, description, tags, content, isGlobal, menuSize,restaurant_id, location"
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
          .select("id, createdBy, content ,restaurant_id, height, width")
          .order("created_at", { ascending: false });

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }
      templateData = globalTemplates;
    } else if (restaurant_id) {
      const { data: globalTemplatesResturantId, error: globalTemplatesError } =
        await dbClient
          .from("assets")
          .select("id, createdBy, content ,restaurant_id, height, width")
          .or(`restaurant_id.eq.${restaurant_id}`);

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplatesResturantId;
    } else if (id) {
      const { data: globalTemplatesUser, error: globalTemplatesError } =
        await dbClient
          .from("assets")
          .select("id, createdBy, content ,restaurant_id, height, width")
          .or(`createdBy.eq.${id}`);

      if (globalTemplatesError) {
        throw globalTemplatesError;
      }

      templateData = globalTemplatesUser;
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
export const fetchResturants = async (): Promise<any[]> => {
  const user = getUser();
  let restaurants;
  if (user) {
    const { role } = user;
    if (role === "flapjack") {
      const { data: restaurantsData, error: restaurantsDataError } =
        await dbClient.from("restaurants").select("*");

      if (restaurantsDataError) {
        throw restaurantsDataError;
      }
      const reseturantOptions = restaurantsData.map((item) => {
        return {
          label: item?.name,
          value: item?.id?.toString(),
          location: item?.location,
        };
      });
      let flapjackRestaurant;
      let otherRestaurants: any = [];
      reseturantOptions.forEach((item) => {
        if (item?.value === "2") {
          flapjackRestaurant = item;
        } else {
          otherRestaurants.push(item);
        }
      });
      restaurants = [flapjackRestaurant, ...otherRestaurants];
    }
  }

  return restaurants ?? [];
};
export const transferTemplate = async (
  templateId: number,
  restaurant_id: string,
  location: string
) => {
  try {
    const { error } = await dbClient
      .from("templates")
      .update({
        restaurant_id,
        location,
      })
      .eq("id", templateId);
    if (error) throw error;
    const { error: updateAssetsError } = await dbClient
      .from("assets")
      .update({
        restaurant_id,
      })
      .eq("template_id", templateId);
    const { error: updateFontsErr } = await dbClient
      .from("fonts")
      .update({
        restaurant_id,
      })
      .eq("template_id", templateId);
    if (updateFontsErr) throw updateFontsErr;
  } catch (error) {}
};

export const uploadCustomFont = async (
  file: any,
  templateId: number | undefined,
  titleFont: string
) => {
  const content = uuidv4();
  const user = getUser();
  const { data, error }: { data: any; error: any } = await dbClient.storage
    .from("fonts")
    .upload(content, file);
  if (error) {
    console.error("error uploading file");
    return error;
  }
  await dbClient.from("fonts").insert({
    content,
    createdBy: user?.id,
    restaurant_id: user?.restaurant_id,
    template_id: templateId,
    name: titleFont,
  });
};
export const fetchFonts = async (): Promise<any[]> => {
  const user = getUser();
  let templateFonts;
  if (user) {
    const { restaurant_id, role, id } = user;
    if (role === "flapjack") {
      const { data: globalFonts, error: globalFontsError } = await dbClient
        .from("fonts")
        .select("*");
      if (globalFontsError) {
        throw globalFontsError;
      }
      templateFonts = globalFonts;
    } else if (restaurant_id) {
      const { data: globalFontsResturantId, error: globalFontsError } =
        await dbClient
          .from("fonts")
          .select("*")
          .or(`restaurant_id.eq.${restaurant_id}`);

      if (globalFontsError) {
        throw globalFontsError;
      }

      templateFonts = globalFontsResturantId;
    } else if (id) {
      const { data: globalFontsUser, error: globalFontsError } = await dbClient
        .from("fonts")
        .select("*")
        .or(`createdBy.eq.${id}`);

      if (globalFontsError) {
        throw globalFontsError;
      }

      templateFonts = globalFontsUser;
    }
  }
  return templateFonts ?? [];
};
export const canCreateTemplate = (user: IUserDetails | null) => {
  return (
    user &&
    (user.subscriptionActive ||
      user.role === "flapjack" ||
      user.role === "user" ||
      user?.role === "owner")
  );
};

export const templateArchive = async (template: ITemplateDetails) => {
  try {
    if (!template?.id) return;
    const { data: archiveTemplate } = await dbClient
      .from("archive_templates")
      .select("*")
      .eq("id", template?.id);
    const newLocation = uuidv4();
    const { error: coppyError }: { data: any; error: any } =
      await dbClient.storage
        .from("templates")
        .copy(template.content, newLocation);
    if (coppyError) throw coppyError;
    let archiveTemplateData = archiveTemplate?.[0];
    if (archiveTemplateData) {
      if (archiveTemplateData?.content?.length <= 4) {
        const content = [
          ...archiveTemplateData.content,
          { content: newLocation, time: new Date() },
        ];
        await dbClient
          .from("archive_templates")
          .update({ content })
          .eq("id", template?.id);
      } else {
        const content = archiveTemplateData.content;
        const { error } = await dbClient.storage
          .from("templates")
          .remove([archiveTemplateData.content?.[0]?.content]);
        if (error) throw error;
        content.shift();
        content.push({ content: newLocation, time: new Date() });
        await dbClient
          .from("archive_templates")
          .update({ content })
          .eq("id", template?.id);
      }
    } else {
      const { error: archiveError } = await dbClient
        .from("archive_templates")
        .insert({
          ...template,
          content: [{ content: newLocation, time: new Date() }],
        })
        .select();
      if (archiveError) throw archiveError; // if error it will return erro
    }
  } catch (err) {
    console.error(err);
  }
};

export function getImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(blob);

    image.onload = () => {
      const width = image.width;
      const height = image.height;
      resolve({ width, height });
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
}

// export const setAllAssetsHeightWidth = async () => {
//   const { data } = await dbClient.from("assets").select("*");
//   if (data) {
//     data.forEach(async (item: any) => {
//       const { width, height } = await getImageDimensionsFromUrl(
//         `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${item?.content}`
//       );
//       await dbClient
//         .from("assets")
//         .update({ width, height })
//         .eq("id", item?.id);
//       console.log("Updated Width", item?.id);
//     });
//   }
// };

// function getImageDimensionsFromUrl(
//   url: string
// ): Promise<{ width: number; height: number }> {
//   console.log("Test132156", url);
//   return new Promise((resolve, reject) => {
//     const image = new Image();
//     image.src = url;

//     image.onload = () => {
//       const width = image.width;
//       const height = image.height;
//       resolve({ width, height });
//     };

//     image.onerror = (error) => {
//       reject(error);
//     };
//   });
// }
