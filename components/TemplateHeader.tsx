import { Avatar, Button, Flex, Header, Menu, Text } from "@mantine/core";
import { useRouter } from "next/router";
import {
  IconChevronDown,
  IconDownload,
  IconLogout,
  IconMail,
  IconSettings,
} from "@tabler/icons";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AuthDialog from "./AuthDialog";
import {
  useDialog,
  useUser,
  useUpsell,
  canCreateTemplate,
} from "../hooks";
import { useEffect, useState } from "react";
import { ITemplate } from "../interfaces";
import _ from "lodash";
import { userCanEditFontAndColor } from "../helpers/userCanEditFontAndColor";
import Link from "next/link";
import { removeAllCookies } from "../helpers/EditorData";
import { useUserContext } from "../context/UserContext";
interface ITemplateHeaderProps {
  onTemplateDownload?: () => void;
  onTemplateSaveUpdate?: () => void;
  setNavMenu?: (value: string) => void;
  navMenu?: string;
  template?: ITemplate | null;
  upsertTemplate?: boolean;
}

const TemplateHeader = ({
  onTemplateDownload,
  onTemplateSaveUpdate,
  setNavMenu,
  navMenu,
  template,
  upsertTemplate,
}: ITemplateHeaderProps) => {
  const router = useRouter();
  const user = useUser();
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);
  const session = useSession();
  const supabase = useSupabaseClient();
  const [sizeValue, setSizeValue] = useState<string>();
  const { triggerUpsellOr } = useUpsell(user?.subscriptionActive, user?.id);
  const { setSupabaeUser } = useUserContext()

  if (typeof document !== "undefined") {
    const panelWrapper = document.querySelector<HTMLElement>(".gjs-pn-panels");
    const canvasWrapper = document.querySelector<HTMLElement>(".gjs-cv-canvas");
    const scrollableWrapper = document.querySelector<HTMLElement>(
      ".scrollable-wrapper"
    );

    if (scrollableWrapper !== null) {
      if (userCanEditFontAndColor(user)) {
        const LEFT_SPACE = "(4vw + 66px)";
        const RIGHT_SPACE = "200px";
        scrollableWrapper.style.width = `calc(100% - ${LEFT_SPACE} - ${RIGHT_SPACE})`;
      }
    }
    if (panelWrapper != null && canvasWrapper !== null) {
      if (user?.role === "flapjack") {
        canvasWrapper.style.position = "relative";
        panelWrapper.style.display = "block";
      } else {
        canvasWrapper.style.position = "relative";
        panelWrapper.style.display = "none";
      }

      canvasWrapper.style.top = "0";
    }
  }

  const activeClassFun = (value: string) => {
    // @ts-ignore
    navMenu && setNavMenu(value);
    localStorage.setItem("activeTab", value);
  };

  useEffect(() => {
    if (!user) {
      openAuthDialog();
    } else {
      closeAuthDialog();
    }
  }, [closeAuthDialog, openAuthDialog, user]);

  useEffect(() => {
    setSizeValue(template?.content.assets[0]);
  }, [template]);

  const isActiveTab = () => {
    return user?.role === "flapjack" || navMenu === "myMenu";
    return user?.role === "flapjack" || navMenu === "myMenu";
  };

  const logout = async () => {
    const logout = await supabase.auth.signOut();
    localStorage.setItem("supabaseUser", "")
    setSupabaeUser(null)
    removeAllCookies();
    router.push("/templates");
  };

  return (
    <Header height={64}>
      <Flex
        p="md"
        sx={{ height: "100%" }}
        justify="space-between"
        align="center"
      >
        <Flex align="center">
          <Link href={"/templates"}>
            <Flex align={"center"} style={{ cursor: "pointer" }}>
              <svg
                width="31"
                height="29"
                viewBox="0 0 31 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3546 28.2073C29.7323 27.928 30.6629 22.203 30.6629 20.8998C30.6629 19.5966 23.823 18.4795 15.3546 18.4795C6.88625 18.4795 0.0463867 19.55 0.0463867 20.8998C0.0463867 22.2496 0.976981 28.4865 15.3546 28.2073Z"
                  fill="#FECB80"
                />
                <path
                  d="M15.3548 25.7871C23.835 25.7871 30.7096 23.4323 30.7096 20.5276C30.7096 17.6228 23.835 15.2681 15.3548 15.2681C6.87457 15.2681 0 17.6228 0 20.5276C0 23.4323 6.87457 25.7871 15.3548 25.7871Z"
                  fill="#EE6D01"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3546 23.3667C29.7323 23.0874 30.6629 17.3625 30.6629 16.0592C30.6629 14.756 23.823 13.6389 15.3546 13.6389C6.88625 13.6389 0.0463867 14.7094 0.0463867 16.0592C0.0463867 17.3625 0.976981 23.5994 15.3546 23.3667Z"
                  fill="#FECB80"
                />
                <path
                  d="M15.3548 20.9465C23.835 20.9465 30.7096 18.5918 30.7096 15.687C30.7096 12.7823 23.835 10.4275 15.3548 10.4275C6.87457 10.4275 0 12.7823 0 15.687C0 18.5918 6.87457 20.9465 15.3548 20.9465Z"
                  fill="#EE6D01"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3546 18.4795C29.7323 18.2002 30.6629 12.4753 30.6629 11.172C30.6629 9.86877 23.823 8.75171 15.3546 8.75171C6.88625 8.75171 0.0463867 9.86877 0.0463867 11.172C0.0463867 12.4753 0.976981 18.7588 15.3546 18.4795Z"
                  fill="#FECB80"
                />
                <path
                  d="M15.3548 16.1523C23.835 16.1523 30.7096 13.7976 30.7096 10.8928C30.7096 7.98807 23.835 5.6333 15.3548 5.6333C6.87457 5.6333 0 7.98807 0 10.8928C0 13.7976 6.87457 16.1523 15.3548 16.1523Z"
                  fill="#EE6D01"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3546 13.6389C29.7323 13.3597 30.6629 7.63469 30.6629 6.33144C30.6629 5.0282 23.823 3.91113 15.3546 3.91113C6.88625 3.91113 0.0463867 4.98165 0.0463867 6.33144C0.0463867 7.68123 0.976981 13.9182 15.3546 13.6389Z"
                  fill="#FECB80"
                />
                <path
                  d="M15.3548 11.3118C23.835 11.3118 30.7096 8.957 30.7096 6.05224C30.7096 3.14749 23.835 0.792725 15.3548 0.792725C6.87457 0.792725 0 3.14749 0 6.05224C0 8.957 6.87457 11.3118 15.3548 11.3118Z"
                  fill="#EE6D01"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.3547 3.25952C20.2403 3.25952 24.335 4.2835 24.9398 5.63329C24.9864 5.72638 25.0329 5.86601 25.0329 6.00564C25.0329 7.30889 22.9391 7.72779 21.7758 8.23978C21.4036 8.42595 21.1244 8.8914 21.0313 9.35684V21.3188C21.0313 22.4358 20.1473 23.3667 19.0306 23.3667H18.984C17.8673 23.3667 16.9367 22.4358 16.9367 21.3188V10.2877C16.7041 8.70522 14.3776 8.0536 13.7262 10.2877V13.8251C13.7262 14.9422 12.8421 15.8731 11.7254 15.8731H11.6789C10.5622 15.8731 9.63158 14.9887 9.63158 13.8717V13.8251V9.40339C9.63158 8.93794 9.39893 8.56559 8.8871 8.19323C7.90998 7.82088 5.63003 7.26234 5.5835 6.00564V5.9591V5.91255C5.72309 4.46968 10.0503 3.25952 15.3547 3.25952Z"
                  fill="#BF360B"
                />
              </svg>
              <Text fw={700} ml={4} className="cursor-pointer">
                flapjack
              </Text>
            </Flex>
          </Link>
          <Flex sx={{ marginLeft: "2rem" }}>
            {user && user?.role !== "flapjack" && (
              <Text
                // navMenu "cursor-pointer"
                style={{
                  ...(!user?.restaurant_id && {
                    color: "gray",
                    cursor: "default",
                  }),
                }}
                className={`myMenu ${navMenu === "myMenu" ? "active" : ""
                  } cursor-pointer`}
                fz="sm"
                onClick={() => {
                  if (!user?.restaurant_id) return;
                  activeClassFun("myMenu");
                }}
              >
                <span
                  style={{
                    padding: "6px 8px",
                    backgroundColor: "#EDF2FF",
                    borderRadius: "5px",
                    marginRight: "5px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#4C6EF5"
                    className="bi bi-file-earmark-text"
                    viewBox="0 0 16 16"
                    style={{ verticalAlign: "sub" }}
                  >
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                  </svg>
                </span>
                My Menus
              </Text>
            )}
            {(user?.role == "user" && user?.subscriptionActive) ||
              (user?.role === "owner" ||
                (user?.role === "user" && !!user?.restaurant_id) ? (
                <></>
              ) : (
                <Text
                  className={`templates ${navMenu === "templates" ? "active" : ""
                    } cursor-pointer`}
                  fz="sm"
                  ml="sm"
                  onClick={() => {
                    activeClassFun("templates");
                  }}
                >
                  <span
                    style={{
                      padding: "6px 8px",
                      backgroundColor: "#FFF9DB",
                      borderRadius: "5px",
                      marginRight: "5px",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#FAB005"
                      className="bi bi-columns"
                      viewBox="0 0 16 16"
                      style={{ verticalAlign: "sub" }}
                    >
                      <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2zm8.5 0v8H15V2H8.5zm0 9v3H15v-3H8.5zm-1-9H1v3h6.5V2zM1 14h6.5V6H1v8z" />
                    </svg>
                  </span>
                  Templates
                </Text>
              ))}
            {user?.role === "flapjack" && (
              <Text
                // navMenu "cursor-pointer"
                className={`myMenu ${navMenu === "customerMenus" ? "active" : ""
                  } cursor-pointer`}
                ml="sm"
                fz="sm"
                onClick={() => {
                  activeClassFun("customerMenus");
                }}
              >
                <span
                  style={{
                    padding: "6px 8px",
                    backgroundColor: "#EDF2FF",
                    borderRadius: "5px",
                    marginRight: "5px",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#4C6EF5"
                    className="bi bi-file-earmark-text"
                    viewBox="0 0 16 16"
                    style={{ verticalAlign: "sub" }}
                  >
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                  </svg>
                </span>
                Customer Menus
              </Text>
            )}
          </Flex>
        </Flex>
        <Flex align="center">
          {router.pathname.includes("templates") ? (
            canCreateTemplate(user) &&
            isActiveTab() && (
              <Button
                size="xs"
                color="orange"
                onClick={() => router.push("/template")}
                sx={{ marginRight: "1rem" }}
              >
                Create New Menu
              </Button>
            )
          ) : (
            <>
              <Button
                size="xs"
                variant="subtle"
                onClick={
                  session ? triggerUpsellOr(onTemplateDownload) : openAuthDialog
                }
                sx={{
                  "&:hover": {
                    backgroundColor: "white",
                  },
                }}
              >
                <IconDownload />
              </Button>
            </>
          )}
          {onTemplateSaveUpdate && (
            <Button
              size="xs"
              color="orange"
              onClick={
                session ? triggerUpsellOr(onTemplateSaveUpdate) : openAuthDialog
              }
              sx={{ marginRight: "1rem" }}
            >
              {router.query.id
                ? user?.role === "flapjack"
                  ? "Update"
                  : "Save Menu"
                : user
                  ? "Save"
                  : "Save Menu"}
            </Button>
          )}
          {user ? (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Flex align="center" sx={{ cursor: "pointer" }}>
                  <Avatar radius="xl" />
                  <IconChevronDown size={16} />
                </Flex>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                {user?.role == "owner" && (
                  <Link
                    href={`/restaurant/${user?.restaurant_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Menu.Item icon={<IconSettings size={14} />}>
                      Settings
                    </Menu.Item>
                  </Link>
                )}
                {user?.role === "flapjack" && (
                  <Link href={`/dashboard`} target="_blank" rel="noreferrer">
                    <Menu.Item icon={<IconSettings size={14} />}>
                      Dashboard
                    </Menu.Item>
                  </Link>
                )}
                <a
                  href="mailto:Howdy@Flapjack.co"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Menu.Item icon={<IconMail size={14} />}>
                    Contact Us
                  </Menu.Item>
                </a>
                <Menu.Item icon={<IconLogout size={14} />} onClick={logout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button
              onClick={openAuthDialog}
              color="orange"
              size="xs"
              className="sign-up"
            >
              Sign Up
            </Button>
          )}
          {authDialog && (
            <AuthDialog opened={authDialog} onClose={closeAuthDialog} />
          )}
        </Flex>
      </Flex>
    </Header>
  );
};

export default TemplateHeader;
