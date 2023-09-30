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
import { convertToSectionList } from "../helpers/convertToSectionList";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";

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
          globalTemplates={user?.role === "flapjack" ? globalTemplates : []}
        />
      </>
    );
  }

  return null;
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);

  let elementList: any;

  const elements = await supabase
    .from("ElementLibrary")
    .select("*")
    .order("created_at", { ascending: false });
  elementList = elements?.data?.map((item, i) => {
    const imagePath = `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/elementsThumbnail/${
      item.thumbnail
    }?${i}${Date.now()}`;

    return {
      id: item?.id?.toString(),
      createdBy: item?.createdBy || null,
      restaurant_id: item?.restaurant_id,
      meta: {
        uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
        blockType: "//ly.img.ubq/text",
        thumbUri: imagePath,
        width: 100,
        height: 10,
        value: item?.element,
        name: item?.restaurant_id,
      },
      context: {
        sourceId: "Custom component",
      },
    };
  });

  const sortResData = () => {
    const sectionedList = Object.values(convertToSectionList(elementList));
    const responseList = sectionedList?.map(async (item: any) => {
      const resturantDetail = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", item?.restaurant_id)
        .single();

      return {
        ...item,
        resturantDetail: resturantDetail?.data,
      };
    });
    return Promise.all(responseList);
  };
  const sortAssetsImages = async () => {
    const { data: globalTemplates, error: globalTemplatesError } =
      await supabase
        .from("assets")
        .select("id, createdBy, content ,restaurant_id");
    const sectionedList = Object.values(convertToSectionList(globalTemplates));
    const responseList = sectionedList?.map(async (item: any) => {
      const resturantDetail = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", item?.restaurant_id)
        .single();

      return {
        ...item,
        resturantDetail: resturantDetail?.data,
      };
    });
    return Promise.all(responseList);
  };
  const sortedData = await sortResData();
  const globalTemplates = await sortAssetsImages();
  const response = await globalTemplates?.filter((item) => {
    const exist = sortedData?.find(
      (i) => i?.restaurant_id === item?.restaurant_id
    );
    return !exist && true;
  });

  return {
    props: {
      data: null,
      elementsList: elementList,
      sectionedList: sortedData,
      globalTemplates: response,
    }, // will be passed to the page component as props
  };
}
export default Template;
