import { Button, Flex, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useUser } from "../hooks";
import { ITemplate } from "../interfaces";
import { dbClient } from "../tests/helpers/database.helper";
import { v4 as uuidv4 } from "uuid";

interface IUpsertTemplateDialogProps {
  opened: boolean;
  onClose: () => void;
  template?: ITemplate | null;
  content: any;
}

const UpsertTemplateDialog = ({
  opened,
  onClose,
  template,
  content,
}: IUpsertTemplateDialogProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: template?.name || "",
      description: template?.description || "",
    },
    validate: {
      name: (value: string) => (value ? null : "Required"),
      description: (value: string) => (value ? null : "Required"),
    },
  });

  const onSubmit = async (values: { name: string; description: string }) => {
    try {
      const isUpdating = router.query.id;
      const file = new Blob([content], { type: "text/plain" });
      let contentUpload = "";
      const userCanUpdate =
        user?.role === "flapjack" ||
        (!template?.isGlobal && user?.subscriptionActive) ||
        user?.role === "owner";
      if (isUpdating && template?.content && userCanUpdate) {
        const { data, error } = await supabase.storage
          .from("templates")
          .update(`${template?.content}`, file);
        if (error) {
          return;
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
            ...values,
            content: contentUpload,
            isGlobal: user?.role === "flapjack" ? true : false,
            restaurant_id: user?.restaurant_id ? user?.restaurant_id : "",
            createdBy: user?.id,
            created_at: new Date(),
            updatedAt: new Date(),
          })
          .select();
        if (error) throw error;
        await router.push(`/menu/${data?.[0]?.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
    }
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
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          withAsterisk
          label="Template Name"
          placeholder="Template name"
          {...form.getInputProps("name")}
        />
        <TextInput
          withAsterisk
          label="Template Description"
          placeholder="Template Description"
          {...form.getInputProps("description")}
        />
        <Flex justify="flex-end" mt="lg">
          <Button variant="filled" type="submit">
            {template ? "Update" : "Save"}
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default UpsertTemplateDialog;
