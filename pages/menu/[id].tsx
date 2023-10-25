import { GetServerSidePropsContext } from "next";
import { ITemplateDetails, IUserDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";

import PrivatePage from "../../components/PrivatePage/PrivatePage";
import { getEditorData } from "../../helpers/EditorData";

const Menu = ({
  data,
  restaurantList,
  user,
}: {
  data: ITemplateDetails;
  restaurantList: any;
  user: IUserDetails;
}) => {
  if (user?.role !== "flapjack") {
    if (!data?.isGlobal && user?.restaurant_id !== data?.restaurant_id) {
      return <PrivatePage login={!user} />;
    }
  }

  if (!data) {
    return <PrivatePage text="The dog ate this menu!" />;
  }

  return (
    <>
      <Editor template={data} restaurantList={restaurantList} user={user} />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await getEditorData(context);
}

export default Menu;
