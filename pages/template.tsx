import { useState, useEffect, useCallback } from "react";
import { IFont, ITemplate } from "../interfaces";
import { useDialog, useUser } from "../hooks";
import {
  useSupabaseClient,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import AuthDialog from "../components/AuthDialog";
import Editor from "../components/Editor/Editor";

export const WRAPPER_PADDING = 10;

const Template = ({ drawerOpened }: { drawerOpened: boolean }) => {
  const [editor, setEditor] = useState<object | null>(null);
  const [selectedFont, setSelectedFont] = useState<IFont | null>(null);
  const [template, setTemplate] = useState<ITemplate | null>(null);
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);
  const supabase = useSupabaseClient();
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && selectedFont) {
      sessionStorage.removeItem("bodyFontSize");
      sessionStorage.setItem(
        "bodyFontSize",
        JSON.stringify(selectedFont?.bodyFontSize)
      );
    }
  }, [selectedFont]);



  // attach hotjar to editor

  // get template from exit menu from database
  const fetchTemplate = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("name, description, content, isGlobal")
          .eq("id", id);
        if (error) throw error;
        // console.log("data[0]", data[0]);

        // if (editor) {
          // const templateData = loadTemplateData(data[0].content);
          // editor.loadProjectData(templateData);
          // editor.setDevice(templateData.assets[0]);
          // setTimeout(() => {
          //   const canvasDocument = editor.Canvas.getDocument();
          //   if (!canvasDocument) return;

          //   // Set vertical and horizontal padding to the toolbar
          //   const menuBody = canvasDocument.querySelector(MENU_BODY_SELECTOR);
          //   if (menuBody) {
          //     const prevHorizontalPadding =
          //       window.getComputedStyle(menuBody).paddingLeft;
          //     setSelectedHorizontalPadding(parseFloat(prevHorizontalPadding));
          //     const prevVerticalPadding =
          //       window.getComputedStyle(menuBody).paddingTop;
          //     setSelectedVerticalPadding(parseFloat(prevVerticalPadding));
          //   }

          //   // Set columns padding to the toolbar
          //   const sectionHeadingRow = canvasDocument.querySelector(
          //     `.section ${SECTION_HEADING_ROW_SELECTOR}`
          //   );
          //   if (sectionHeadingRow) {
          //     const prevColumnPadding =
          //       window.getComputedStyle(sectionHeadingRow).gap;
          //     setSelectedColumnsPadding(parseFloat(prevColumnPadding));
          //   }
          // }, 2000);
        // }
        // console.log('data[0]', data[0])
      //   setTemplate({
      //     ...data[0],
      //   });
      } catch (err) {
        console.error(err);
      }
    },
    [editor, supabase]
  );
  // call fetchTemplate
  useEffect(() => {
    if (editor && router.query.id) {
      fetchTemplate(router.query.id as string);
    }
  }, [editor, router.query.id, fetchTemplate]);

  return (
    <>
      <AuthDialog opened={authDialog} onClose={closeAuthDialog} />
      <Editor openAuthDialog={openAuthDialog} />
    </>
  );
};

export default Template;
