import { Button, ColorInput, Flex, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { userCanEditFontAndColor } from "../../helpers/userCanEditFontAndColor";
import { useDialog, useUser } from "../../hooks";
import { IPalette } from "../../interfaces";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface IUpsertPaletteDialogProps {
  opened: boolean;
  onClose: () => void;
  fetchPalettes: () => void;
  palette?: IPalette;
}

const UpsertPaletteDialog = ({
  opened,
  onClose,
  fetchPalettes,
  palette,
}: IUpsertPaletteDialogProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [deleteDialogOpen, openDeleteDialog, deleteDialogOnClose] = useDialog(false)

  const form = useForm({
    initialValues: palette || {
      name: "",
      primaryColor: "",
      secondaryColor: "",
      tertiaryColor: "",
      textColor: "",
      menuColor: "",
      backgroundColor: "",
    },
    validate: {
      name: (value: string) => (value ? null : "Required"),
      primaryColor: (value: string) => (value ? null : "Required"),
      secondaryColor: (value: string) => (value ? null : "Required"),
      tertiaryColor: (value: string) => (value ? null : "Required"),
      textColor: (value: string) => (value ? null : "Required"),
      menuColor: (value: string) => (value ? null : "Required"),
      backgroundColor: (value: string) => (value ? null : "Required"),
    },
  });

  // Only the user with flapjack role can edit the color palette
  const onSubmit = async (values: IPalette | Omit<IPalette, 'id'>) => {
    if (!userCanEditFontAndColor(user)) return;
    try {
      const { error } = await supabase.from("palettes").upsert(
        {
          ...values,
          ...(!palette &&
            user && {
              createdBy: user?.id,
            }),
          ...(palette && {
            updatedAt: new Date(),
          }),
        },
        {
          onConflict: "id",
        }
      );
      if (error) throw error;
     fetchPalettes();
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
    }
  };

  const deletePalette = async () => {
    if (palette === undefined || palette === null || !userCanEditFontAndColor(user))
      return;
    await supabase.from('palettes').delete().eq('id', palette.id);
    deleteDialogOnClose();
    onClose();
    fetchPalettes();
  };

  // Do not render the UpsertPaletteDialog if the user does not have role `flapjack`
  if (!userCanEditFontAndColor(user)) return null;

  return (
  <>
    <Modal
      title={palette ? "Update Palette" : "Add palette"}
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
          label="Palette Name"
          placeholder="Palette name"
          {...form.getInputProps("name")}
        />
        <ColorInput
          placeholder="Pick color"
          label="Primary Color"
          withAsterisk
          {...form.getInputProps("primaryColor")}
        />
        <ColorInput
          placeholder="Pick color"
          label="Secondary Color"
          withAsterisk
          {...form.getInputProps("secondaryColor")}
        />
        <ColorInput
          placeholder="Pick color"
          label="Tertiary Color"
          withAsterisk
          {...form.getInputProps("tertiaryColor")}
        />
        <ColorInput
          placeholder="Pick color"
          label="Text Color"
          withAsterisk
          {...form.getInputProps("textColor")}
        />
         <ColorInput
          placeholder="Pick color"
          label="Menu Title Color"
          withAsterisk
          {...form.getInputProps("menuColor")}
        />
        <ColorInput
          placeholder="Pick color"
          label="Background Color"
          withAsterisk
          {...form.getInputProps("backgroundColor")}
        />
        <Flex justify="flex-end" mt="lg">
          {palette ? <Button variant="outline" color="red" style={{ marginRight: '0.5rem' }} onClick={openDeleteDialog}>Delete</Button> : null}
          <Button variant="filled" type="submit">
            {palette ? "Update" : "Save"}
          </Button>
        </Flex>
      </form>
    </Modal>
    {palette ? (
        <DeleteConfirmDialog
          opened={deleteDialogOpen}
          onClose={deleteDialogOnClose}
          confirm={deletePalette}
          contentName={palette.name}
        />
      ) : null}
    </>
  );
};

export default UpsertPaletteDialog;
