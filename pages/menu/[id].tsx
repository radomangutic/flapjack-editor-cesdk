import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";
import { getUser } from "../../hooks";
import PrivatePage from "../../components/PrivatePage/PrivatePage";
import { getEditorData } from "../../helpers/EditorData";
const Menu = ({
  data,
  elementsList,
  sectionedList,
}: {
  data: ITemplateDetails;
  elementsList: any;
  sectionedList?: any;
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
    user?.role === "flapjack"
      ? elementsList
      : elementsList.filter(
          (item: any) => item?.restaurant_id === user?.restaurant_id
        );
console.log('elements',elements)
  return (
    <>
      <Editor
        template={data}
        elementsList={elements}
        sectionedList={sectionedList}
      />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await getEditorData(context);
}

export default Menu;
