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
  TextInput,
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
interface ILoginErrors {
  email?: string;
  phone?: string;
}
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
function extractDoubleQuotedStrings(inputString: string): string {
  const regex = /"([^"]*)"/g;
  const matches = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    matches.push(match[1]); // Use match[1] to capture the content inside the quotes
  }

  return matches[0];
}
interface Props {
  onClose: () => void;
  newUser: (user: IUserDetails) => void;
  selectedUser: IUserDetails | null;
}
const UpdateUser = ({ onClose, newUser, selectedUser }: Props) => {
  const { supabaseClient: supabase } = useSessionContext();
  const { classes } = useStyles();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();
  const [error, setError] = useState<ILoginErrors>({});

  const [value, setValue] = useState<string>(`+${selectedUser?.phone}` ?? "");
  const [email, setemail] = useState<string>(selectedUser?.email ?? "");
  let errorOnSubmit;

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      errorOnSubmit = { phone: "Something went wrong" };
      setError(errorOnSubmit);
      setisLoading(false);
      return;
    }
    try {
      setisLoading(true);
      const { data, error } = await dbClient.auth.admin.updateUserById(
        selectedUser?.id,
        {
          email: email,
          phone: value,
        }
      );

      if (error) {
        const getErrortype = extractDoubleQuotedStrings(error?.message);

        const customMessage =
          getErrortype === "users_phone_key"
            ? "Phone number already registered by another user"
            : getErrortype === "users_email_partial_key"
            ? "Email already registered by another user"
            : "";

        errorOnSubmit = {
          phone: getErrortype ? customMessage : error?.message,
        };
        setError(errorOnSubmit);
        setisLoading(false);
        return;
      }
      console.log("data", data);
       await supabase
        .from("profiles")
        .update({ email: email, phone: value.slice(1) })
        .eq("id", data.user?.id)
        .single();
        const response = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user?.id)
        .single();
      if (!error) {
        newUser(response?.data);
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
    setError({});
    if (!email) {
      errorOnSubmit = { email: "Email required" };
      setError(errorOnSubmit);
      return;
    }
    if (!validateEmail(email)) {
      errorOnSubmit = { email: "Invalid email" };
      setError(errorOnSubmit);
      return;
    }
    if (!value) {
      errorOnSubmit = { phone: "Phone required" };
      setError(errorOnSubmit);
      return;
    }
    if (!isValidPhoneNumber(value)) {
      errorOnSubmit = { phone: "Invalid phone" };
      setError(errorOnSubmit);
      return;
    }
    await handleUpdateUser();
  };

  return (
    <Paper m="auto" my={4} p={4} style={{ maxWidth: "500px" }}>
    
      <Box >
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
          <Text fz={"sm"} color={"red"} mt={10}>
            {error?.phone}
          </Text>
        )}
      </Box>
      <Box mt={10}>
        <TextInput
          label="Email address"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          labelProps={{
            style: { color: "grey", marginBottom: "10px" },
          }}
        />
        {error?.email && (
          <Text fz={"sm"} color={"red"}>
            {error?.email}
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
          Update
        </Button>
      </div>
    </Paper>
  );
};

export default UpdateUser;
