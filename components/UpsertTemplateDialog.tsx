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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useUser } from "../hooks";
import { ITemplate } from "../interfaces";
import { dbClient } from "../tests/helpers/database.helper";
import { v4 as uuidv4 } from "uuid";
import { IconPhotoPlus } from "@tabler/icons";
import { useEffect, useRef, useState } from "react";

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
  const [isFileEsist, setisFileEsist] = useState(false);
  const user = useUser();
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [loader, setloader] = useState(false);
  const filUrl = `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public/renderings/${
    router.query.id
  }/coverImage?${Date.now()}`;

  const form = useForm({
    initialValues: {
      name: template?.name || "",
      description: template?.description || "",
      coverImage: null,
    },
    validate: {
      name: (value: string) => (value ? null : "Required"),
      description: (value: string) => (value ? null : "Required"),
    },
  });

  const onSubmit = async (values: {
    name: string;
    description: string;
    coverImage: File | null;
  }) => {
    try {
      setloader(true);
      const isUpdating = router.query.id;
      const file = new Blob([content], { type: "text/plain" });

      let contentUpload = "";
      if (isUpdating && template?.content) {
        await dbClient.storage.from("templates").remove([template?.content]);
        const { data, error }: { data: any; error: any } =
          await dbClient.storage.from("templates").upload(uuidv4(), file);
        if (error) {
          return;
        } else {
          contentUpload = data?.path;
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
      const userCanUpdate =
        user?.role === "flapjack" ||
        (!template?.isGlobal && user?.subscriptionActive);
      if (isUpdating && userCanUpdate) {
        const { error } = await supabase
          .from("templates")
          .update({
            name: values?.name,
            description: values?.description,
            content: contentUpload,
            updatedAt: new Date(),
          })
          .eq("id", router.query.id);
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
        if (error) throw error;
      } else {
        const { error, data } = await supabase
          .from("templates")
          .insert({
            name: values?.name,
            description: values?.description,
            content: contentUpload,
            isGlobal: user?.role === "flapjack" ? true : false,
            restaurant_id: user?.restaurant_id ? user?.restaurant_id : "",
            createdBy: user?.id,
            created_at: new Date(),
            updatedAt: new Date(),
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
    } catch (err) {
      console.error(err);
    } finally {
      setloader(false);

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
    console.log('response',response);
    
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
        />
        <TextInput
          withAsterisk
          label="Template Description"
          placeholder="Template Description"
          {...form.getInputProps("description")}
        />
        <Flex justify="flex-end" mt="lg">
          <Button variant="filled" type="submit" loading={loader}>
            {template ? "Update" : "Save"}
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default UpsertTemplateDialog;
