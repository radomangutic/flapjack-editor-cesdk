import React, { useEffect, useState } from "react";
import TemplateHeader from "../components/TemplateHeader";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import TemplateCard from "../components/TemplateGallery/TemplateCard";
import { Container, SimpleGrid, Skeleton, Text } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../interfaces/ITemplate";
import {
  useUser,
  useTemplateActions,
  fetchTemplates,
  fetchResturants,
  getUser,
} from "../hooks";
import { useRouter } from "next/router";

const Templates = ({ thumbnails }: { thumbnails: string[] }) => {
  const loadingArray = new Array(10).fill(0);
  const router = useRouter();
  const user = getUser();
  const [templates, setTemplates] = useState<ITemplateDetails[]>([]);
  const [navMenu, setNavMenu] = useState("templates");
  const [loading, setloading] = useState(true);
  const [resturantsOptions, setResturantsOptions] = useState([]);

  const { deleteTemplate, renameTemplate, duplicateTemplate, globalTemplate } =
    useTemplateActions(templates, setTemplates, setNavMenu);

  // Fix `My Menu` button on the template page temporarily.
  // The better way is creating a separate `My Menu` page.
  useEffect(() => {
    const activeTab = localStorage.getItem("activeTab");
    if (router.isReady && activeTab === "myMenu" && user) {
      setNavMenu("myMenu");
    } else {
      setNavMenu(
        (user?.role == "user" && user?.subscriptionActive) ||
          user?.role === "owner"
          ? "myMenu"
          : "templates"
      );
    }
  }, [user]);
  useEffect(() => {
    const fetchData = async () => {
      const templatesList = await fetchTemplates(user);
      setTemplates(templatesList);
      setloading(false);
    };
    const getOptions = async () => {
      const options: any = await fetchResturants();
      setResturantsOptions(options);
    };
    getOptions();
    fetchData();
  }, [user?.id]);

  const templateData = templates?.filter((template) => {
    if (navMenu === "templates") {
      if (
        // template is template created by user and not global or template is created by user's restaurant
        (template.createdBy === user?.id && !template.isGlobal) ||
        template?.restaurant_id === user?.restaurant_id
      ) {
        return false;
      }
      return true;
      // template is global
    } else {
      // template is created by user and not global or template is created by user's restaurant
      if (
        (template.createdBy === user?.id && !template.isGlobal) ||
        template?.restaurant_id === user?.restaurant_id
      ) {
        return true;
        // template is global
      } else {
        return false;
      }
    }
  });
  const groupMenusByLocation = (menus: any[], locations: string[]) => {
    const menuMap: { [key: string]: any[] } = {};
    menus.forEach((menu) => {
      const { location, ...menuData } = menu;
      const currentLocation = location || "No Location";
      if (!menuMap[currentLocation]) {
        menuMap[currentLocation] = [];
      }
      menuMap[currentLocation].push(menuData);
    });
    const groupedMenus: any[] = locations?.map((location) => ({
      location,
      menus: menuMap[location] || [],
    }));

    if (menuMap["No Location"]) {
      groupedMenus.push({
        location: "",
        menus: menuMap["No Location"],
      });
    }

    return groupedMenus;
  };
  const groupedMenus = groupMenusByLocation(
    templateData,
    user?.restaurant?.location || []
  );
  const ungroupedMenus = templateData?.filter(
    (template) => !!!template?.restaurant_id
  );
  if (
    user?.role === "flapjack" &&
    resturantsOptions.length &&
    navMenu === "templates"
  ) {
    return (
      <>
        <TemplateHeader setNavMenu={setNavMenu} navMenu={navMenu} />
        <Container size="xl" px="xl" pt={16}>
          <Text size={32} weight={400} sx={{ marginBottom: "1rem" }}>
            {router.query.myMenu && navMenu === "templates" ? "" : "My Menus"}
          </Text>
          {loading ? (
            <>
              <SimpleGrid
                cols={3}
                breakpoints={[
                  { maxWidth: 1120, cols: 3, spacing: "md" },
                  { maxWidth: 991, cols: 2, spacing: "sm" },
                  { maxWidth: 600, cols: 1, spacing: "sm" },
                ]}
              >
                {loadingArray.map((item, i) => (
                  <>
                    <Skeleton key={i} visible={true} height={333}>
                      Lorem ipsum dolor sit amet...
                    </Skeleton>
                  </>
                ))}
              </SimpleGrid>
            </>
          ) : (
            <>
              {resturantsOptions.map((item: any, i) => {
                const menus = item?.location?.length
                  ? groupMenusByLocation(templateData, item?.location)
                  : [
                      {
                        menus: templateData.filter(
                          (template) => template?.restaurant_id == item?.value
                        ),
                      },
                    ];

                return (
                  <div key={i}>
                    <Text
                      style={{ fontSize: "26px" }}
                      fw={"inherit"}
                    >
                      {item?.label}
                    </Text>

                    {menus.map((item: any, i) => (
                      <div key={i}>
                        <Text fz={"xl"} fw={"inherit"} my={"md"}>
                          {item?.location}
                        </Text>
                        <SimpleGrid
                          cols={3}
                          breakpoints={[
                            { maxWidth: 1120, cols: 3, spacing: "md" },
                            { maxWidth: 991, cols: 2, spacing: "sm" },
                            { maxWidth: 600, cols: 1, spacing: "sm" },
                          ]}
                          sx={{ marginBottom: "80px" }}
                        >
                          {item?.menus?.length ? (
                            item?.menus.map((template: any, i: number) => (
                              <TemplateCard
                                key={i}
                                template={template}
                                thumbnail={thumbnails?.[template.id]}
                                onRemove={deleteTemplate}
                                onRename={renameTemplate}
                                onDuplicate={duplicateTemplate}
                                //@ts-ignore
                                onGlobal={globalTemplate}
                                navMenu={navMenu}
                                resturantsOptions={resturantsOptions}
                                setTemplates={setTemplates}
                              />
                            ))
                          ) : (
                            <Text>No menu found</Text>
                          )}
                        </SimpleGrid>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
          <div>
            <Text style={{ fontSize: "26px" }} fw={"inherit"} my={"md"}>
              Menu without restaurant
            </Text>
            <SimpleGrid
              cols={3}
              breakpoints={[
                { maxWidth: 1120, cols: 3, spacing: "md" },
                { maxWidth: 991, cols: 2, spacing: "sm" },
                { maxWidth: 600, cols: 1, spacing: "sm" },
              ]}
            >
              {ungroupedMenus.map((template: any, i: number) => (
                <TemplateCard
                  key={i}
                  template={template}
                  thumbnail={thumbnails?.[template.id]}
                  onRemove={deleteTemplate}
                  onRename={renameTemplate}
                  onDuplicate={duplicateTemplate}
                  //@ts-ignore
                  onGlobal={globalTemplate}
                  navMenu={navMenu}
                  resturantsOptions={resturantsOptions}
                />
              ))}
            </SimpleGrid>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <TemplateHeader setNavMenu={setNavMenu} navMenu={navMenu} />
      <Container size="xl" px="xl" pt={16}>
        <Text size={32} weight={200} sx={{ marginBottom: "1rem" }}>
          {router.query.myMenu && navMenu === "templates" ? "" : "My Menus"}
        </Text>
        {loading ? (
          <>
            <SimpleGrid
              cols={3}
              breakpoints={[
                { maxWidth: 1120, cols: 3, spacing: "md" },
                { maxWidth: 991, cols: 2, spacing: "sm" },
                { maxWidth: 600, cols: 1, spacing: "sm" },
              ]}
            >
              {loadingArray.map((item, i) => (
                <>
                  <Skeleton key={i} visible={true} height={333}>
                    Lorem ipsum dolor sit amet...
                  </Skeleton>
                </>
              ))}
            </SimpleGrid>
          </>
        ) : user?.restaurant?.location?.length ? (
          <>
            {groupedMenus.map((item: any, i) => (
              <div key={i}>
                <Text fz={"xl"} fw={"bold"} my={"md"}>
                  {item?.location}
                </Text>
                <SimpleGrid
                  cols={3}
                  breakpoints={[
                    { maxWidth: 1120, cols: 3, spacing: "md" },
                    { maxWidth: 991, cols: 2, spacing: "sm" },
                    { maxWidth: 600, cols: 1, spacing: "sm" },
                  ]}
                  sx={{ marginBottom: "80px" }}
                >
                  {item?.menus.map((template: any, i: number) => (
                    <TemplateCard
                      key={i}
                      template={template}
                      thumbnail={thumbnails?.[template.id]}
                      onRemove={deleteTemplate}
                      onRename={renameTemplate}
                      onDuplicate={duplicateTemplate}
                      //@ts-ignore
                      onGlobal={globalTemplate}
                      navMenu={navMenu}
                      resturantsOptions={resturantsOptions}
                      setTemplates={setTemplates}
                    />
                  ))}
                </SimpleGrid>
              </div>
            ))}
          </>
        ) : (
          <SimpleGrid
            cols={3}
            breakpoints={[
              { maxWidth: 1120, cols: 3, spacing: "md" },
              { maxWidth: 991, cols: 2, spacing: "sm" },
              { maxWidth: 600, cols: 1, spacing: "sm" },
            ]}
          >
            {templateData.map((template: any, i: number) => (
              <TemplateCard
                key={i}
                template={template}
                thumbnail={thumbnails?.[template.id]}
                onRemove={deleteTemplate}
                onRename={renameTemplate}
                onDuplicate={duplicateTemplate}
                //@ts-ignore
                onGlobal={globalTemplate}
                navMenu={navMenu}
                resturantsOptions={resturantsOptions}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient(context);
  const { data } = await supabase
    .from("templates")
    .select(
      "id, createdBy, name, description, tags, isGlobal, menuSize, location"
    )
    .order("templateOrder", { ascending: true });

  return {
    props: { data }, // will be passed to the page component as props
  };
}
export default Templates;
