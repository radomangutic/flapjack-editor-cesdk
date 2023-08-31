import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Paper,
  UnstyledButton,
  UnstyledButtonProps,
  Group,
  Avatar,
  Text,
  createStyles,
  Loader,
  Box,
  Flex,
  Button,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { IUserDetails } from "../../interfaces";
import { useUser } from "../../hooks";
import { RestaurantType } from "../../interfaces/RestaurantType";
const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
  },
}));
interface Props {
  onClose: () => void;
  resturantDetail: RestaurantType;
}
const InviteUserDesign = ({ onClose, resturantDetail }: Props) => {
  const { supabaseClient: supabase } = useSessionContext();
  const { classes } = useStyles();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();
  const [error, setError] = useState("");
  const [value, setValue] = useState<string>("");

  const handleInviteUser = async () => {
    try {
      setisLoading(true)
      const response = await fetch("/api/inviteuser", {
        method: "POST",
        body: JSON.stringify({
          phone: value,
          restaurantName: resturantDetail?.name,
          restaurantId: resturantDetail?.id,
        }),
      });
      console.log("response===>", response);
      setisLoading(false)

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        onClose();
      } else {
        console.error("Failed to send invitation");
      }
    } catch (error: any) {
      console.log("An error occurred", error);
      setisLoading(false)

      setError(error?.message);
    }
  };
  const handleSubmit = async () => {
    if (!isValidPhoneNumber(value)) {
      setError("Invalid phone");
      return;
    }
    await handleInviteUser();
  };

  return (
    <Paper m="auto" my={4} p={4} style={{ maxWidth: "500px" }}>
      <Box>
        <label
          className="mantine-InputWrapper-label mantine-TextInput-label mantine-ittua2"
          style={{ color: "gray", marginBottom: "10px" }}
        >
          Phone
        </label>
        <PhoneInput
          placeholder="Enter user phone number"
          value={value}
          onChange={(phone: string) => setValue(phone)}
          className="input-phone"
          defaultCountry="US"
        />

        {error && (
          <Text fz={"sm"} color={"red"}>
            {error}
          </Text>
        )}
      </Box>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <Button color="gray" onClick={onClose} mr={"10px"}>
          Cancel
        </Button>
        <Button color="red" onClick={handleSubmit} loading={isLoading}>
          Send
        </Button>
      </div>
    </Paper>
  );
};

export default InviteUserDesign;
