import { useState, useEffect, useCallback } from "react";
import { IFont, ITemplate, ITemplateDetails } from "../interfaces";
import { useDialog, useUser } from "../hooks";
import {
  useSupabaseClient,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import AuthDialog from "../components/AuthDialog";
import Editor from "../components/Editor/Editor";
import UpsertTemplateDialog from "../components/UpsertTemplateDialog";

export const WRAPPER_PADDING = 10;

const Template = ({
  drawerOpened,
  data,
}: {
  drawerOpened: boolean;
  data: ITemplateDetails | null;
}) => {
  const [editor, setEditor] = useState<object | null>(null);
  const [selectedFont, setSelectedFont] = useState<IFont | null>(null);
  const [template, setTemplate] = useState<ITemplateDetails | null>(null);
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

  if (typeof window !== "undefined") {
    return (
      <>
        {/* <UpsertTemplateDialog
          opened={true}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          content={undefined}
        /> */}
        <AuthDialog opened={authDialog} onClose={closeAuthDialog} />
        <Editor openAuthDialog={openAuthDialog} template={data} />
      </>
    );
  }

  return null;
};

export default Template;
