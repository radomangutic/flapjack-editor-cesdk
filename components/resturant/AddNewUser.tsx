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
import { dbClient } from "../../tests/helpers/database.helper";
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
  newUser: (user: IUserDetails) => void;
}
const AddNewUser = ({ onClose, newUser }: Props) => {
  const { supabaseClient: supabase } = useSessionContext();
  const { classes } = useStyles();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();
  const [error, setError] = useState("");
  const [value, setValue] = useState<string>("");

  const handleCreateUser = async () => {
    try {
      setisLoading(true);
      const { data, error } = await dbClient.auth.admin.createUser({
        phone: value,
        phone_confirm: true,
      });
      if (error) {
        setError(error?.message);
        setisLoading(false);
        return;
      }
      console.log("data", data);
      const response = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user?.id)
        .single();
      if (!error) {
        newUser(response.data);
        onClose();
      }
      setisLoading(false);
    } catch (error: any) {
      console.log("An error occurred", error);
      setisLoading(false);

      setError(error?.message);
    }
  };
  const handleSubmit = async () => {
    setError("");
    if (!isValidPhoneNumber(value)) {
      setError("Invalid phone");
      return;
    }
    await handleCreateUser();
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
          Add
        </Button>
      </div>
    </Paper>
  );
};

export default AddNewUser;
