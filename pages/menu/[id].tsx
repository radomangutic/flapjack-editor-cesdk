import { useRouter } from "next/router";
import Template from "../template";
import { useState } from "react";
import { Drawer, Button, Group, Text, Stack, ScrollArea } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  GetStaticPathsContext,
  GetStaticPropsContext,
} from "next";
import { ITemplateDetails } from "../../interfaces";
import DrawerHeader from "../../components/TemplateDetail/DrawerHeader";
import DrawerBody from "../../components/TemplateDetail/DrawerBody";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";

function TemplateDrawer({
  data: template,
  images,
  drawerOpened,
  setDrawerOpened,
}: {
  data: ITemplateDetails;
  images: string[];
  drawerOpened: boolean;
  setDrawerOpened: (open: boolean) => void;
}) {
  return (
    <>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        lockScroll={true}
        padding="xl"
        position="right"
        size="xl"
        title={<DrawerHeader templateData={template} />}
        withOverlay={false}
        styles={{ drawer: { top: "63px", direction:"rtl"} }}
      >
        <DrawerBody images={images} />
      </Drawer>
      <Group
        position="center"
        style={{
          position: "absolute",
          top: 0,
          zIndex: 9,
          right: 0,
          height: "100%",
        }}
      >
        <Button
          onClick={() => setDrawerOpened(true)}
          color="gray"
          compact
          variant="white"
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            height: "100%",
            width: "25px",
          }}
        >
          <IconChevronLeft
            style={{ position: "absolute", top: "10%", left: 0 }}
          />
        </Button>
      </Group>
    </>
  );
}

const Menu = ({
  data,
  images,
}: {
  data: ITemplateDetails[];
  images: string[];
}) => {
  const [drawerOpened, setDrawerOpened] = useState(true);
  return (
    <>
      <Template drawerOpened={drawerOpened} />
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const { data } = await supabase
    .from("templates")
    .select("name, description, tags")
    .eq("id", context?.params?.id);

  const { data: images, error } = await supabase.storage
    .from("renderings")
    .list(`${context?.params?.id}`, {
      limit: 6,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  let imageUrls: string[] = [];
  if (images?.length) {
    images.forEach(async (image, i) => {
      const {
        data: { publicUrl: imageUrl },
      } = await supabase.storage
        .from("renderings")
        .getPublicUrl(`${context?.params?.id}/${image.name}`);
      imageUrls.push(imageUrl);
    });
  }
  return {
    props: { data, images: imageUrls }, // will be passed to the page component as props
  };
}

export default Menu;
