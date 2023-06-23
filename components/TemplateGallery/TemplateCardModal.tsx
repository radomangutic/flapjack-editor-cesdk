import { Button, Flex, Input, Modal, Text, Textarea } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";

const modalTypeContent = {
  delete: "Are you sure you want to delete this menu?",
  rename: "Rename Template",
  duplicate:"Are you sure you want to Duplicate this menu?"
};

export interface TemplateCardModalProps {
  isOpened: boolean;
  closeModal: () => void;
  type: keyof typeof modalTypeContent;
  onDeleteTemplate: () => Promise<void>;
  onRenameTemplate: (name: string, description: string) => Promise<void>;
  onDuplicateTemplate: (name: string, description: string) => Promise<void>;
  templateName: string;
  templateDescription: string;
}

export default function TemplateCardModal({
  isOpened,
  closeModal,
  type,
  onDeleteTemplate,
  onRenameTemplate,
  onDuplicateTemplate,
  templateName,
  templateDescription,
}: TemplateCardModalProps) {
  const [name, setName] = useState(templateName);
  const [description, setDescription] = useState(templateDescription);
  const [isLoading, setIsLoading] = useState(false);
  const isDeleteModal = useMemo(() => type === "delete", [type]);
  const isDuplicateModal = useMemo(() => type === "duplicate", [type]);
  
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setDescription(e.target.value),
    []
  );

  const handleModalSubmit = useCallback(async () => {
    setIsLoading(true);
    await (isDeleteModal
      ? onDeleteTemplate()
      : isDuplicateModal ? onDuplicateTemplate(name, description) : onRenameTemplate(name, description));
    setIsLoading(false);
  }, [description, isDeleteModal, name, onDeleteTemplate, onRenameTemplate, onDuplicateTemplate, isDuplicateModal]);

  return (
    <Modal
      centered
      size={311}
      opened={isOpened}
      onClose={closeModal}
      styles={{
        header: {
          marginBottom: 0,
        },
      }}
    >
      <Text size={24} weight={300} align="center" px="md">
        {modalTypeContent[type]}
      </Text>

      {!isDeleteModal && !isDuplicateModal && (
        <form>
          <Input.Wrapper
            label="Template Name"
            size="md"
            mb="md"
            mt="lg"
            styles={{
              label: {
                fontWeight: 600,
              },
            }}
          >
            <Input
              placeholder="Bakery"
              size="md"
              value={name}
              onChange={handleNameChange}
            />
          </Input.Wrapper>

          <Textarea
            label="Description"
            size="md"
            styles={{
              label: {
                fontWeight: 600,
              },
            }}
            minRows={3}
            maxRows={3}
            placeholder="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet"
            value={description}
            onChange={handleDescriptionChange}
          />
        </form>
      )}

      <Flex mt="xl" justify="center">
        <Button
          variant="outline"
          color="dark"
          size="md"
          onClick={closeModal}
          mr="md"
        >
          Cancel
        </Button>
        <Button
          color="yellow.9"
          size="md"
          onClick={handleModalSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </Button>
      </Flex>
    </Modal>
  );
}
