import { useState, useEffect, useCallback } from "react";
import { IFont, ITemplate, ITemplateDetails } from "../interfaces";
import { canCreateTemplate, getUser, useDialog, useUser } from "../hooks";
import {
  useSupabaseClient,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import AuthDialog from "../components/AuthDialog";
import Editor from "../components/Editor/Editor";
import UpsertTemplateDialog from "../components/UpsertTemplateDialog";
import PrivatePage from "../components/PrivatePage/PrivatePage";

export const WRAPPER_PADDING = 10;

const Template = ({
  data,
}: {
  drawerOpened: boolean;
  data: ITemplateDetails | null;
}) => {
  const user = getUser();
  if (typeof window !== "undefined") {
    if (!canCreateTemplate(user)) {
      return <PrivatePage login={!user} />;
    }
    return (
      <>
        <Editor template={data} />
      </>
    );
  }

  return null;
};

export default Template;
