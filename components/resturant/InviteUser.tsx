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
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { IUserDetails } from "../../interfaces";
import { useUser } from "../../hooks";
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

const InviteUserDesign = () => {
  const { supabaseClient: supabase } = useSessionContext();
  const { classes } = useStyles();
  const [isLoading, setisLoading] = useState(false);
  const user = useUser();

  const [users, setUsers] = useState<IUserDetails[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      setisLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("restaurant_id", user?.restaurant_id);
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }
      setisLoading(false);
      setUsers(data);
    }
    if (supabase) {
      fetchUsers();
    }
  }, [supabase]);

  const handleUserClick = (user: IUserDetails) => {
    alert(`Clicked on user: ${user.email}`);
  };

  return (
    <Paper m="auto" my={4} p={4} shadow="xs" style={{ maxWidth: "500px" }}>
      {isLoading ? (
        <Flex justify={"center"} mih={"100px"} align={"center"}>
          <Loader />
        </Flex>
      ) : users.length === 0 ? (
        <Text>No users found.</Text>
      ) : (
        users.map((user) => (
          <UnstyledButton
            key={user.id}
            className={classes.user}
            onClick={() => handleUserClick(user)}
          >
            <Group>
              <Avatar radius="xl" />

              <div style={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {user.email}
                </Text>

                <Text color="dimmed" size="xs">
                  {user.role}
                </Text>
              </div>

              {<IconChevronRight size="0.9rem" stroke={1.5} />}
            </Group>
          </UnstyledButton>
        ))
      )}
    </Paper>
  );
};

export default InviteUserDesign;
