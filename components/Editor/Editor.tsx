import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import { useUser } from "../../hooks/useUser";
import { dbClient } from "../../tests/helpers/database.helper";
import { useRouter } from "next/router";
import { ITemplateDetails, IUserDetails } from "../../interfaces";
import { v4 as uuidv4 } from "uuid";
import UpsertTemplateDialog from "../UpsertTemplateDialog";
import { useDialog } from "../../hooks";
import AuthDialog from "../AuthDialog";
const Editor = ({ template }: { template: ITemplateDetails | null }) => {
  const cesdkContainer = useRef<HTMLDivElement>(null);
  const [templateModal, settemplateModal] = useState<Boolean>(false);
  const [content, setcontent] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const user = useUser();
  const [input, setinput] = useState<any>(1);
  const router = useRouter();
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);

  useEffect(() => {
    setUserData(user);
    if (user) {
      closeAuthDialog();
    }
  }, [user]);

  useEffect(() => {
    const config: object = {
      role: "Creator",
      theme: "light",
      license: process.env.REACT_APP_LICENSE,
      ui: {
        elements: {
          view: 'advanced',
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
          blocks: {
            opacity: true,
            transform: true,
            '//ly.img.ubq/image': {
              adjustments: false,
              filters: false,
              effects: false,
              blur: false,
              crop: true
            }
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
                  // Templates
                  defaultEntries[0],
                  // Text
                  defaultEntries[3],
                  // Images
                  defaultEntries[2],
                  // Shapes
                  defaultEntries[4],
                ];
              },
            },
          },
        },
      },
      callbacks: {
        onExport: async (blobs: any) => {
          let isAbleToExport = true;
          setUserData((user: any) => {
            if (isAbleToExport) {
              isAbleToExport = false;
              if (user) {
                console.log(user);
                downloadBlobFile(blobs?.[0], template?.name || "");
              } else {
                openAuthDialog();
              }
              setTimeout(() => {
                isAbleToExport = true;
              }, 1000);
            }
            return user;
          });
        },
        onUpload: async (file: any) => {
          const { data, error }: { data: any; error: any } =
            await dbClient.storage
              .from("templateImages")
              .upload(uuidv4(), file);
          if (error) {
            console.error("error uploading file");
          }
          return {
            id: uuidv4(), // A unique ID identifying the uploaded image
            name: file?.name || "upload",
            meta: {
              uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${data?.path}`,
              thumbUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${data?.path}`,
            },
          };
        },
        onSave: (scene: any) => {
          let isAbleToUpdate = true;
          setUserData((user: any) => {
            if (isAbleToUpdate) {
              isAbleToUpdate = false;
              if (user) {
                saveTemplate(scene);
              } else {
                openAuthDialog();
              }
              setTimeout(() => {
                isAbleToUpdate = true;
              }, 1000);
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

        const { data, error }: { data: any; error: any } =
          await dbClient.storage
            .from("templates") // Replace 'bucket_name' with your actual Supabase storage bucket name
            .upload(uuidv4(), file); // Replace 'file_name' with the desired file name
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
  useEffect(() => {
    const removeElement = () => {
      var elementWithShadowRoot = document.querySelector(
        "#cesdkContainer #root-shadow "
      );
      const leftPanel =
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelRight ";
      var shadowRoot = elementWithShadowRoot?.shadowRoot;
      var count = shadowRoot?.querySelector(
        `${leftPanel} div div `
      )?.childElementCount;
      if (count === 2) {
        var element = shadowRoot?.querySelector(
          `${leftPanel} div div section `
        );

        element?.parentNode?.removeChild(element);
      }
      var parent = shadowRoot?.querySelector(
        `${leftPanel} div div section div`
      );
      const child = parent?.children;

      if (child?.length === 11) {
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
        parent?.removeChild(child[4]);
      }
      var pages = shadowRoot?.querySelector(`${leftPanel} div section`);
      var pagesChildren = pages?.children;
      if (pagesChildren?.length === 5) {
        pages?.removeChild(pagesChildren[4]);
      }
      var pageElements = shadowRoot?.querySelector(
        `${leftPanel} div .UBQ_Inspector__block--CW9ga section  div`
      );
      var pageElementsChild = shadowRoot?.querySelector(
        `${leftPanel} div .UBQ_Inspector__block--CW9ga section  div`
      )?.children;
      if (pageElementsChild?.length === 7) {
        pageElements?.removeChild(pageElementsChild[0]);
        pageElements?.removeChild(pageElementsChild[0]);
        pageElements?.removeChild(pageElementsChild[0]);
        pageElements?.removeChild(pageElementsChild[0]);
        pageElements?.removeChild(pageElementsChild[1]);
        pageElements?.removeChild(pageElementsChild[1]);
      }
      var placeholderRemove = shadowRoot?.querySelector(
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY .UBQ_Editor__canvasContainer--NgGRw .UBQ_Canvas__block--h2FAP div:last-child div div div div"
      );
      var placeholderRemoveChild = shadowRoot?.querySelector(
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY .UBQ_Editor__canvasContainer--NgGRw .UBQ_Canvas__block--h2FAP div:last-child div div div div"
      )?.children;
      if (placeholderRemoveChild?.length === 4) {
        placeholderRemove?.removeChild(placeholderRemoveChild[2]);
      }
    };
    const removeDelayedItems = () => {
      var elementWithShadowRoot = document.querySelector(
        "#cesdkContainer #root-shadow "
      );
      const leftPanel =
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelRight ";
      var shadowRoot = elementWithShadowRoot?.shadowRoot;
      var removeImagesSection = shadowRoot?.querySelector(
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelLeft div div .UBQ_AssetLibraryContent__block--mQiYI div div"
      );
      var removeImagesSectionChild = shadowRoot?.querySelector(
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelLeft div div .UBQ_AssetLibraryContent__block--mQiYI div div"
      )?.children;
      if (removeImagesSectionChild?.length === 2) {
        removeImagesSection?.removeChild(removeImagesSectionChild[1]);
      }
    };
    setTimeout(() => {
      removeDelayedItems();
    }, 150);
    setTimeout(() => {
      removeElement();
    }, 20);
  }, [input]);

  return (
    <div onClick={() => setinput(input + 1)}>
      <AuthDialog opened={authDialog} onClose={closeAuthDialog} />

      {templateModal && (
        <UpsertTemplateDialog
          opened={true}
          template={template}
          onClose={() => settemplateModal(false)}
          content={content}
        />
      )}
      <div style={cesdkWrapperStyle}>
        <div ref={cesdkContainer} id="cesdkContainer" style={cesdkStyle}></div>
      </div>
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
