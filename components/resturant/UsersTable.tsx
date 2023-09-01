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

interface UsersTableProps {
  data: IUserDetails[];

  onDelete: (user: IUserDetails) => void;
  onEdit?: (user: IUserDetails) => void;
}

export function UsersTable({ data, onDelete, onEdit }: UsersTableProps) {
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
          {onEdit && (
            <ActionIcon
              onClick={() => {
                onEdit(item);
              }}
            >
              <IconPencil size="1rem" stroke={1.5} />
            </ActionIcon>
          )}

          <ActionIcon
            color="red"
            onClick={() => {
              onDelete(item);
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
