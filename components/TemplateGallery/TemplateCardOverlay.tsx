import {
  ActionIcon,
  Button,
  CloseButton,
  Flex,
  Menu,
  Overlay,
} from "@mantine/core";
import { IconDots } from "@tabler/icons";
import { useRouter } from "next/router";
import { useCallback, useState, useMemo } from "react";
import { useUser } from "../../hooks";
import { ITemplateDetails } from "../../interfaces";
import {
  DuplicateTemplate,
  GlobalTemplate,
  RemoveTemplate,
  RenameTemplate,
} from "./TemplateCard";
import TemplateCardModal, { TemplateCardModalProps } from "./TemplateCardModal";

interface TemplateCardOverlayProps {
  showOverlay: boolean;
  setShowOverlay: (showOverlay: boolean) => void;
  template: ITemplateDetails;
  onHandleDeleteTemplate: RemoveTemplate;
  onHandleRenameTemplate: RenameTemplate;
  onHandleDuplicateTemplate: DuplicateTemplate;
  onHandleGlobal: GlobalTemplate;
  navMenu: string;
}

export default function TemplateCardOverlay({
  showOverlay,
  setShowOverlay,
  template,
  onHandleDeleteTemplate,
  onHandleRenameTemplate,
  onHandleDuplicateTemplate,
  onHandleGlobal,
  navMenu,
}: TemplateCardOverlayProps) {
  const {
    id: templateId,
    name: templateName,
    description: templateDescription,
  } = template;
  const router = useRouter();
  const user = useUser();
  const canUpdate = useMemo(() => {
    if (!user || !router.pathname.includes("templates")) return false;

    const flapjackCanUpdate = user?.role === "flapjack" || user?.role === "owner";
    const isUserTemplate =
      (user?.id === template.createdBy )&& user?.role === "user";

    return flapjackCanUpdate || isUserTemplate;
  }, [user, router.pathname, template.isGlobal, template.createdBy, navMenu]);
  const [menuIsOpened, setMenuIsOpened] = useState(false);
  const [modalIsOpened, setModalIsOpened] = useState(false);
  const [modalType, setModalType] =
    useState<TemplateCardModalProps["type"]>("delete");

  const handleOpenMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuIsOpened(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowOverlay(false);
    setModalIsOpened(false);
  }, [setShowOverlay]);

  const openModal = useCallback((e: React.MouseEvent) => {
    const type = (
      e.target as Element
    ).textContent?.toLowerCase() as TemplateCardModalProps["type"];
    setModalType(type);
    setModalIsOpened(true);
  }, []);

  const handleDeleteTemplate = useCallback(async () => {
    if (!onHandleDeleteTemplate) return;
    await onHandleDeleteTemplate(templateId, template?.content);
    closeModal();
  }, [onHandleDeleteTemplate, templateId, closeModal]);

  const handleRenameTemplate = useCallback(
    async (name: string, description: string) => {
      if (!onHandleRenameTemplate) return;
      await onHandleRenameTemplate({ id: templateId, name, description });
      closeModal();
    },
    [onHandleRenameTemplate, templateId, closeModal]
  );
  const handleDuplicateTemplate = useCallback(
    async (name: string, description: string) => {
      if (!onHandleDuplicateTemplate) return;
      await onHandleDuplicateTemplate({ id: templateId, name, description });
      closeModal();
    },
    [onHandleDuplicateTemplate, templateId, closeModal]
  );

  const handleGlobal = useCallback(async () => {
    if (!onHandleGlobal) return;
    if (user && user.id) {
      await onHandleGlobal(template, user.id);
    }
  }, [onHandleGlobal, user?.id]);

  if (!showOverlay) return null;

  return (
    <Overlay color="black" zIndex={3}>
      {canUpdate && (
        <Menu
          position="bottom-end"
          width={194}
          withinPortal
          opened={menuIsOpened}
          onChange={setMenuIsOpened}
          styles={{
            item: {
              fontSize: 16,
            },
          }}
        >
          <Menu.Target>
            <Flex
              justify="right"
              right={18}
              top={10}
              pos="absolute"
              onClick={handleOpenMenu}
            >
              {menuIsOpened ? (
                <CloseButton
                  iconSize={24}
                  onClick={closeMenu}
                  variant="transparent"
                />
              ) : (
                <ActionIcon variant="transparent" style={{ color: "#fff" }}>
                  <IconDots size={24} />
                </ActionIcon>
              )}
            </Flex>
          </Menu.Target>

          <Menu.Dropdown>
            {user?.role === "flapjack" && (
              <Menu.Item onClick={handleGlobal}>
                {template.isGlobal ? "Make Private" : "Publish Global"}
              </Menu.Item>
            )}
            {(template?.isGlobal || navMenu === "myMenu") && (
              <Menu.Item onClick={openModal}>Duplicate</Menu.Item>
            )}
            <Menu.Item onClick={openModal}>Rename</Menu.Item>
            <Menu.Item onClick={openModal}>Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      <TemplateCardModal
        isOpened={modalIsOpened}
        closeModal={closeModal}
        type={modalType}
        onDuplicateTemplate={handleDuplicateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onRenameTemplate={handleRenameTemplate}
        templateName={templateName}
        templateDescription={templateDescription}
      />

      <Flex justify="center">
        <Button
          variant="outline"
          color="dark.1"
          radius="xl"
          size="md"
          top={55}
          styles={() => ({
            root: {
              border: "2px solid #fff",
              color: "#fff",
            },
          })}
        >
          Edit Template
        </Button>
      </Flex>
    </Overlay>
  );
}
