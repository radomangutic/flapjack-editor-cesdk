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
import {
  convertToLocationSectionList,
  convertToSectionList,
} from "../helpers/convertToSectionList";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { getEditorData } from "../helpers/EditorData";

export const WRAPPER_PADDING = 10;

const Template = ({
  data,
  elementsList,
  sectionedList,
  globalTemplates,
}: {
  drawerOpened: boolean;
  data: ITemplateDetails | null;
  elementsList: any;
  sectionedList?: any;
  globalTemplates: any;
}) => {
  const user = getUser();
  if (typeof window !== "undefined") {
    if (!canCreateTemplate(user)) {
      return <PrivatePage login={!user} />;
    }
    const elements =
      user?.role == "flapjack"
        ? elementsList
        : elementsList.filter(
            (item: any) => item?.restaurant_id === user?.restaurant_id
          );
    const SecElements =
      user?.role == "flapjack"
        ? sectionedList
        : convertToLocationSectionList(
            elementsList.filter(
              (item: any) => item?.restaurant_id === user?.restaurant_id
            )
          );
    return (
      <>
        <Editor
          template={data}
          elementsList={elements?.filter(
            (item: any) => item?.template_id === data?.id?.toString()
          )}
          sectionedList={SecElements}
          globalTemplates={user?.role === "flapjack" ? globalTemplates : []}
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
