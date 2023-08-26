import React, { useState } from "react";
import {
  Paper,
  Button,
  Text,
  Modal,
  ModalProps,
  PaperProps,
} from "@mantine/core";
import { IUserDetails } from "../../interfaces";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface RemoveUserProps {
  onClose: () => void;
  onRemove: () => void;
  isLoading: boolean;
  userEmail:string | undefined;
}

const RemoveUser: React.FC<RemoveUserProps> = ({
  onRemove,
  isLoading,
  onClose,userEmail
}) => {
  return (
    <Paper>
      <Text size="xl" weight={500} align="center" mb="lg">
        Are you sure you want to remove the {userEmail}?
      </Text>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button color="gray" onClick={onClose} mr={"10px"}>
          Cancel
        </Button>
        <Button color="red" onClick={onRemove} loading={isLoading}>
          Remove
        </Button>
      </div>
    </Paper>
  );
};

export default RemoveUser;
