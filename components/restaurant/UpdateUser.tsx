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
  Select,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { IUserDetails } from "../../interfaces";
import { fetchResturants, useUser } from "../../hooks";
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
  apiError?: string;
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
  resturantsOptions: any;
}
const roleData = [
  {
    label: "owner",
    value: "1",
  },
  {
    label: "user",
    value: "2",
  },
  {
    label: "flapjack",
    value: "3",
  },
];
const UpdateUser = ({
  onClose,
  newUser,
  selectedUser,
  resturantsOptions,
}: Props) => {
  const { supabaseClient: supabase } = useSessionContext();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();
  const [error, setError] = useState<ILoginErrors>({});
  const [resturantId, setResturantId] = useState(selectedUser?.restaurant_id);
  const [userRole, setuserRole] = useState<any>(
    roleData?.find((i) => i?.label === selectedUser?.role)
  );
  const [value, setValue] = useState<string>(
    selectedUser?.phone ? `+${selectedUser?.phone}` ?? "" : ""
  );

  const [email, setemail] = useState<string>(selectedUser?.email ?? "");
  let errorOnSubmit;


  const handleUpdateUser = async () => {
    if (!selectedUser) {
      errorOnSubmit = { apiError: "Something went wrong" };
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
          apiError: getErrortype ? customMessage : error?.message,
        };
        setError(errorOnSubmit);
        setisLoading(false);
        return;
      }
      await supabase
        .from("profiles")
        .update({
          email: email,
          phone: value.slice(1),
          restaurant_id: resturantId,
          role: userRole?.label,
        })
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
      setisLoading(false);

      setError(error?.message);
    }
  };

  const handleSubmit = async () => {
    setError({});
    if (!value) {
      errorOnSubmit = { phone: "Phone number required" };
      setError(errorOnSubmit);
      return;
    }
    if (!isValidPhoneNumber(value) && value) {
      errorOnSubmit = { phone: "Invalid phone" };
      setError(errorOnSubmit);
      return;
    }
    if (!validateEmail(email) && email) {
      errorOnSubmit = { email: "Invalid email" };
      setError(errorOnSubmit);
      return;
    }

    await handleUpdateUser();
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

        {error?.phone && (
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
      <Box mt={10}>
        <Select
          label="Select a resturant"
          placeholder="Select a resturant"
          data={resturantsOptions}
          searchable
          onChange={(value: any) => setResturantId(value)}
          maxDropdownHeight={400}
          nothingFound="Resturant not found"
          filter={(value: string, item: any) =>
            item.label.toLowerCase().includes(value.toLowerCase().trim())
          }
          value={resturantId}
        />
      </Box>
      <Box mt={10}>
        <Select
          label="Select user role"
          placeholder="Select user role"
          data={roleData}
          searchable
          onChange={(value: any) => {
            const findValue = roleData?.find((i) => i?.value === value);
            if (findValue) {
              setuserRole(findValue);
            }
          }}
          maxDropdownHeight={400}
          nothingFound="Resturant not found"
          filter={(value: string, item: any) =>
            item.label.toLowerCase().includes(value.toLowerCase().trim())
          }
          value={userRole?.value}
        />
      </Box>
      {error?.apiError && (
        <Text fz={"sm"} color={"red"} mt={10}>
          {error?.apiError}
        </Text>
      )}
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
