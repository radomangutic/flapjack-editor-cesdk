import {
  Avatar,
  Badge,
  Table,
  Group,
  Text,
  ActionIcon,
  Anchor,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons";
import { IUserDetails } from "../../interfaces";
import { ModalType } from "../../pages/restaurant/[id]";

interface UsersTableProps {
  data: IUserDetails[];
  setmodalType: (modalType: ModalType) => void;
  setselectedUser: (user: IUserDetails) => void;
}

export function UsersTable({
  data,
  setmodalType,
  setselectedUser,
}: UsersTableProps) {
  const theme = useMantineTheme();
  const rows = data.map((item: IUserDetails) => (
    <tr key={item.id}>
      <td>
        <Group spacing="sm">
          <Avatar size={30} radius="xl" />
        </Group>
      </td>

      <td>
        <Anchor component="button" size="sm">
          {item.email}
        </Anchor>
      </td>
      <td>
        <Text fz="sm" c="dimmed">
          {item.role}
        </Text>
      </td>
      <td>
        <Text fz="sm" c="dimmed">
          {item.phone}
        </Text>
      </td>
      <td>
        <Text fz="sm" c="dimmed">
          {item?.subscriptionActive ? "True" : "False"}
        </Text>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            color="red"
            onClick={() => {
              setselectedUser(item);
              setmodalType("removeUser");
            }}
          >
            <IconTrash size="1rem" stroke={1.5} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table verticalSpacing="sm">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Subscription</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
