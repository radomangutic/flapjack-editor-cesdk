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
  allUsers: IUserDetails[];
}
const InviteUserDesign = ({ onClose, resturantDetail, allUsers }: Props) => {
  const { supabaseClient: supabase } = useSessionContext();
  const { classes } = useStyles();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();
  const [error, setError] = useState("");
  const [value, setValue] = useState<string>("");

  const handleInviteUser = async () => {
    try {
      if (!value) {
        setError("Phone number required");
        return;
      }
      if (!isValidPhoneNumber(value) && value) {
        setError("Invalid phone");
        return;
      }
      const userAlreadyMember = allUsers?.find(
        (user) => user?.phone === value?.slice(1)
      );
      if (userAlreadyMember) {
        setError("User already a member of your restaurant");
        return;
      }
      setisLoading(true);
      const checkUserExist = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", value?.slice(1))
        .single();
      const isUserExist = checkUserExist?.data;
      if (isUserExist) {
        await supabase
          .from("profiles")
          .update({
            restaurant_id: resturantDetail?.id,
          })
          .eq("id", isUserExist?.id)
          .single();
      }
      const response = await fetch("/api/inviteuser", {
        method: "POST",
        body: JSON.stringify({
          phone: value,
          restaurantName: resturantDetail?.name,
          restaurantId: isUserExist ? null : resturantDetail?.id,
          isUserExist: isUserExist ? true : false,
        }),
      });
      setisLoading(false);

      if (response.ok) {
        const data = await response.json();
        onClose();
      } 
    } catch (error: any) {
      setisLoading(false);
      setError(error?.message);
      throw error
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
