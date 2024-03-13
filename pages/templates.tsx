import React, { useEffect, useState } from "react";
import TemplateHeader from "../components/TemplateHeader";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import TemplateCard from "../components/TemplateGallery/TemplateCard";
import { Container, SimpleGrid, Skeleton, Text } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { ITemplateDetails } from "../interfaces/ITemplate";
import {
  useTemplateActions,
  fetchTemplates,
  fetchResturants,
} from "../hooks";
import { useRouter } from "next/router";
import { useUserContext } from "../context/UserContext";

const Templates = ({ thumbnails }: { thumbnails: string[] }) => {
  const loadingArray = new Array(10).fill(0);
  const router = useRouter();
  const { user } = useUserContext()
  const [templates, setTemplates] = useState<ITemplateDetails[]>([]);
  const [navMenu, setNavMenu] = useState("templates");
  const [loading, setloading] = useState(true);
  const [resturantsOptions, setResturantsOptions] = useState([]);
  // console.log({ resturantsOptions })

  const { deleteTemplate, renameTemplate, duplicateTemplate, globalTemplate } =
    useTemplateActions(templates, setTemplates, setNavMenu);

  // Fix `My Menu` button on the template page temporarily.
  // The better way is creating a separate `My Menu` page.
  useEffect(() => {
    const activeTab = localStorage.getItem("activeTab");
    if (user?.role === "flapjack" && activeTab) {
      setNavMenu(activeTab);
    } else {
      if (!user?.restaurant_id) {
        setNavMenu("templates");
      }
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
    }
  }, [router.isReady, user]);
  useEffect(() => {
    const fetchData = async () => {
      const templatesList = await fetchTemplates(user);
      templatesList.sort(
        (a, b) =>
          new Date(b.updatedAt as any).getTime() -
          new Date(a.updatedAt as any).getTime()
      );

      setTemplates(templatesList);
      setloading(false);
    };
    if (user) {
      const getOptions = async () => {
        const options: any = await fetchResturants(user);
        setResturantsOptions(options);
      };
      getOptions();
    }
    fetchData();
  }, [user, user?.id]);
  const templateData = templates?.filter((template) => {
    // show all menus in the user's restaurant
    if (template?.restaurant_id === user?.restaurant_id) return true;
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
  console.log("groupedMenu", groupedMenus);
  if (loading) {
    return (
      <Container size="xl" px="xl" pt={16}>
        <SimpleGrid
          cols={3}
          breakpoints={[
            { maxWidth: 1120, cols: 3, spacing: "md" },
            { maxWidth: 991, cols: 2, spacing: "sm" },
            { maxWidth: 600, cols: 1, spacing: "sm" },
          ]}
        >
          {loadingArray.map((item, i) => (
            <Skeleton key={i} visible={true} height={333}></Skeleton>
          ))}
        </SimpleGrid>
      </Container>
    );
  }
  if (user?.role === "flapjack") {
    if (navMenu === "templates") {
      return (
        <>
          <TemplateHeader setNavMenu={setNavMenu} navMenu={navMenu} />
          <Container size="xl" px="xl" pt={16}>
            <Text size={32} weight={400} sx={{ marginBottom: "1rem" }}>
              Templates
            </Text>
            <Text mb={"xl"}>
              The Templates tab contains both draft and live menu templates.
              Draft menus are only visible to flapjack users. Live menus are
              visible to all users, even users without an account, so please be
              cautious about publishing these menus. These menus are intended to
              be starting points for customer menus. To add a menu to this tab,
              transfer it to the Flapjack restaurant or select the Flapjack
              restaurant when creating a menu.
            </Text>
            <SimpleGrid
              cols={3}
              breakpoints={[
                { maxWidth: 1120, cols: 3, spacing: "md" },
                { maxWidth: 991, cols: 2, spacing: "sm" },
                { maxWidth: 600, cols: 1, spacing: "sm" },
              ]}
            >
              {templates
                ?.filter(
                  (item: ITemplateDetails) =>
                    !!!item?.restaurant_id || item?.restaurant_id === "2"
                )
                ?.map((template: any, i: number) => {
                  return (
                    <TemplateCard
                      key={i}
                      template={template}
                      thumbnail={`${process.env.NEXT_PUBLIC_SUPABASE_URL
                        }/storage/v1/object/public/renderings/${template.id
                        }/coverImage?${i}${Date.now()}`}
                      onRemove={deleteTemplate}
                      onRename={renameTemplate}
                      onDuplicate={duplicateTemplate}
                      //@ts-ignore
                      onGlobal={globalTemplate}
                      navMenu={navMenu}
                      resturantsOptions={resturantsOptions}
                      setTemplates={setTemplates}
                      badge
                    />
                  );
                })}
            </SimpleGrid>
          </Container>
        </>
      );
    }
    return (
      <>
        <TemplateHeader setNavMenu={setNavMenu} navMenu={navMenu} />
        {user?.restaurant_id ? (
          <Container size="xl" px="xl" pt={16}>
            <Text size={32} weight={400} sx={{ marginBottom: "1rem" }}>
              Customer Menus
            </Text>
            <Text mb={"xl"}>
              The “Customer Menus” tab is a place for our team to see all of the
              menus that are either in progress or already delivered to
              customers. Live menus are menus that customers can actively see
              when they log in, so please{" "}
              <b>be careful when editing or modifying these.</b> Draft menus are
              only visible to flapjack users. To add a menu here, it must be
              assigned to a restaurant either when creating the menu or by
              transferring the menu to the corresponding restaurant.
            </Text>

            {/* Render customer restaurants and menus, exclude internal restaurants */}
            {resturantsOptions
              ?.filter(
                (i: any) =>
                  i?.value !== "2" &&
                  i?.value !== "5" &&
                  i?.value !== "1" &&
                  i?.value !== "7"
              )
              .map((item: any, i) => {
                const restaurantTemplate = templates.filter(
                  (template) => template?.restaurant_id == item?.value
                );
                const menus = item?.location?.length
                  ? groupMenusByLocation(restaurantTemplate, item?.location)
                  : [
                    {
                      menus: restaurantTemplate,
                    },
                  ];
                return (
                  <div key={i}>
                    <Text style={{ fontSize: "26px" }} fw={"inherit"}>
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
                                thumbnail={`${process.env.NEXT_PUBLIC_SUPABASE_URL
                                  }/storage/v1/object/public/renderings/${template.id
                                  }/coverImage?${i}${Date.now()}`}
                                onRemove={deleteTemplate}
                                onRename={renameTemplate}
                                onDuplicate={duplicateTemplate}
                                //@ts-ignore
                                onGlobal={globalTemplate}
                                navMenu={navMenu}
                                resturantsOptions={resturantsOptions}
                                setTemplates={setTemplates}
                                badge
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
            {/* Render internal restaurants and memnus after customer menus, should refactor to reuse code from above */}
            {resturantsOptions
              ?.filter(
                (i: any) =>
                  i?.value == "5" || i?.value == "1" || i?.value == "7"
              )
              .map((item: any, i) => {
                const restaurantTemplate = templates.filter(
                  (template) => template?.restaurant_id == item?.value
                );
                const menus = item?.location?.length
                  ? groupMenusByLocation(restaurantTemplate, item?.location)
                  : [
                    {
                      menus: restaurantTemplate,
                    },
                  ];
                return (
                  <div key={i}>
                    <Text style={{ fontSize: "26px" }} fw={"inherit"}>
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
                                thumbnail={`${process.env.NEXT_PUBLIC_SUPABASE_URL
                                  }/storage/v1/object/public/renderings/${template.id
                                  }/coverImage?${i}${Date.now()}`}
                                onRemove={deleteTemplate}
                                onRename={renameTemplate}
                                onDuplicate={duplicateTemplate}
                                //@ts-ignore
                                onGlobal={globalTemplate}
                                navMenu={navMenu}
                                resturantsOptions={resturantsOptions}
                                setTemplates={setTemplates}
                                badge
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
          </Container>
        ) : (
          ""
        )}
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
        {user?.restaurant?.location?.length ? (
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
                  {item?.menus.map((template: any, i: number) => {
                    if (
                      (user?.role === "user" || user?.role === "owner") &&
                      template?.isGlobal
                    )
                      // Don't show menu if it is "draft" status
                      return (
                        <TemplateCard
                          key={i}
                          template={template}
                          thumbnail={`${process.env.NEXT_PUBLIC_SUPABASE_URL
                            }/storage/v1/object/public/renderings/${template.id
                            }/coverImage?${i}${Date.now()}`}
                          onRemove={deleteTemplate}
                          onRename={renameTemplate}
                          onDuplicate={duplicateTemplate}
                          //@ts-ignore
                          onGlobal={globalTemplate}
                          navMenu={navMenu}
                          resturantsOptions={resturantsOptions}
                          setTemplates={setTemplates}
                          badge
                        />
                      );
                  })}
                </SimpleGrid>
              </div>
            ))}
          </>
        ) : user?.restaurant_id ? (
          <SimpleGrid
            cols={3}
            breakpoints={[
              { maxWidth: 1120, cols: 3, spacing: "md" },
              { maxWidth: 991, cols: 2, spacing: "sm" },
              { maxWidth: 600, cols: 1, spacing: "sm" },
            ]}
          >
            {templateData.map((template: any, i: number) => {
              if (
                (user?.role === "user" || user?.role === "owner") &&
                template?.isGlobal
              )
                // Don't show menu if it is "draft" status
                return (
                  <TemplateCard
                    key={i}
                    template={template}
                    thumbnail={`${process.env.NEXT_PUBLIC_SUPABASE_URL
                      }/storage/v1/object/public/renderings/${template.id
                      }/coverImage?${i}${Date.now()}`}
                    onRemove={deleteTemplate}
                    onRename={renameTemplate}
                    onDuplicate={duplicateTemplate}
                    //@ts-ignore
                    onGlobal={globalTemplate}
                    navMenu={navMenu}
                    resturantsOptions={resturantsOptions}
                    setTemplates={setTemplates}
                    badge
                  />
                );
            })}
          </SimpleGrid>
        ) : (
          ""
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
