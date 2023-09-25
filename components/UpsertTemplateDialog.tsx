import {
  Button,
  Flex,
  Modal,
  TextInput,
  Center,
  Box,
  Image,
  Text,
  Input,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { getUser, templateArchive, useUser } from "../hooks";
import { ITemplate } from "../interfaces";
import { dbClient } from "../tests/helpers/database.helper";
import { v4 as uuidv4 } from "uuid";
import { IconPhotoPlus } from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { removeSpecialCharacters } from "../helpers/CommonFunctions";

interface IUpsertTemplateDialogProps {
  opened: boolean;
  onClose: () => void;
  template?: ITemplate | null;
  content: any;
  restaurantsOptions: any;
}

const UpsertTemplateDialog = ({
  opened,
  onClose,
  template,
  content,
  restaurantsOptions,
}: IUpsertTemplateDialogProps) => {
  const supabase = useSupabaseClient();
  const [isFileEsist, setisFileEsist] = useState(false);
  const user = useUser();
  const userData = getUser();
  const userLocation = userData?.restaurant?.location?.length
    ? user?.restaurant?.location?.map((item: string) => {
      return {
        label: item,
        value: item,
      };
    })
    : [];
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [loader, setloader] = useState(false);
  const [locations, setlocations] = useState(userLocation);
  const [restaurantId, setRestaurantId] = useState(
    template?.restaurant_id || ""
  );
  const [location, setLocation] = useState(template?.location || "");
  const [isModalOpen, { open, close }] = useDisclosure(false);
  const [values, setValues] = useState();
  const filUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/renderings/${router.query.id
    }/coverImage?${Date.now()}`;

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (loader) {
      e.preventDefault();
      e.returnValue = "Unsaved template. Going back may lose changes."; // This message will be displayed to the user
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loader]);

  const form = useForm({
    initialValues: {
      name: removeSpecialCharacters(template?.name) || "",
      description: removeSpecialCharacters(template?.description) || "",
      coverImage: null,
    },
    validate: {
      name: (value: string) => (value ? null : "Required"),
      description: (value: string) => (value ? null : "Required"),
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setloader(true);
      const isUpdating = router.query.id;
      const file = new Blob([content], { type: "text/plain" });
      setTimeout(() => {
        onClose();
      }, 1000);
      let contentUpload = "";
      const userCanUpdate =
        user?.role === "flapjack" ||
        (!template?.isGlobal && user?.subscriptionActive) ||
        user?.role === "owner" ||
        user?.role === "user";
      if (isUpdating && template?.content && userCanUpdate) {
        templateArchive(template);
        const { data, error } = await supabase.storage
          .from("templates")
          .update(`${template?.content}`, file);
        await supabase
          .from("templates")
          .update({
            name: removeSpecialCharacters(values?.name),
            description: removeSpecialCharacters(values?.description),
            updatedAt: new Date(),
            location,

          })
          .eq("id", template?.id);
        if (error) {
          return;
        }
        if (values?.coverImage) {
          const folderPath: string = `renderings/${router.query.id}`;
          const isEsist = await checkFileExists();
          if (isEsist) {
            const response: any = await dbClient.storage
              .from(folderPath)
              .update("coverImage", values?.coverImage, {
                upsert: true,
              });
          } else {
            await dbClient.storage
              .from(folderPath)
              .upload("coverImage", values?.coverImage);
          }
        }
      } else {
        const { data, error }: { data: any; error: any } =
          await dbClient.storage.from("templates").upload(uuidv4(), file);
        if (error) {
          return;
        } else {
          contentUpload = data?.path;
        }
      }
      if (!isUpdating) {
        const { error, data } = await supabase
          .from("templates")
          .insert({
            name: removeSpecialCharacters(values?.name),
            description: removeSpecialCharacters(values?.description),
            content: contentUpload,
            isGlobal: user?.role === "flapjack" ? false : true,
            restaurant_id: restaurantId || user?.restaurant_id,
            createdBy: user?.id,
            created_at: new Date(),
            updatedAt: new Date(),
            location,
          })
          .select();
        if (error) throw error;
        if (values?.coverImage) {
          const folderPath: string = `renderings/${data?.[0]?.id}`; // Define the folder path
          await dbClient.storage
            .from(folderPath)
            .upload("coverImage", values?.coverImage);
        }
        await router.push(`/menu/${data?.[0]?.id}`);
      }
      alert("Menu saved successfully")
    } catch (err: any) {
      throw err;
    } finally {
      setloader(false);
      close();
      onClose();
    }
  };
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: any = e.target.files && e.target.files[0];
    if (file) {
      setisFileEsist(false);

      form.setFieldValue("coverImage", file);
    } else {
      form.setFieldValue("coverImage", null);
    }
  };
  const checkFileExists = async () => {
    const response = await fetch(filUrl);
    return response?.status === 200;
  };
  useEffect(() => {
    checkFileExists().then((res) => {
      if (res) {
        setisFileEsist(true);
      } else {
        setisFileEsist(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id]);
  const handleModal = (values: any) => {
    setValues(values);
    open();
  };
  return (
    <Modal
      title={template ? "Update Template" : "Add Template"}
      opened={opened}
      withCloseButton
      onClose={onClose}
      size="xl"
      radius="md"
      centered
    >
      <form
        onSubmit={form.onSubmit(
          user?.role === 'flapjack' && template?.isGlobal ? handleModal : onSubmit
        )}
      >
        <Input
          accept="image/*"
          onChange={handleCoverImageChange}
          style={{ marginBottom: "20px", display: "none" }}
          type="file"
          ref={imageRef}
        />
        <Center>
          <Box
            style={{
              width: "100px",
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
            }}
            onClick={() => {
              if (imageRef?.current) {
                imageRef?.current.click();
              }
            }}
          >
            {form.values.coverImage || isFileEsist ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  isFileEsist
                    ? filUrl
                    : form?.values?.coverImage
                      ? URL.createObjectURL(form?.values?.coverImage)
                      : ""
                }
                alt="Selected"
                style={{
                  height: "100px",
                  width: "100px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Text align="center">
                <IconPhotoPlus size={56} />
              </Text>
            )}
          </Box>
        </Center>
        <TextInput
          withAsterisk
          label="Template Name"
          placeholder="Template name"
          {...form.getInputProps("name")}
          value={removeSpecialCharacters(form.getInputProps("name").value)}
        />
        <TextInput
          withAsterisk
          label="Template Description"
          placeholder="Template Description"
          {...form.getInputProps("description")}
          value={removeSpecialCharacters(
            form.getInputProps("description").value
          )}
        />
        {user?.role === "flapjack" && (
          <>
            <Select
              label="Select a resturant"
              placeholder="Select a resturant"
              data={restaurantsOptions}
              searchable
              value={restaurantId}
              onChange={(value: string) => {
                let locationExist = restaurantsOptions?.filter(
                  (item: any) => item?.value === value
                );
                let location = locationExist[0]?.location;
                if (location?.length) {
                  const locationMap = location.map((item: string) => {
                    return {
                      label: item,
                      value: item,
                    };
                  });
                  setlocations(locationMap);
                } else {
                  setlocations([]);
                }
                setRestaurantId(value);
              }}
              maxDropdownHeight={400}
              nothingFound="Resturant not found"
              filter={(value: string, item: any) =>
                item.label.toLowerCase().includes(value.toLowerCase().trim())
              }
            />
            {locations?.length ? (
              <Select
                label="Select a resturant location"
                placeholder="Select a resturant location"
                data={locations}
                value={location}
                onChange={(value: string) => {
                  setLocation(value);
                }}
              />
            ) : (
              <></>
            )}
          </>
        )}
        <Flex justify="flex-end" mt="lg">
          <Button variant="filled" type="submit" loading={loader}>
            {template ? "Update" : "Save"}
          </Button>
        </Flex>
      </form>
      <Modal
        centered
        size={411}
        opened={isModalOpen}
        onClose={close}
        styles={{
          header: {
            marginBottom: 0,
          },
        }}
      >
        <Text size={14} weight={300} px="sm">
          Warning: this menu is live. Saving changes to this menu will
          automatically show to the customer. Are you REALLY sure this is what
          you are trying to do?
        </Text>

        <Flex mt="xl" justify="center">
          <Button
            color="yellow.9"
            size="sm"
            onClick={() => onSubmit(values)}
            disabled={loader}
            mr="md"
          >
            {loader ? "Loading..." : "Yes, let me save"}
          </Button>
          <Button variant="outline" color="dark" size="sm" onClick={close}>
            No, take me back
          </Button>
        </Flex>
      </Modal>
    </Modal>
  );
};

export default UpsertTemplateDialog;
