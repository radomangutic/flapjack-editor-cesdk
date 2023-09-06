import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import {
  fetchAssets,
  fetchFonts,
  getUser,
  uploadCustomFont,
  useUser,
} from "../../hooks/useUser";
import { dbClient } from "../../tests/helpers/database.helper";
import { useRouter } from "next/router";
import { ITemplateDetails, IUserDetails } from "../../interfaces";
import { v4 as uuidv4 } from "uuid";
import UpsertTemplateDialog from "../UpsertTemplateDialog";
import { useDialog } from "../../hooks";
import AuthDialog from "../AuthDialog";
import {
  Box,
  Button,
  FileInput,
  Group,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUpload } from "@tabler/icons";
interface fontsErrorsType {
  title?: string;
  file?: string;
  submit?: string;
}
const Editor = ({
  template,
  preview,
}: {
  template: ITemplateDetails | null;
  preview?: boolean;
}) => {
  const cesdkContainer = useRef<any>(null);
  const [templateModal, settemplateModal] = useState<boolean>(false);
  const [content, setcontent] = useState<string>("");
  const [userData, setUserData] = useState<any>(getUser());
  const user = useUser();
  const [input, setinput] = useState<any>(1);
  const router = useRouter();
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setloading] = useState(false);
  const [font, setFont] = useState();
  const [titleFontSize, setTitleFontSize] = useState<any>("");
  const [fonts, setFonts] = useState<any>([]);
  const [fontsError, setFontsError] = useState<fontsErrorsType | undefined>();

  useEffect(() => {
    setUserData(user);
    if (user) {
      closeAuthDialog();
    }
  }, [user]);

  const setup = async () => {
    const templateFonts = await fetchFonts();
    setFonts(templateFonts);
    const config: object = {
      role: "Creator",
      theme: "light",
      license: process.env.REACT_APP_LICENSE,
      ui: {
        elements: {
          view: "default",
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
            settings: false,
          },
          blocks: {
            opacity: true,
            transform: true,
            "//ly.img.ubq/image": {
              adjustments: false,
              filters: false,
              effects: false,
              blur: false,
              crop: true,
            },
            "//ly.img.ubq/page": {
              manage: true,
              format: true,
              adjustments: false,
              filters: false,
              effects: false,
              blur: false,
            },
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
                if (preview) {
                  // if preview don't show sidebar
                  return [];
                }
                return [
                  // Text
                  defaultEntries[3],
                  // Images
                  {
                    ...defaultEntries[2],
                    sourceIds: ["ly.img.image.upload"],
                  },
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
          let isAbleToExport = true;
          const data: any = await new Promise((resolve, reject) => {
            setUserData(async (user: any) => {
              if (isAbleToExport) {
                isAbleToExport = false;
                if (user) {
                  const content = uuidv4();
                  const { data, error }: { data: any; error: any } =
                    await dbClient.storage
                      .from("templateImages")
                      .upload(content, file);
                  if (error) {
                    console.error("error uploading file");
                  }
                  const userData = localStorage.getItem("userData");
                  const user = userData && JSON.parse(userData);
                  await dbClient.from("assets").insert({
                    content,
                    createdBy: user?.id,
                    restaurant_id: user?.restaurant_id,
                    template_id: template?.id,
                  });
                  setTimeout(() => {
                    isAbleToExport = true;
                  }, 1000);
                  resolve(data);
                } else {
                  reject("Please login to continue");
                }
              }
              return user;
            });
          });
          return (
            data && {
              id: uuidv4(), // A unique ID identifying the uploaded image
              name: file?.name || "upload",
              meta: {
                uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${data?.path}`,
                thumbUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${data?.path}`,
              },
            }
          );
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
          Tabloid: {
            width: 11,
            height: 17,
            unit: "in",
          },
          "Half Letter": {
            width: 5.5,
            height: 8.5,
            unit: "in",
          },
          "Quarter Letter": {
            width: 4.25,
            height: 5.5,
            unit: "in",
          },
        },
        typefaces: getFonts(templateFonts),
      },
    };
    if (cesdkContainer.current) {
      fetchAssets().then((assetsData) => {
        CreativeEditorSDK.init(cesdkContainer.current, config).then(
          async (instance: any) => {
            instance.addDefaultAssetSources();
            instance.addDemoAssetSources();
            instance.engine.asset.addAssetToSource("ly.img.text", {
              id: "ocean-waves-1",
              label: {
                en: "relaxing ocean waves",
                es: "olas del mar relajantes",
                
              },
              tags: {
                en: ["ocean", "waves", "soothing", "slow"],
                es: ["mar", "olas", "calmante", "lento"],
              },
              meta: {
                fontScale: 5,
                fontWeight: [700, 800, 900, 600, 500],
                blockType: "//ly.img.ubq/text",
              },
            });

            setinput(input + 1);
            if (template?.content) {
              await instance.engine.scene.loadFromURL(
                process.env.NEXT_PUBLIC_SUPABASE_URL +
                  `/storage/v1/object/public/templates/${
                    template?.content
                  }?t=${new Date().toISOString()}`
              );
            }
            const getAssetSources = async () => {
              if (assetsData.length) {
                const assets = assetsData.map(translateToAssetResult);
                assets.forEach((asset) => {
                  instance.engine.asset.addAssetToSource(
                    "ly.img.image.upload",
                    asset
                  );
                });
              }
            };
            enablePreviewMode();
            getAssetSources();
          }
        );
      });
    }
  };
  useEffect(() => {
    setup();
  }, []);
  const enablePreviewMode = () => {
    var elementWithShadowRoot = document.querySelector(
      "#cesdkContainer #root-shadow "
    );
    var shadowRoot = elementWithShadowRoot?.shadowRoot;
    var previewElement = shadowRoot?.querySelector(
      `div .UBQ_Theme__block--nxqW8 div div div .UBQ_Topbar__controlsContainerRight--0PI5c`
    );
    let previewChildLength = previewElement?.children;
    if (previewChildLength?.length === 3 && template?.id) {
      let elementToRemove = previewChildLength[1] as HTMLElement;
      if (!preview) {
        if (!elementToRemove.hasAttribute("data-click-listener")) {
          elementToRemove.setAttribute("data-click-listener", "true");
          elementToRemove.addEventListener("click", () => {
            router.push(`/menu/preview/${template?.id}`);
          });
        }
      }
    }
  };
  function downloadBlobFile(blob: any, fileName: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
  const saveTemplate = (string: string) => {
    setTimeout(() => {
      settemplateModal(true);
      setcontent(string);
    }, 100);
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
      var previewParent = shadowRoot?.querySelector(
        `div .UBQ_Theme__block--nxqW8 div div div .UBQ_Topbar__controlsContainerRight--0PI5c`
      );
      let previewChildLength = previewParent?.children;
      if (previewChildLength?.length === 3 && preview) {
        let elementToRemove = previewChildLength[1] as HTMLElement;
        elementToRemove.click();
        previewParent?.removeChild(elementToRemove);
      }
      var pagesChildren = pages?.children;
      if (pagesChildren?.length === 5) {
        var placeholder = shadowRoot?.querySelector(
          `${leftPanel} div section :nth-child(5)`
        );
        if (placeholder instanceof HTMLElement) {
          placeholder.style.display = "none";
        }
      }
      var parentElement = shadowRoot?.querySelector(
        `div .UBQ_Theme__block--nxqW8 div div div .UBQ_Topbar__controlsContainerLeft--kAbkj`
      );

      if (parentElement && preview) {
        while (parentElement.firstChild) {
          parentElement.removeChild(parentElement.firstChild);
        }
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
      var placeholderRemoveChild = shadowRoot?.querySelector(
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY .UBQ_Editor__canvasContainer--NgGRw .UBQ_Canvas__block--h2FAP div:last-child div div div div"
      )?.children;
      if (placeholderRemoveChild) {
        for (var i = 0; i < placeholderRemoveChild.length; i++) {
          var placeholderChild = placeholderRemoveChild[i];
          if (placeholderChild?.textContent?.includes("Placeholder")) {
            placeholderChild.remove();
          }
        }
      }
    };
    const removeDelayedItems = () => {
      var elementWithShadowRoot = document.querySelector(
        "#cesdkContainer #root-shadow "
      );
      const leftPanel =
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelRight ";
      var shadowRoot = elementWithShadowRoot?.shadowRoot;
      var addElement = shadowRoot?.querySelector(
        "div #ubq-portal-container_default div div div ul"
      );
      var addElementChild = shadowRoot?.querySelector(
        "div #ubq-portal-container_default div div div ul"
      )?.children;
      if (addElementChild?.length === 51 + fonts.length && addElement) {
        const newLi = document.createElement("li");
        newLi.textContent = "Upload custom font";
        newLi.style.cursor = "pointer";
        newLi.style.padding = "5px 8px ";
        newLi.style.fontWeight = "500";
        newLi.style.fontSize = "14px";
        newLi.style.fontFamily = "'Roboto', sans-serif";
        newLi.addEventListener("click", () => {
          open();
          setFontsError({});
        });
        addElement.appendChild(newLi);
      }
    };

    setTimeout(() => {
      removeDelayedItems();
    }, 150);
    setTimeout(() => {
      removeElement();
    }, 20);
  }, [input]);
  function translateToAssetResult(image: any) {
    return {
      id: image.id.toString(),
      meta: {
        uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
        thumbUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
      },
    };
  }
  function getFonts(fontsData: any) {
    let fonts: any = {};
    fontsData.map((item: any) => {
      if (item?.name) {
        const user = getUser();
        let key =
          user?.role === "flapjack"
            ? `${item?.name}  ( ${item?.id} )`
            : item?.name;
        fonts[key as keyof typeof fonts] = {
          family: key,
          fonts: [
            {
              fontURL: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fonts/${item?.content}`,
              weight: "regular",
              style: "normal",
            },
          ],
        };
      }
    });
    return fonts;
  }
  const handleUploadFont = async () => {
    try {
      if (user) {
        if (!titleFontSize) {
          setFontsError({ title: "Font title required" });
          return;
        }
        if (!font) {
          setFontsError({ file: "Font file required" });
          return;
        }
        const alreadyUploaded = [...fonts, ...defaultFonts].filter(
          (item: any) => item?.name === titleFontSize
        );
        if (alreadyUploaded.length) {
          setFontsError({ submit: "Font already exist" });
          return;
        }
        setFontsError({});

        setloading(true);
        await uploadCustomFont(font, template?.id, titleFontSize);
      } else {
        openAuthDialog();
      }
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <div onClick={() => setinput(input + 1)}>
      <AuthDialog opened={authDialog} onClose={closeAuthDialog} />

      <div
        style={{
          ...cesdkWrapperStyle,
          minHeight: preview ? "100vh" : "calc(100vh - 70px)",
        }}
      >
        <div ref={cesdkContainer} id="cesdkContainer" style={cesdkStyle}></div>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        title="Upload Custom Fonts"
        centered
      >
        <TextInput
          label="Your custom font name"
          placeholder="Your custom font name"
          onChange={(e) => setTitleFontSize(e.target.value)}
          error={fontsError?.title}
        />
        <FileInput
          label="Your custom font"
          placeholder="Your custom font"
          icon={<IconUpload size={14} />}
          onChange={(file: any) => setFont(file)}
          error={fontsError?.file}
        />
        <Text color="red" fz={"xs"} my={"xs"}>
          {fontsError?.submit}
        </Text>
        <Group position="right" mt={"md"}>
          <Button onClick={close}>Cancle</Button>
          <Button onClick={handleUploadFont} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Group>
      </Modal>

      <UpsertTemplateDialog
        opened={templateModal}
        template={template}
        onClose={() => settemplateModal(false)}
        content={content}
      />
      {preview && (
        <Text
          style={{ position: "absolute", right: 30, bottom: 30, zIndex: 1000 }}
        >
          Made with ❤️ by{" "}
          <Box
            style={{
              borderBottom: "1px solid black",
              display: "inline",
              cursor: "pointer",
            }}
            onClick={() => router.push("http://flapjack.co/")}
          >
            Flapjack
          </Box>
        </Text>
      )}
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
};

const defaultFonts = [
  {
    name: "Abril Fatface",
  },
  {
    name: "Aleo",
  },
  {
    name: "AmaticSC",
  },
  {
    name: "Archivo",
  },
  {
    name: "Bangers",
  },
  {
    name: "Barlow Condensed",
  },
  {
    name: "Bungee Inline",
  },
  {
    name: "Carter",
  },
  {
    name: "Caveat",
  },
  {
    name: "Coiny",
  },
  {
    name: "Courier Prime",
  },
  {
    name: "Elsie Swash Caps",
  },
  {
    name: "Fira Sans",
  },
  {
    name: "Krona",
  },
  {
    name: "Kumar",
  },
  {
    name: "Lobster Two",
  },
  {
    name: "Manrope",
  },
  {
    name: "Marker",
  },
  {
    name: "Monoton",
  },
  {
    name: "Montserrat",
  },
  {
    name: "Nixie",
  },
  {
    name: "Notable",
  },
  {
    name: "Nunito",
  },
  {
    name: "Open Sans",
  },
  {
    name: "Ostrich",
  },
  {
    name: "Oswald",
  },
  {
    name: "Palanquin Dark",
  },
  {
    name: "Parisienne",
  },
  {
    name: "Permanent Marker",
  },
  {
    name: "Petit Formal Script",
  },
  {
    name: "Playfair Display",
  },
  {
    name: "Poppins",
  },
  {
    name: "Quicksand",
  },
  {
    name: "Rasa",
  },
  {
    name: "Roboto",
  },
  {
    name: "Roboto Condensed",
  },
  {
    name: "Roboto Slab",
  },
  {
    name: "Sancreek",
  },
  {
    name: "Shrikhand",
  },
  {
    name: "Source Code Pro",
  },
  {
    name: "Source Sans Pro",
  },
  {
    name: "Source Serif Pro",
  },
  {
    name: "Space Grotesk",
  },
  {
    name: "Space Mono",
  },
  {
    name: "Stint Ultra Condensed",
  },
  {
    name: "Stint Ultra Expanded",
  },
  {
    name: "Sue",
  },
  {
    name: "Trash Hand",
  },
  {
    name: "Ultra",
  },
  {
    name: "VT323",
  },
  {
    name: "Yeseva",
  },
];
