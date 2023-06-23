import {
  ActionIcon,
  Button,
  FileButton,
  Flex,
  Group,
  Modal,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconTrash } from "@tabler/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDialog, useUser } from '../../hooks'
import { userCanEditFontAndColor } from "../../helpers/userCanEditFontAndColor";
import { IFont } from "../../interfaces";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface IUpsertFontDialogProps {
  opened: boolean;
  onClose: () => void;
  fetchFonts: () => void;
  font?: IFont;
}

interface UpsertFontFormProps {
  id: number | undefined;
  name: string;
  menuFont: string | File;
  titleFont: string | File;
  headerFont: string | File;
  bodyFont: string | File;
  menuFontSize: number;
  headerFontSize: number;
  titleFontSize: number;
  bodyFontSize: number;
}

const UpsertFontDialog = ({
  opened,
  onClose,
  fetchFonts,
  font,
}: IUpsertFontDialogProps) => {
  const [fonts, setFonts] = useState<{ value: any; label: string }[]>([]);
  const [deleteDialogOpen, openDeleteDialog, deleteDialogOnClose] = useDialog(false)

  useEffect(() => {
    fetchGoogleFonts();
  }, []);

  const fetchGoogleFonts = async () => {
    try {
      const res = await axios.get(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY}`
      );
      setFonts(
        res.data.items.map(
          (font: {
            family: string;
            files: {
              regular: string;
            };
          }) => ({
            label: font.family,
            value: font.files.regular
              ? font.files.regular.replace("http:", "")
              : font.files[Object.keys(font.files)[0] as "regular"].replace(
                  "http:",
                  ""
                ),
          })
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const supabase = useSupabaseClient();
  const user = useUser();

  const form = useForm<UpsertFontFormProps>({
    initialValues: {
      id: font?.id || undefined,
      name: font?.name || "",
      titleFont: font?.titleFont.url || "",
      headerFont: font?.headerFont.url || "",
      bodyFont: font?.bodyFont.url || "",
      menuFont: font?.menuFont?.url || "",
      menuFontSize: font?.menuFontSize || 16,
      headerFontSize: font?.headerFontSize || 28,
      titleFontSize: font?.titleFontSize || 20,
      bodyFontSize: font?.bodyFontSize || 16,
    },
    validate: {
      name: (value: string) => (value ? null : "Required"),
      titleFont: (value: string) => (value ? null : "Required"),
      menuFont: (value: string) => (value ? null : "Required"),
      headerFont: (value: string) => (value ? null : "Required"),
      bodyFont: (value: string) => (value ? null : "Required"),
    },
  });

  const onSubmit = async (values: UpsertFontFormProps | Omit<UpsertFontFormProps, 'id'>) => {
    if (!userCanEditFontAndColor(user)) return;
    try {
      let titleFont:
        | {
            name: string;
            url: string;
            custom?: boolean;
          }
        | undefined;
      let menuFont:
        | {
            name: string;
            url: string;
            custom?: boolean;
          }
        | undefined;
      let headerFont:
        | {
            name: string;
            url: string;
            custom?: boolean;
          }
        | undefined;
      let bodyFont:
        | {
            name: string;
            url: string;
            custom?: boolean;
          }
        | undefined;
      if (typeof values.titleFont === "string") {
        const font = fonts.find((font) => font.value === values.titleFont);
        if (font)
          titleFont = {
            name: font.label,
            url: font.value,
          };
      } else {
        const fileName = `${user?.id}-${new Date()
          .getTime()
          .toString()}-${values.titleFont.name.replace(/\.[^/.]+$/, "")}`;
        const { data, error } = await supabase.storage
          .from("fonts")
          .upload(fileName, values.titleFont);
        if (error) throw error;
        titleFont = {
          name: values.titleFont.name,
          url: data.path,
          custom: true,
        };
      }
      if (typeof values.menuFont === "string") {
        const font = fonts.find((font) => font.value === values.menuFont);
        if (font)
          menuFont = {
            name: font.label,
            url: font.value,
          };
      } else {
        const fileName = `${user?.id}-${new Date()
          .getTime()
          .toString()}-${values.menuFont.name.replace(/\.[^/.]+$/, "")}`;
        const { data, error } = await supabase.storage
          .from("fonts")
          .upload(fileName, values.menuFont);
        if (error) throw error;
        menuFont = {
          name: values.menuFont.name,
          url: data.path,
          custom: true,
        };
      }
      if (typeof values.headerFont === "string") {
        const font = fonts.find((font) => font.value === values.headerFont);
        if (font)
          headerFont = {
            name: font.label,
            url: font.value,
          };
      } else {
        const fileName = `${user?.id}-${new Date()
          .getTime()
          .toString()}-${values.headerFont.name.replace(/\.[^/.]+$/, "")}`;
        const { data, error } = await supabase.storage
          .from("fonts")
          .upload(fileName, values.headerFont);
        if (error) throw error;
        headerFont = {
          name: values.headerFont.name,
          url: data.path,
          custom: true,
        };
      }
      if (typeof values.bodyFont === "string") {
        const font = fonts.find((font) => font.value === values.bodyFont);
        if (font)
          bodyFont = {
            name: font.label,
            url: font.value,
          };
      } else {
        const fileName = `${user?.id}-${new Date()
          .getTime()
          .toString()}-${values.bodyFont.name.replace(/\.[^/.]+$/, "")}`;
        const { data, error } = await supabase.storage
          .from("fonts")
          .upload(fileName, values.bodyFont);
        if (error) throw error;
        bodyFont = {
          name: values.bodyFont.name,
          url: data.path,
          custom: true,
        };
      }

      const { error } = await supabase.from("fonts").upsert(
        {
          ...values,
          menuFont: menuFont,
          titleFont: titleFont,
          headerFont: headerFont,
          bodyFont: bodyFont,
          ...(!font &&
            user && {
              createdBy: user?.id,
            }),
          ...(font && {
            updatedAt: new Date(),
          }),
        },
        {
          onConflict: "id",
        }
      );
      if (error) throw error;
      fetchFonts();
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
    }
  };

  const deleteFontFromStorage = async (
    fontType: "titleFont" | "headerFont" | "bodyFont" | "menuFont",
    fileName: string
  ) => {
    try {
      const { error } = await supabase.storage.from("fonts").remove([fileName]);
      if (error) throw error;
      if (font) {
        font[fontType].custom = false;
        form.setFieldValue(fontType, "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFont = async () => {
    if (font === undefined || font === null || !userCanEditFontAndColor(user)) return;
    await supabase.from("fonts").delete().eq("id", font.id);
    deleteDialogOnClose();
    onClose();
    fetchFonts();
  };

  // Do not render the UpsertFontDialog if the user does not have role `flapjack`
  if (!userCanEditFontAndColor(user)) return null;

  return (
  <>
    <Modal
      title={font ? "Update Font" : "Add font"}
      opened={opened}
      withCloseButton
      onClose={onClose}
      size="xl"
      radius="md"
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          withAsterisk
          label="Font Collection Name"
          placeholder="Font Collection Name"
          {...form.getInputProps("name")}
        />
        <Group my="md" align="flex-end">
          <>
            <TextInput
              label="Menu Title Font Size"
              type="number"
              {...form.getInputProps("menuFontSize")}
            />
            <Button type="submit" className="addFont">
              Apply Size
            </Button>
          </>
          {font?.menuFont?.custom ? (
            <>
              <Text>{font?.menuFont.name}</Text>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() =>
                  deleteFontFromStorage("menuFont", font?.menuFont.url)
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              {typeof form.values.menuFont === "string" ? (
                <>
                  <Select
                    withAsterisk
                    searchable
                    label="Menu Font"
                    placeholder="Pick one"
                    data={fonts}
                    {...form.getInputProps("menuFont")}
                  />
                  <FileButton {...form.getInputProps("menuFont")}>
                    {(props) => <Button {...props}>Upload font</Button>}
                  </FileButton>
                </>
              ) : (
                <>
                  <Text>{form.values.menuFont.name}</Text>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => form.setFieldValue("menuFont", "")}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}
            </>
          )}
        </Group>

        <Group my="md" align="flex-end">
          <>
            <TextInput
              label="Section Header Font Size"
              type="number"
              {...form.getInputProps("headerFontSize")}
            />
            <Button type="submit" className="addFont">
              Apply Size
            </Button>
          </>
          {font?.headerFont.custom ? (
            <>
              <Text>{font?.headerFont.name}</Text>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() =>
                  deleteFontFromStorage("headerFont", font?.headerFont.url)
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              {typeof form.values.headerFont === "string" ? (
                <>
                  <Select
                    withAsterisk
                    searchable
                    label="Header Font"
                    placeholder="Pick one"
                    data={fonts}
                    {...form.getInputProps("headerFont")}
                  />
                  <FileButton {...form.getInputProps("headerFont")}>
                    {(props) => <Button {...props}>Upload font</Button>}
                  </FileButton>
                </>
              ) : (
                <>
                  <Text>{form.values.headerFont.name}</Text>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => form.setFieldValue("headerFont", "")}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}
            </>
          )}
        </Group>
        <Group my="md" align="flex-end">
          <>
            <TextInput
              label="Dish Title Font Size"
              type="number"
              {...form.getInputProps("titleFontSize")}
            />
            <Button type="submit" className="addFont">
              Apply Size
            </Button>
          </>
          {font?.titleFont.custom ? (
            <>
              <Text>{font?.titleFont.name}</Text>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() =>
                  deleteFontFromStorage("titleFont", font?.titleFont.url)
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              {typeof form.values.titleFont === "string" ? (
                <>
                  <Select
                    withAsterisk
                    searchable
                    label="Title Font"
                    placeholder="Pick one"
                    data={fonts}
                    {...form.getInputProps("titleFont")}
                  />
                  <FileButton {...form.getInputProps("titleFont")}>
                    {(props) => <Button {...props}>Upload font</Button>}
                  </FileButton>
                </>
              ) : (
                <>
                  <Text>{form.values.titleFont.name}</Text>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => form.setFieldValue("titleFont", "")}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}
            </>
          )}
        </Group>
        <Group my="md" align="flex-end">
          <>
            <TextInput
              label="Dish Body Font Size"
              type="number"
              {...form.getInputProps("bodyFontSize")}
            />
            <Button type="submit" className="addFont">
              Apply Size
            </Button>
          </>
          {font?.bodyFont.custom ? (
            <>
              <Text>{font?.bodyFont.name}</Text>
              <ActionIcon
                variant="light"
                color="red"
                onClick={() =>
                  deleteFontFromStorage("bodyFont", font?.bodyFont.url)
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              {typeof form.values.bodyFont === "string" ? (
                <>
                  <Select
                    withAsterisk
                    searchable
                    label="Body Font"
                    placeholder="Pick one"
                    data={fonts}
                    {...form.getInputProps("bodyFont")}
                  />
                  <FileButton {...form.getInputProps("bodyFont")}>
                    {(props) => <Button {...props}>Upload font</Button>}
                  </FileButton>
                </>
              ) : (
                <>
                  <Text>{form.values.bodyFont.name}</Text>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => form.setFieldValue("bodyFont", "")}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}
            </>
          )}
        </Group>
        <Flex justify="flex-end" mt="lg">
          {font ? (
              <Button
                variant="outline"
                color="red"
                style={{ marginRight: "0.5rem" }}
                onClick={openDeleteDialog}
              >
                Delete
              </Button>
            ) : null}
          <Button variant="filled" type="submit" className="addFont">
            {font ? "Update" : "Save"}
          </Button>
        </Flex>
      </form>
    </Modal>
    {font ? (
        <DeleteConfirmDialog
          opened={deleteDialogOpen}
          onClose={deleteDialogOnClose}
          confirm={deleteFont}
          contentName={font.name}
        />
    ) : null}
    </>
  );
};

export default UpsertFontDialog;
