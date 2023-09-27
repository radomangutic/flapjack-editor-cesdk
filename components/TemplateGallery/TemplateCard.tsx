import { Card, Image, Text, Badge } from "@mantine/core";
import { useCallback, useState } from "react";
import { ITemplateDetails } from "../../interfaces";
import TemplateCardOverlay from "./TemplateCardOverlay";
import { useUser } from "../../hooks";

export type RemoveTemplate =
  | ((template: ITemplateDetails) => Promise<void>)
  | undefined;
export type DuplicateTemplate =
  | ((
      templateDetails: Pick<ITemplateDetails, "id" | "name" | "description">
    ) => Promise<void>)
  | undefined;

export type GlobalTemplate =
  | ((
      templateDetails: Pick<ITemplateDetails, "id" | "isGlobal">,
      id: string
    ) => Promise<void>)
  | undefined;

export type RenameTemplate =
  | ((
      templateDetails: Pick<ITemplateDetails, "id" | "name" | "description">
    ) => Promise<void>)
  | undefined;

type TemplateCardProps = {
  template: ITemplateDetails;
  thumbnail?: string;
  onRemove?: RemoveTemplate;
  onRename?: RenameTemplate;
  onDuplicate?: DuplicateTemplate;
  onGlobal?: GlobalTemplate;
  navMenu: string;
  resturantsOptions: any;
  setTemplates: any;
  badge?: boolean;
};

const TemplateCard = ({
  template,
  thumbnail,
  onRemove,
  onRename,
  onDuplicate,
  onGlobal,
  navMenu,
  resturantsOptions,
  setTemplates,
  badge,
}: TemplateCardProps) => {
  const user = useUser();

  const [showOverlay, setShowOverlay] = useState(false);
  const openOverlay = useCallback(() => {
    if (
      ((user?.role == "user" && user?.subscriptionActive) ||
        user?.role === "flapjack") &&
      navMenu == "myMenu"
    ) {
      setShowOverlay(true);
    } else if (user?.role === "user" && navMenu == "myMenu") {
      setShowOverlay(true);
    } else if (navMenu === "templates") {
      setShowOverlay(true);
    } else if (user?.role === "owner") {
      setShowOverlay(true);
    } else if (navMenu === "customerMenus") {
      setShowOverlay(true);
    } else if (navMenu === "user") {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [navMenu, user]);

  const closeOverlay = useCallback(() => setShowOverlay(false), []);

  return (
    <Card
      shadow="sm"
      px="sm"
      radius="md"
      withBorder
      sx={{ height: "100%" }}
      onMouseEnter={openOverlay}
      onMouseLeave={closeOverlay}
      component="a"
      href={`/menu/${template.id}`}
    >
      <Card.Section pos="relative">
        <TemplateCardOverlay
          showOverlay={showOverlay}
          setShowOverlay={setShowOverlay}
          template={template}
          onHandleDeleteTemplate={onRemove}
          onHandleRenameTemplate={onRename}
          onHandleDuplicateTemplate={onDuplicate}
          onHandleGlobal={onGlobal}
          navMenu={navMenu}
          resturantsOptions={resturantsOptions}
          setTemplates={setTemplates}
        />

        <Image src={thumbnail} height={235} alt="Norway" />
        {badge && (
          <Badge
            color={template?.isGlobal ? "green" : "orange"}
            variant="filled"
            pos="absolute"
            bottom={15}
            right={15}
          >
            {template?.isGlobal ? "Live" : "Draft"}
          </Badge>
        )}
      </Card.Section>
      <Text weight={600} size="lg" mb="md" mt="sm">
        {template.name}
      </Text>
      <Text size="md" color="dimmed">
        {template.description}
      </Text>
    </Card>
  );
};

export default TemplateCard;
