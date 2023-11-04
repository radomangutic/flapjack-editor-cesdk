import { GetServerSidePropsContext } from "next";
import { ITemplateDetails, IUserDetails } from "../../interfaces";
import Editor from "../../components/Editor/Editor";

import PrivatePage from "../../components/PrivatePage/PrivatePage";
import { getEditorData } from "../../helpers/EditorData";
import AppHeader from "../../components/Header";
import { useState } from "react";

const Menu = ({
  data,
  restaurantList,
  user,
}: {
  data: ITemplateDetails;
  restaurantList: any;
  user: IUserDetails;
}) => {

  const [loader, setloader] = useState(false);

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
      <AppHeader loader={loader} />
      <Editor template={data} loader={loader} setloader={setloader} restaurantList={restaurantList} user={user} />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await getEditorData(context);
}

export default Menu;
