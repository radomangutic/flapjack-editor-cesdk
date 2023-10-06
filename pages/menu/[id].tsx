import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";
import { getUser } from "../../hooks";
import PrivatePage from "../../components/PrivatePage/PrivatePage";
import {
  convertToLocationSectionList,
  convertToSectionList,
} from "../../helpers/convertToSectionList";
import { getEditorData } from "../../helpers/EditorData";

const Menu = ({
  data,
  elementsList,
  sectionedList,
  globalTemplates,
}: {
  data: ITemplateDetails;
  elementsList: any;
  sectionedList?: any;
  globalTemplates: any;
}) => {
  const user = getUser();

  if (user?.role !== "flapjack") {
    if (!data?.isGlobal && user?.restaurant_id !== data?.restaurant_id) {
      return <PrivatePage login={!user} />;
    }
  }

  if (!data) {
    return <PrivatePage text="The dog ate this menu!" />;
  }
  const elements =
    user?.role == "flapjack"
      ? elementsList?.filter(
          (item: any) => item?.template_id === data?.id?.toString()
        )
      : elementsList.filter(
          (item: any) =>
            item?.restaurant_id === user?.restaurant_id
        );
  const convertedElements = convertToLocationSectionList(
    elementsList.filter(
      (item: any) => item?.restaurant_id === user?.restaurant_id
    )
  );
  const SecElements =
    user?.role == "flapjack"
      ? sectionedList
      : convertedElements?.length > 1
      ? convertedElements
      : [];
  return (
    <>
      <Editor
        template={data}
        elementsList={elements}
        sectionedList={SecElements}
        globalTemplates={user?.role === "flapjack" ? globalTemplates : []}
      />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await getEditorData(context);
}

export default Menu;
