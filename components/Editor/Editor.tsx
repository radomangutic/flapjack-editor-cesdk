import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import { useUser, userProfile } from "../../hooks/useUser";
import { dbClient } from "../../tests/helpers/database.helper";

const Editor = ({ openAuthDialog }: { openAuthDialog: () => void }) => {
  const cesdkContainer = useRef<HTMLDivElement>(null);
  const user = useUser();
  const [userProfileData, setuserProfileData] = useState<any>(null);

  console.log("userProfileData", userProfileData);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: userData, error: userError } = await dbClient
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      setuserProfileData(userData);
    };
    fetchUserProfile();
  }, [user?.id]);

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
          // if (user && user.subscriptionActive) {
          saveTemplate(scene);
          // } else {
          //   openAuthDialog();
          // }
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
      },
    };

    if (cesdkContainer.current) {
      CreativeEditorSDK.init(cesdkContainer.current, config).then(
        async (instance: any) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources();
          // await instance.engine.scene.loadFromURL(
          //   "https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/templates/file2"
          // );
        }
      );
    }
  });
  function downloadBlobFile(blob: any, fileName: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
  const saveTemplate = async (string: string) => {
    console.log("s");

    const file = new Blob([string], { type: "text/plain" });

    try {
      const { data, error }: { data: any; error: any } = await dbClient.storage
        .from("templates") // Replace 'bucket_name' with your actual Supabase storage bucket name
        .upload(`file3`, file); // Replace 'file_name' with the desired file name

      if (error) {
        console.error("Error uploading file:", error.message);
      } else {
        console.log("File uploaded successfully:", data);
        const templateData = {
          createdBy: user?.id,
          name: user?.email,
          description: user?.email,
          content: data?.path,
          tags: user?.email,
          isGlobal: userProfileData?.role === "flapjack" ? true : false,
          menuSize: "",
          templateOrder: 2,
          restaurant_id: userProfileData?.restaurant_id,
        };
        await dbClient.from("templates").insert(templateData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <div style={cesdkWrapperStyle}>
      <div ref={cesdkContainer} style={cesdkStyle}></div>
    </div>
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
