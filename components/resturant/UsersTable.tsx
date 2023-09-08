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

  onDelete?: (user: IUserDetails) => void;
  onEdit?: (user: IUserDetails) => void;
  hideAction?: boolean;
  resturantsOptions?: any;
}

export function UsersTable({
  data,
  onDelete,
  onEdit,
  hideAction = false,
  resturantsOptions,
}: UsersTableProps) {
  const theme = useMantineTheme();
  const rows = data.map((item: IUserDetails) => {
    const getRestaurant = resturantsOptions?.find(
      (i: any) => i?.value === item?.restaurant_id
    );
    return (
      <tr key={item.id}>
        <td>
          <Group spacing="sm">
            <Avatar size={30} radius="xl" />
          </Group>
        </td>
        <td>
          <Text fz="sm" c="dimmed">
            {item.phone}
          </Text>
        </td>
        <td>
          <Anchor component="button" size="sm">
            {item.email}
          </Anchor>
        </td>
        {resturantsOptions && (
          <td>
            <Text fz="sm" c="dimmed">
              {getRestaurant?.label}
            </Text>
          </td>
        )}

        <td>
          <Text fz="sm" c="dimmed">
            {item.role}
          </Text>
        </td>
        
        {!hideAction && (
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
              {onDelete && (
                <ActionIcon
                  color="red"
                  onClick={() => {
                    onDelete(item);
                  }}
                >
                  <IconTrash size="1rem" stroke={1.5} />
                </ActionIcon>
              )}
            </Group>
          </td>
        )}
      </tr>
    );
  });
  
  return (
    <ScrollArea>
      <Table verticalSpacing="sm">
        <thead>
          <tr>
            <th>User</th>
            <th>Phone</th>
            <th>Email</th>
            {resturantsOptions && <th>Restaurant</th>}
            <th>Role</th>
            {!hideAction && <th />}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
