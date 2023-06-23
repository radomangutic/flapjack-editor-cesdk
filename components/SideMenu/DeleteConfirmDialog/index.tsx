import { Button, Flex, Modal, ModalProps } from "@mantine/core";

interface IDeleteConfirmDialogProps extends ModalProps {
  confirm: () => void;
  contentName: string;
}

const DeleteConfirmDialog: React.FC<IDeleteConfirmDialogProps> = ({
  opened,
  onClose,
  contentName,
  confirm,
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title={`Do you want to delete ${contentName}?`} withCloseButton radius="md" centered>
      <Flex>
        <Button variant="outline" onClick={onClose} style={{ marginRight: '0.5rem' }}>
          Cancel
        </Button>
        <Button variant="filled" color="red" onClick={confirm}>
          Delete
        </Button>
      </Flex>
    </Modal>
  );
};

export default DeleteConfirmDialog;
