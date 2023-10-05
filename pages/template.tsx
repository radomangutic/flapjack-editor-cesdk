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
import { getEditorData } from "../helpers/EditorData";
import { GetServerSidePropsContext } from "next";

export const WRAPPER_PADDING = 10;

const Template = ({
  data,
  elementsList,
  sectionedList,
}: {
  drawerOpened: boolean;
  data: ITemplateDetails | null;
  elementsList: any;
  sectionedList?: any;
}) => {
  const user = getUser();
  if (typeof window !== "undefined") {
    if (!canCreateTemplate(user)) {
      return <PrivatePage login={!user} />;
    }
    const elements =
      user?.role === "flapjack"
        ? elementsList
        : elementsList.filter(
            (item: any) => item?.restaurant_id === user?.restaurant_id
          );
    return (
      <>
        <Editor
          template={data}
          elementsList={elements}
          sectionedList={sectionedList}
        />
      </>
    );
  }

  return null;
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await getEditorData(context);
}
export default Template;
