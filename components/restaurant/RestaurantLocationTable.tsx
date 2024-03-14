import {
  Table,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  useMantineTheme,
  Box,
  TextInput,
  Button,
  Flex,
} from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons";
import { RestaurantType } from "../../interfaces/RestaurantType";
import { useState } from "react";
import CommanModal from "../CommonModal";
import RemoveUser from "./RemoveUser";
import { dbClient } from "../../tests/helpers/database.helper";

interface UsersTableProps {
  data: RestaurantType;
}
type RestaurantModalType = "empty" | "removeLocation" | "addLocation";
export function RestaurantLocationTable({ data }: UsersTableProps) {

  const [locations, setlocations] = useState<string[]>(data?.location);
  const [modalType, setmodalType] = useState<RestaurantModalType>("empty");
  const [isLoading, setisLoading] = useState(false);
  const [selectedLocation, setselectedLocation] = useState("");
  const [error, seterror] = useState("");
  const [isEditLocation, setisEditLocation] = useState("");
  const theme = useMantineTheme();
  const rows = locations?.map((item: string, index: number) => (
    <tr key={index}>
      <td>
        <Text fz="sm" c="dimmed">
          {item}
        </Text>
      </td>

      <td>
        <Group spacing={0} position="right">
          <ActionIcon
            onClick={() => {
              setselectedLocation(item);
              setisEditLocation(item);
              setmodalType("addLocation");
            }}
          >
            <IconPencil size="1rem" stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => {
              setselectedLocation(item);
              setmodalType("removeLocation");
            }}
          >
            <IconTrash size="1rem" stroke={1.5} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));
  async function updateRestaurantLocation(
    newLocation: string[]
  ): Promise<RestaurantType | null> {
    try {
      const response = await dbClient
        .from("restaurants")
        .update({
          location: newLocation,
        })
        .eq("id", data?.id)
        .single();
      if (response.error) {
        throw response.error;
      }
      setlocations(newLocation);
      return response.data || null;
    } catch (error: any) {
      return null;
    }
  }
  const onRemoveLocation = async () => {
    setisLoading(true);
    const filterLocaton = locations?.filter((i) => i !== selectedLocation);
    const resonse: RestaurantType | null = await updateRestaurantLocation(
      filterLocaton
    );
    await dbClient
      .from("templates")
      .update({ location: null })
      .eq("location", selectedLocation)
      .eq("restaurant_id", data?.id);
    if (resonse) {
      setlocations(resonse?.location);
    }
    setisLoading(false);
    setselectedLocation("");
    setmodalType("empty");
    setisEditLocation("");
  };
  const addLocation = async () => {
    if (isEditLocation) {
      setisLoading(true);
      const filterLocaton = locations?.filter((i) => i !== isEditLocation);

      const resonse: RestaurantType | null = await updateRestaurantLocation([
        ...filterLocaton,
        selectedLocation,
      ]);
      await dbClient
        .from("templates")
        .update({ location: isEditLocation })
        .eq("location", selectedLocation)
        .eq("restaurant_id", data?.id);
      if (resonse) {
        setlocations(resonse?.location);
      }
      setisLoading(false);
      setselectedLocation("");
      setmodalType("empty");
    } else {
      setisLoading(true);
      const updatedLocation = locations?.length
        ? [...locations, selectedLocation]
        : [selectedLocation];
      const resonse: RestaurantType | null = await updateRestaurantLocation(
        updatedLocation
      );
      if (resonse) {
        setlocations(resonse?.location);
      }
      setisLoading(false);
      setselectedLocation("");
      setmodalType("empty");
    }
    setisEditLocation("");
  };
  return (
    <>
      <Flex justify={"flex-end"} my={10}>
        <Button
          size="xs"
          color="orange"
          onClick={() => setmodalType("addLocation")}
          sx={{ marginRight: "1rem" }}
        >
          Add New Location
        </Button>
      </Flex>
      <ScrollArea>
        <Table verticalSpacing="sm">
          <thead>
            <tr>
              <th>Location</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      {
        {
          empty: <></>,
          removeLocation: (
            <CommanModal
              title={"Remove a location"}
              isOpen={true}
              onClose={() => setmodalType("empty")}
            >
              <RemoveUser
                onClose={() => setmodalType("empty")}
                onRemove={onRemoveLocation}
                isLoading={isLoading}
                userEmail={selectedLocation}
              />
            </CommanModal>
          ),
          addLocation: (
            <CommanModal
              title={isEditLocation ? "Edit a location" : `Add a location`}
              isOpen={true}
              onClose={() => setmodalType("empty")}
            >
              <Box>
                <TextInput
                  label="Enter Location"
                  placeholder="Enter your location"
                  value={selectedLocation}
                  onChange={(e) => setselectedLocation(e.target.value)}
                  labelProps={{
                    style: { color: "grey", marginBottom: "10px" },
                  }}
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
                <Button
                  color="gray"
                  onClick={() => setmodalType("empty")}
                  mr={"10px"}
                >
                  Cancel
                </Button>
                <Button color="red" onClick={addLocation} loading={isLoading}>
                  {isEditLocation ? "Update Location" : "Add Location"}
                </Button>
              </div>
            </CommanModal>
          ),
        }[modalType]
      }
    </>
  );
}
