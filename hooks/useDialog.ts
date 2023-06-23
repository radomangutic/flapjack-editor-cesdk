import { useState } from "react";

export const useDialog = (
  initialState: boolean
): [boolean, () => void, () => void] => {
  const [open, setOpen] = useState(initialState);

  const onOpen = () => setOpen(true);

  const onClose = () => setOpen(false);

  return [open, onOpen, onClose];
};
