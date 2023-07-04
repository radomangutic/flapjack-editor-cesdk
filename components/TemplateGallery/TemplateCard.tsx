import { Card, Image, Text, Badge } from "@mantine/core";
import { useCallback, useState } from "react";
import { ITemplateDetails } from "../../interfaces";
import TemplateCardOverlay from "./TemplateCardOverlay";
import { useUser } from "../../hooks";

export type RemoveTemplate = ((id: number) => Promise<void>) | undefined;
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
};

const TemplateCard = ({
  template,
  thumbnail,
  onRemove,
  onRename,
  onDuplicate,
  onGlobal,
}: TemplateCardProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const openOverlay = useCallback(() => setShowOverlay(true), []);
  const closeOverlay = useCallback(() => setShowOverlay(false), []);
  const user = useUser();
  console.log("role==>", template.restaurant_id === user?.restaurant_id);

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
        {(template.createdBy === user?.id ||
          user?.role === "flapjack" ||
          (template.restaurant_id === user?.restaurant_id &&
            user?.role === "owner")) && (
          <TemplateCardOverlay
            showOverlay={showOverlay}
            setShowOverlay={setShowOverlay}
            template={template}
            onHandleDeleteTemplate={onRemove}
            onHandleRenameTemplate={onRename}
            onHandleDuplicateTemplate={onDuplicate}
            onHandleGlobal={onGlobal}
          />
        )}

        <Image src={thumbnail} height={235} alt="Norway" />
        {template?.menuSize && (
          <Badge
            color="orange"
            variant="filled"
            pos="absolute"
            bottom={15}
            left={15}
          >
            {template.menuSize}
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
