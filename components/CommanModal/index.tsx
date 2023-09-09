import { Box, Modal } from "@mantine/core";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  maxHeight?: string;
}
const CommanModal = ({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = "400px",
}: Props) => {
  return (
    <Modal opened={isOpen} onClose={onClose} title={title} centered>
      <Box mah={maxHeight} sx={{ overflow: "auto" }}>
        {children}
      </Box>
    </Modal>
  );
};

export default CommanModal;
