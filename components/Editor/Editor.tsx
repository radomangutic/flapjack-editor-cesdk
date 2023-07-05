import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import { useUser } from "../../hooks/useUser";
import { dbClient } from "../../tests/helpers/database.helper";
import { useRouter } from "next/router";
import { ITemplateDetails, IUserDetails } from "../../interfaces";
import { v4 as uuidv4 } from "uuid";
import UpsertTemplateDialog from "../UpsertTemplateDialog";
const Editor = ({
  openAuthDialog,
  template,
}: {
  openAuthDialog: () => void;
  template: ITemplateDetails | null;
}) => {
  const cesdkContainer = useRef<HTMLDivElement>(null);
  const [templateModal, settemplateModal] = useState<Boolean>(false);
  const [content, setcontent] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const user = useUser();
  const router = useRouter();
  const fontLinkReqular = `${window.location.protocol}//${window.location.host}/Helvetica-Font/Helvetica.ttf`;
  const fontLinkBold = `${window.location.protocol}//${window.location.host}/Helvetica-Font/Helvetica-Bold.ttf`;
  useEffect(() => {
    setUserData(user);
  }, [user]);

  useEffect(() => {
    const config: object = {
      role: "Creator",
      theme: "light",
      license: process.env.REACT_APP_LICENSE,
      ui: {
        elements: {
          dock: {
            groups: [
              {
                id: "ly.img.template",
                entryIds: ["ly.img.template"],
              },
              { id: "ly.img.defaultGroup" },
            ],
          },
          panels: {
            settings: true,
          },
          navigation: {
            action: {
              export: {
                show: true,
                format: ["image/png", "application/pdf"],
                onclick: () => alert("Download"),
              },
              save: true,
            },
          },
          libraries: {
            insert: {
              entries: (defaultEntries: any) => {
                return [
                  defaultEntries[0],
                  defaultEntries[3],
                  defaultEntries[2],
                  defaultEntries[4],
                ];
              },
            },
          },
        },
      },
      callbacks: {
        onExport: async (blobs: any) => {
          if (user && user.subscriptionActive) {
            downloadBlobFile(blobs?.[0], `flapjack.png`);
          } else {
            openAuthDialog();
          }
          return Promise.resolve();
        },
        onUpload: "local",
        onSave: (scene: any) => {
          setUserData((user: any) => {
            if (user) {
              saveTemplate(scene);
            } else {
              openAuthDialog();
            }
            return user;
          });
        },
      },
      presets: {
        pageFormats: {
          Letter: {
            width: 8.5,
            height: 11,
            unit: "in",
            meta: {
              default: true,
            },
          },
          Legal: {
            width: 8.5,
            height: 14,
            unit: "in",
          },
        },
        typefaces: {
          helvetica: {
            family: "Helvetica",
            fonts: [
              {
                fontURL: fontLinkReqular,
                weight: "regular",
                style: "normal",
              },
              {
                fontURL: fontLinkBold,
                weight: "bold",
                style: "normal",
              },
            ],
          },
        },
      },
    };
    if (cesdkContainer.current) {
      CreativeEditorSDK.init(cesdkContainer.current, config).then(
        async (instance: any) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources();
          if (template?.content) {
            await instance.engine.scene.loadFromURL(
              process.env.NEXT_PUBLIC_SUPABASE_URL +
                `/storage/v1/object/public/templates/${template?.content}`
            );
          }
        }
      );
    }
  }, []);
  function downloadBlobFile(blob: any, fileName: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
  const saveTemplate = async (string: string) => {
    const file = new Blob([string], { type: "text/plain" });
    try {
      if (router.query.id && template?.content) {
        const {
          data: fileRemove,
          error: fileremoveError,
        }: { data: any; error: any } = await dbClient.storage
          .from("templates") // Replace 'bucket_name' with your actual Supabase storage bucket name
          .remove([template?.content]); // Replace 'file_name' with the name of the file you want to delete
        console.log("fileremoveError", fileremoveError);
        console.log("fileRemove", fileRemove);

        const { data, error }: { data: any; error: any } =
          await dbClient.storage
            .from("templates") // Replace 'bucket_name' with your actual Supabase storage bucket name
            .update(template?.content, file); // Replace 'file_name' with the desired file name
        if (error) {
          console.error("Error updating file:", error.message);
        } else {
          setcontent(data?.path);
          settemplateModal(true);
        }
      } else {
        const { data, error }: { data: any; error: any } =
          await dbClient.storage
            .from("templates") // Replace 'bucket_name' with your actual Supabase storage bucket name
            .upload(uuidv4(), file); // Replace 'file_name' with the desired file name
        if (error) {
          console.error("Error uploading file:", error.message);
        } else {
          setcontent(data?.path);
          settemplateModal(true);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  console.log('user1216', user)
  return (
    <>
      {templateModal && (
        <UpsertTemplateDialog
          opened={true}
          template={template}
          onClose={() => settemplateModal(false)}
          content={content}
        />
      )}
      <div style={cesdkWrapperStyle}>
        <div ref={cesdkContainer} style={cesdkStyle}></div>
      </div>
    </>
  );
};

export default Editor;

const cesdkStyle: object = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const cesdkWrapperStyle: object = {
  position: "relative",
  overflow: "hidden",
  flexGrow: 1,
  display: "flex",
  borderRadius: "0.75rem",
  boxShadow:
    "0px 0px 2px rgba(22, 22, 23, 0.25), 0px 4px 6px -2px rgba(22, 22, 23, 0.12), 0px 2px 2.5px -2px rgba(22, 22, 23, 0.12), 0px 1px 1.75px -2px rgba(22, 22, 23, 0.12)",
  minHeight: "calc(100vh - 70px)",
};
