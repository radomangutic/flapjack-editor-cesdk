import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ITemplateDetails } from "../interfaces";

export const useTemplateActions = (
  templates: ITemplateDetails[],
  setTemplates: React.Dispatch<React.SetStateAction<ITemplateDetails[]>>,
  setNavMenu: (value: string) => void
) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const user = useUser();
  const deleteTemplate = async (id: number) => {
    try {
      if (id) {
        const { error, status } = await supabase
          .from("templates")
          .delete()
          .eq("id", id);
        if (error) throw error;
        if (status === 204) {
          let filteredItem = templates.filter((template) => template.id !== id);
          await setTemplates(filteredItem);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renameTemplate = async ({
    id,
    name,
    description,
  }: {
    id: number;
    name: string;
    description: string;
  }) => {
    try {
      if (id) {
        const { error } = await supabase
          .from("templates")
          .update({ name, description })
          .eq("id", id);
        if (error) throw error;

        // Get updated template
        await refreshTemplate(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const duplicateTemplate = async ({
    id,
    name,
    description,
  }: {
    id: number;
    name: string;
    description: string;
  }) => {
    try {

      if (id) {
        const { data, error } = await supabase
          .from("templates")
          .select("name, description, content, isGlobal")
          .eq("id", id);
        if (error) throw error;
        const { data: duplicateData, error: duplicateError } = await supabase
          .from("templates")
          .insert({
            name,
            description,
            content: data[0].content,
            createdBy: user?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .select();
        if (duplicateError) throw duplicateError;
        const { data: imagesData, error: imagesError } = await supabase.storage
          .from("renderings")
          .list(id.toString());
        let thumbnailError;
        imagesData?.forEach(async (imageUrl) => {
          const { data: duplicateImagesData, error: duplicateImagesError } = await supabase.storage
            .from("renderings")
            .copy(`${id.toString()}/${imageUrl.name}`, `${duplicateData[0].id}/${imageUrl.name}`);
          thumbnailError = duplicateImagesError
        });
        if (thumbnailError) throw thumbnailError;
        // Add new  template in myMenu
        router.push("/templates");
        setNavMenu("myMenu");
        await refreshTemplate(duplicateData[0].id);
      }
    } catch (err) {
      console.error(err);
    }

  };

  const globalTemplate = async (template: ITemplateDetails, id: string) => {
    try {
      if (template?.id) {
        const { error } = await supabase
          .from("templates")
          .update(
            template.isGlobal
              ? { createdBy: id, isGlobal: false }
              : { isGlobal: true }
          )
          .eq("id", template?.id);
        if (error) throw error;
        // Get updated template
        router.push("/templates");
        setNavMenu(template.isGlobal ? "myMenu" : "templates");
        refreshTemplate(template?.id)
      }
    } catch (err) {
      console.error(err);
    }
  }
  const refreshTemplate = async (id: number) => {
    try {
      if (id) {
        const { error, status, data } = await supabase
          .from("templates")
          .select("*")
          .eq("id", id);
        if (error) throw error;
        if (status === 200) {
          const templateIndex = templates.findIndex(
            (template) => template.id === id
          );
          if(templateIndex === -1){
            const addNewTemplate = templates.concat(data as any)
            setTemplates(addNewTemplate)
          }else{
            const updatedTemplates = [...templates];
            updatedTemplates[templateIndex] = data[0] as ITemplateDetails;
            await setTemplates(updatedTemplates);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { deleteTemplate, renameTemplate, globalTemplate, duplicateTemplate };
}
