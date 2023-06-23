import { Button, Flex, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useUser } from "../hooks";
import { ITemplate } from "../interfaces";

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
      const isUpdating = router.query.id
      const userCanUpdate = user?.role === "flapjack" || (!template?.isGlobal && user?.subscriptionActive)
      if (isUpdating && userCanUpdate) {
        const { error } = await supabase
          .from("templates")
          .update({
            ...values,
            content: content,
            updatedAt: new Date(),
          })
          .eq("id", router.query.id);
        if (error) throw error;
        await router.push(`/menu/${router.query.id}`);
      } else {
        const { error, data } = await supabase
          .from("templates")
          .insert({
            ...values,
            content: content,
            createdBy: user?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .select();
        if (error) throw error;
        window.location.pathname = `/menu/${data[0].id}`;
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
