import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import {
  fetchAssets,
  fetchFonts,
  fetchResturants,
  getImageDimensions,
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
import { TailSpin } from "react-loader-spinner";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUpload } from "@tabler/icons";
import { getCurrentSelectedPage } from "./helping";
import { removeSpecialCharacters } from "../../helpers/CommonFunctions";
import { getElementsWithRestaurant } from "../../tests/helpers/menu.helper";
interface fontsErrorsType {
  title?: string;
  file?: string;
  submit?: string;
}
const customComponent = {
  recent: "Recent",
};
const Editor = ({
  template,
  layout,
  preview,
  restaurantList,
  user,
  allowExport
}: {
  template: ITemplateDetails | null;
  layout?: ITemplateDetails | null;
  preview?: boolean;
  restaurantList?: any;
  user: IUserDetails;
  allowExport?: boolean;
}) => {
  const cesdkContainer = useRef<any>(null);
  const cesdkInstance = useRef<any>(null);
  let cesdk: { dispose: () => void };
  const supabase = useSupabaseClient();
  const [templateModal, settemplateModal] = useState<boolean>(false);
  const [content, setcontent] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<Promise<string>[]>([]);
  const [userData, setUserData] = useState<any>(getUser());
  const [input, setinput] = useState<any>(1);
  const router = useRouter();
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setloading] = useState(false);
  const [loadinEditor, setloadinEditor] = useState(true);
  const [font, setFont] = useState();
  const [titleFontSize, setTitleFontSize] = useState<any>("");
  const [fonts, setFonts] = useState<any>([]);
  const [restaurantsOptions, setRestaurantsOptions] = useState([]);
  const [fontsError, setFontsError] = useState<fontsErrorsType | undefined>();
  const [libraryLoading, setlibraryLoading] = useState(false);
  const [libraryElements, setlibraryElements] = useState<any>();
  const [usedComponenets, setusedComponenets] = useState<any>([]);
  const [menuInjected, setMenuInjected] = useState<boolean>(false);
  useEffect(() => {
    setUserData(user);
    if (user) {
      closeAuthDialog();
    }
  }, [user]);
  function getConfigOfRecentComponent(eleList: any, id: string) {
    // most recent custom library component
    const recentcustomSource = {
      id: id,
      title: id,
      label: id,
      previewBackgroundType: "contain",
      async findAssets(queryData: any) {
        return Promise.resolve({
          assets: eleList,
          total: eleList.length,
          currentPage: queryData.page,
          nextPage: undefined,
        });
      },
      async applyAsset(assetResult: any) {
        try {
          const firstPage = await getCurrentSelectedPage(
            cesdkInstance?.current
          );
          const block =
            await cesdkInstance?.current.engine.block.loadFromString(
              assetResult?.meta?.value
            );
          cesdkInstance?.current.engine.block.setName(block[0], "ddddd");
          await cesdkInstance?.current.engine.block.appendChild(
            firstPage,
            block[0]
          );
          await cesdkInstance?.current.engine.block.setSelected(block[0], true);
          await cesdkInstance?.current.engine.block.select(block[0]);
          const isSourceExist = cesdkInstance?.current.engine.asset
            .findAllSources()
            ?.includes(customComponent?.recent);
          if (isSourceExist) {
            const findList =
              await cesdkInstance?.current.engine.asset.findAssets(
                customComponent?.recent
              );
            const isAlreadyExist = findList?.assets?.find(
              (i: any) => i?.id === assetResult?.id
            );
            if (!isAlreadyExist) {
              const newList = [assetResult, ...findList?.assets];
              await cesdkInstance?.current.engine.asset.removeSource(
                customComponent?.recent
              );
              await cesdkInstance?.current.engine.asset.addSource(
                getConfigOfRecentComponent(newList, customComponent?.recent)
              );
            }
          } else {
            await cesdkInstance?.current.engine.asset.addSource(
              getConfigOfRecentComponent([assetResult], customComponent?.recent)
            );
          }
        } catch (error) {
          console.log("error", error);

          throw error;
        }
      },
      async applyAssetToBlock(assetResult: any, block: any) {
        cesdkInstance?.current.engine.asset.defaultApplyAssetToBlock(
          assetResult,
          block
        );
      },
    };
    return recentcustomSource;
  }

  function getConfigOfImageComponent(eleList: any, id: string) {
    // most recent custom library component
    const recentcustomSource = {
      id: id,
      title: id,
      label: id,
      previewLength: 3,
      gridItemHeight: 'square',
      previewBackgroundType: 'cover',
      async findAssets(queryData: any) {
        return Promise.resolve({
          assets: eleList,
          total: eleList.length,
          currentPage: queryData.page,
          nextPage: undefined,
        });
      },
    };
    return recentcustomSource;
  }
  const setup = async () => {
    const templateFonts = await fetchFonts();
    setFonts(templateFonts);
    const config: object = {
      logger: () => { },
      role: "Creator",
      theme: "light",
      license: process.env.REACT_APP_LICENSE,
      ...(template?.content && {
        initialSceneURL:
          process.env.NEXT_PUBLIC_SUPABASE_URL +
          `/storage/v1/object/public/templates/${template?.content
          }?t=${new Date().toISOString()}`,
      }),
      // baseURL: '/assets',
      // core: {
      //   baseURL: 'core/'
      // },
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
              manage: preview ? false : true,
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
                show: allowExport ? true : false,
                format: ["application/pdf"],
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
                  {
                    ...defaultEntries[3],
                  },
                  // Images
                  {
                    ...defaultEntries[2],
                    id: "Images",
                    sourceIds: [
                      "ly.img.image.upload",
                      ...restaurantList?.map((item: any) => `${item?.name}.`),
                    ],
                    previewLength: 3,
                    gridItemHeight: 'square',
                    previewBackgroundType: 'cover',
                  },
                  // Shapes
                  defaultEntries[4],
                  // Custom Components
                  user?.role === "flapjack" ?
                    {
                      id: "Elements",
                      sourceIds: [
                        customComponent?.recent,
                        "Elements",
                        ...restaurantList?.map((item: any) => item?.name),
                      ],
                      previewLength: 2,
                      gridColumns: 2,
                      previewBackgroundType: "contain",
                      gridBackgroundType: "contain",
                      icon: ({ theme, iconSize }: any) => {
                        return "https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/elementsThumbnail/icon.svg";
                      },
                    } : {}
                ];
              },
            },
          },
        },
      },
      callbacks: {
        onExport: async (blobs: any) => {
          let isAbleToExport = true;
          if (template?.printPreview) {
            saveMenuToLibrary()
            window.open(`/menu/printpreview/${template.id}/${template.printPreview}`)
          } else {
            setUserData((user: any) => {
              if (isAbleToExport) {
                isAbleToExport = false;
                if (user) {
                  console.log("template", template);

                  downloadBlobFile(
                    blobs?.[0],
                    removeSpecialCharacters(template?.name) || ""
                  );
                } else {
                  openAuthDialog();
                }
                setTimeout(() => {
                  isAbleToExport = true;
                }, 1000);
              }
              return user;
            });
          }
        },
        onUpload: async (file: any) => {
          try {
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
                      throw error;
                    }
                    const userData = localStorage.getItem("userData");
                    const user = userData && JSON.parse(userData);
                    const { height, width } = await getImageDimensions(file);
                    await dbClient.from("assets").insert({
                      content,
                      createdBy: user?.id,
                      restaurant_id: user?.restaurant_id,
                      template_id: template?.id,
                      height,
                      width,
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
          } catch (error) {
            throw error;
          }
        },
        onSave: (scene: any) => {
          let isAbleToUpdate = true;
          saveMenuToLibrary()
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
      CreativeEditorSDK.init(cesdkContainer.current, config).then(
        async (instance: any) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources();
          cesdk = instance;
          cesdkInstance.current = instance;
          const configData = await getElementsWithRestaurant(
            user,
            template?.id
          );

          // If there is a scene and layout, we will duplicate the first page, one for each element in layout
          const scene = await cesdkInstance.current.engine.scene.get()
          if (scene && layout && router.pathname.includes("printpreview/")) {
            const editor = cesdkInstance.current.engine.block;
            const existingPages = editor.findByType("page")
            const pageWidth = editor.getWidth(existingPages[0])
            const pageHeight = editor.getHeight(existingPages[0])
            const numPages = layout?.content.length
            for (let i = 0; i < numPages - 1; i++) {
              const page = cesdkInstance.current.engine.block.duplicate(existingPages[0]);
              editor.setWidth(page, pageWidth)
              editor.setHeight(page, pageHeight)
              editor.appendChild(3, page); // this should be REFACTORED, it is hard coded because there is oddly a scene inside of a scene. I don't think this is implemented properly
            }
          }
          if (user?.role === "flapjack") {
            setlibraryElements(configData?.libraryElements);
            configData?.ElementsSectionList?.forEach(async (element: any) => {
              if (element?.items?.length > 0 && element?.resturantDetail?.name) {
                await instance?.engine?.asset?.addSource(
                  getConfigOfRecentComponent(
                    element?.items,
                    element?.resturantDetail?.name
                  )
                );
              }
            });
          }
          configData?.globalTemplates?.forEach(async (element: any) => {
            if (element?.items?.length > 0 && element?.resturantDetail?.name) {
              await instance?.engine?.asset?.addSource(
                getConfigOfImageComponent(
                  element?.items.map(translateToAssetResult),
                  `${element?.resturantDetail?.name}.`
                )
              );
            }
          });
          // Custom library component
          const customSource = {
            id: "Elements",
            previewBackgroundType: "contain",
            gridBackgroundType: "contain",

            async findAssets(queryData: any) {
              return Promise.resolve({
                assets: configData?.libraryElements,
                total: configData?.libraryElements?.length,
                currentPage: queryData.page,
                nextPage: undefined,
              });
            },
            async applyAsset(assetResult: any) {
              try {
                const firstPage = await getCurrentSelectedPage(instance);
                const block = await instance.engine.block.loadFromString(
                  assetResult?.meta?.value
                );
                instance.engine.block.setName(block[0], "ddddd");
                await instance.engine.block.appendChild(firstPage, block[0]);
                await instance.engine.block.setSelected(block[0], true);
                await instance.engine.block.select(block[0]);
                const isSourceExist = instance.engine.asset
                  .findAllSources()
                  ?.includes(customComponent?.recent);
                if (isSourceExist) {
                  const findList = await instance.engine.asset.findAssets(
                    customComponent?.recent
                  );
                  const isAlreadyExist = findList?.assets?.find(
                    (i: any) => i?.id === assetResult?.id
                  );
                  if (!isAlreadyExist) {
                    const newList = [assetResult, ...findList?.assets];
                    await instance.engine.asset.removeSource(
                      customComponent?.recent
                    );
                    await instance.engine.asset.addSource(
                      getConfigOfRecentComponent(
                        newList,
                        customComponent?.recent
                      )
                    );
                  }
                } else {
                  await instance.engine.asset.addSource(
                    getConfigOfRecentComponent(
                      [assetResult],
                      customComponent?.recent
                    )
                  );
                }
              } catch (error) {
                console.log("error", error);

                throw error;
              }
            },
            async applyAssetToBlock(assetResult: any, block: any) {
              instance.engine.asset.defaultApplyAssetToBlock(
                assetResult,
                block
              );
            },
          };
          instance.engine.asset.addSource(customSource);

          setinput(input + 1);
          setloadinEditor(false);
          if (user?.role !== "flapjack") {
            fetchAssets().then(
              async (assetsData) => await getAssetSources(assetsData)
            );
            const getAssetSources = async (assetsData: any[]) => {
              if (assetsData.length) {
                const assets = assetsData.map(translateToAssetResult);
                assets.forEach((asset: any) => {
                  instance.engine.asset.addAssetToSource(
                    "ly.img.image.upload",
                    asset
                  );
                });
              }
            };
          }

          // enablePreviewMode();
        }
      );
    }
  };

  useEffect(() => {
    const getOptions = async () => {
      const options: any = await fetchResturants();
      setRestaurantsOptions(options);
    };
    getOptions();
    setup();
    return () => {
      if (cesdk) {
        cesdk.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesdkContainer]);

  // const enablePreviewMode = () => {
  //   var elementWithShadowRoot = document.querySelector(
  //     "#cesdkContainer #root-shadow "
  //   );
  //   var shadowRoot = elementWithShadowRoot?.shadowRoot;
  // };
  function downloadBlobFile(blob: any, fileName: string) {
    try {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.pdf`;
      link.click();
    } catch (error: any) {
      console.log("error", error);
      const errorMessage = error?.message
        ? error?.message
        : "Something went wrong";
      alert(errorMessage);
    }
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
      const sideBarPanel =
        "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelLeft div .UBQ_AssetLibraryDock__panelContent--ED9NO .UBQ_AssetLibraryContent__block--mQiYI div div div";
      var sideBarPanelList = shadowRoot?.querySelector(
        `${sideBarPanel}`
      )?.childElementCount;
      if (sideBarPanelList) {
        var removaAbleList = shadowRoot?.querySelector(`${sideBarPanel}`);
        if (removaAbleList) {
          for (let index = 0; index < sideBarPanelList; index++) {
            const child = removaAbleList?.children;
            const element = child[index];
            const button = element?.children[0]?.children[0] as HTMLElement;

            if (button) {
              button.style.backgroundSize = "contain";
            }
          }
        }
      }

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
          if (
            placeholderChild?.textContent?.includes("Placeholder") ||
            placeholderChild?.textContent?.includes("Save to Library") ||
            placeholderChild?.textContent?.includes("Loading...")
          ) {
            // Create the new element with the provided HTML structure
            var newElement = document.createElement("div");
            newElement.innerHTML = `
              <div class="UBQ_CanvasAction__block--gWWG6" style="border-right: 1px solid hsla(210, 30%, 10%, 0.12);">
             <button type="button" name="placeholdersettings-create_placeholder" class="UBQ_Button__block--C5ITk UBQ_Button__ubq-variant_Plain--tlabL" aria-pressed="false" data-cy="placeholdersettings-create_placeholder" data-loading="false" data-active="false">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9.03854 7.42787C8.83939 7.16163 8.58532 6.94133 8.29354 6.78193C8.00177 6.62252 7.67912 6.52772 7.34749 6.50397C7.01586 6.48022 6.683 6.52807 6.37149 6.64427C6.05998 6.76048 5.7771 6.94231 5.54205 7.17746L4.15087 8.56863C3.72851 9.00593 3.4948 9.59163 3.50009 10.1996C3.50537 10.8075 3.74922 11.389 4.17911 11.8189C4.609 12.2488 5.19055 12.4927 5.79848 12.498C6.40642 12.5032 6.99211 12.2695 7.42941 11.8472L8.22238 11.0542" stroke="currentColor" stroke-opacity="0.9"></path>
                      <path d="M6.96146 8.57018C7.16061 8.83642 7.41468 9.05671 7.70646 9.21612C7.99823 9.37553 8.32088 9.47033 8.65251 9.49408C8.98414 9.51783 9.317 9.46998 9.62851 9.35377C9.94002 9.23757 10.2229 9.05573 10.458 8.82059L11.8491 7.42941C12.2715 6.99211 12.5052 6.40642 12.4999 5.79848C12.4946 5.19055 12.2508 4.609 11.8209 4.17911C11.391 3.74922 10.8095 3.50537 10.2015 3.50009C9.59358 3.4948 9.00789 3.72851 8.57059 4.15087L7.77762 4.94384" stroke="currentColor" stroke-opacity="0.9"></path>
                    </svg>
                    <span>${libraryLoading ? "Loading..." : "Save to Library"
              }</span>
                  </span>
                </button>
              </div>
            `;
            newElement.addEventListener("click", saveToLibrary);
            const blockType = cesdkInstance?.current?.engine?.block?.getType(
              selectedIds[0]
            );
            if (
              blockType !== "//ly.img.ubq/page" &&
              user?.role === "flapjack"
            ) {
              placeholderChild.replaceWith(newElement);
              // placeholderChild.remove();

            } else {
              placeholderChild.remove();
            }
          }
        }
      }
      var previewElement = shadowRoot?.querySelector(
        `div .UBQ_Theme__block--nxqW8 div div div .UBQ_Topbar__controlsContainerRight--0PI5c`
      );
      let previewChildrenLength = previewElement?.children;
      if (previewChildrenLength?.length === 3) {
        previewElement?.removeChild(previewChildrenLength[1]);
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
  }, [input, libraryLoading]);

  const design = {
    value:
      "UBQ1ewoiZm9ybWF0IjogIi8vbHkuaW1nLmNlc2RrL2VsZW1lbnRzIiwKInZlcnNpb24iOiAiMS4wLjAiLAoiZGVzaWduRWxlbWVudHMiOiB7CiJkZXNpZ25FbGVtZW50cyI6IFsKewoiZW50aXR5IjogNDA0NzUwMzczLAoidXVpZCI6ICJmYTgwZTIxNS04MjNhLTRhNTMtYjZiZC00MDVkOWE4N2NlYjgiLAoiaWQiOiAiLy9seS5pbWcudWJxL2ZpbGwvY29sb3IiLAoiYmFzZV9wcm9wc192ZXJzaW9uIjogMjgsCiJibG9ja19yZW5kZXJfY29ubmVjdGlvbnMiOiBbCjU2NDEzMzkwMQpdLAoiYmxvY2tfY3JlYXRvcl9yb2xlIjogMCwKImJsb2NrX2NvbW1vbiI6IHsKInZlcnNpb24iOiAxLAoibmFtZSI6ICIiLAoiZXhwb3J0YWJsZSI6IHRydWUsCiJhbHdheXNPblRvcCI6IGZhbHNlCn0sCiJkZXNjcmlwdGlvbiI6IHsKInZlcnNpb24iOiAxLAoidmFsdWUiOiAiIgp9LAoibWV0YWRhdGEiOiBbXSwKImhhc19ibG9ja19wbGF5YmFja190aW1lIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxheWJhY2tfY29udHJvbCI6IGZhbHNlLAoiaGFzX2Jsb2NrX2R1cmF0aW9uIjogZmFsc2UsCiJoYXNfYmxvY2tfdGltZV9vZmZzZXQiOiBmYWxzZSwKImhhc19ibG9ja190cmltIjogZmFsc2UsCiJibG9ja19zb2xvX3BsYXliYWNrIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxhY2Vob2xkZXJfY29udHJvbHMiOiBmYWxzZSwKInZlcnNpb24iOiAxLAoidmFsdWUiOiB7CiJ2ZXJzaW9uIjogNCwKImNvbG9yU3BhY2UiOiAwLAoiY29tcG9uZW50cyI6IHsKInZlcnNpb24iOiAxLAoieCI6IDAuOTIwODMzMzQ5MjI3OTA1MywKInkiOiAwLjkyMDgzMzM0OTIyNzkwNTMsCiJ6IjogMC45MjA4MzMzNDkyMjc5MDUzLAoidyI6IDEuMAp9Cn0KfSwKewoiZW50aXR5IjogNTY0MTMzOTAxLAoidXVpZCI6ICI3ZThjYjQyMS1kNTk3LTQwN2UtODMyMy1kMDdlZWQ0NmNlNzMiLAoiaWQiOiAiLy9seS5pbWcudWJxL3NoYXBlcy9yZWN0IiwKImJhc2VfcHJvcHNfdmVyc2lvbiI6IDI4LAoiaGFzX2Jsb2NrX3pfaW5kZXhfdmFsdWUiOiBmYWxzZSwKImJsb2NrX3Bvc2l0aW9uIjogewoidmVyc2lvbiI6IDIsCiJsZWZ0IjogewoidmVyc2lvbiI6IDEsCiJ1bml0IjogMSwKInZhbHVlIjogMC4wCn0sCiJ0b3AiOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAxLAoidmFsdWUiOiAwLjAKfSwKInJpZ2h0IjogewoidmVyc2lvbiI6IDEsCiJ1bml0IjogMCwKInZhbHVlIjogMC4wCn0sCiJib3R0b20iOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAwLAoidmFsdWUiOiAwLjAKfSwKInR5cGUiOiAwCn0sCiJibG9ja19zaXplIjogewoidmVyc2lvbiI6IDEsCiJ3aWR0aCI6IHsKInZlcnNpb24iOiAxLAoidW5pdCI6IDEsCiJ2YWx1ZSI6IDUuNTAwMDAyMzg0MTg1NzkxCn0sCiJoZWlnaHQiOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAxLAoidmFsdWUiOiA4LjQ5OTg5MDMyNzQ1MzYxNAp9Cn0sCiJoYXNfYmxvY2tfbWFyZ2luX3ZhbHVlIjogZmFsc2UsCiJoYXNfYmxvY2tfZGVwdGhfdmFsdWUiOiBmYWxzZSwKImJsb2NrX3JvdGF0aW9uIjogewoidmVyc2lvbiI6IDEsCiJ4IjogMC4wLAoieSI6IDAuMCwKInoiOiAwLjAKfSwKImJsb2NrX3NjYWxlIjogewoidmVyc2lvbiI6IDEsCiJ4IjogMS4wLAoieSI6IDEuMCwKInoiOiAxLjAKfSwKImJsb2NrX2JsZW5kX21vZGUiOiAxLAoiYmxvY2tfc29ydGluZ19vcmRlciI6IDAsCiJoYXNfYmxvY2tfZmlsbF92YWx1ZSI6IHRydWUsCiJibG9ja19maWxsIjogewoidmVyc2lvbiI6IDEsCiJlbmFibGVkIjogdHJ1ZSwKInZhbHVlIjogNDA0NzUwMzczCn0sCiJoYXNfYmxvY2tfZWZmZWN0c192YWx1ZSI6IHRydWUsCiJibG9ja19lZmZlY3RzIjogewoidmVyc2lvbiI6IDEsCiJlZmZlY3RzIjogW10KfSwKImhhc19ibG9ja19ibHVyX3ZhbHVlIjogdHJ1ZSwKImJsb2NrX2JsdXIiOiB7CiJ2ZXJzaW9uIjogMSwKImVuYWJsZWQiOiB0cnVlLAoidmFsdWUiOiA0Mjk0OTY3Mjk1Cn0sCiJibG9ja19jb250ZW50X2ZpbGxfbW9kZSI6IDEsCiJoYXNfYmxvY2tfY3JvcCI6IGZhbHNlLAoiYmxvY2tfc2NvcGVzIjogewoidmVyc2lvbiI6IDEsCiJzY29wZXMiOiB7CiJ2YWx1ZTAiOiB7CiJ2ZXJzaW9uIjogMiwKImRlc2lnbi9zdHlsZSI6IHRydWUsCiJkZXNpZ24vYXJyYW5nZSI6IHRydWUsCiJkZXNpZ24vYXJyYW5nZS9tb3ZlIjogdHJ1ZSwKImRlc2lnbi9hcnJhbmdlL3Jlc2l6ZSI6IHRydWUsCiJkZXNpZ24vYXJyYW5nZS9yb3RhdGUiOiB0cnVlLAoiZGVzaWduL2FycmFuZ2UvZmxpcCI6IHRydWUsCiJjb250ZW50L3JlcGxhY2UiOiB0cnVlLAoibGlmZWN5Y2xlL2Rlc3Ryb3kiOiB0cnVlLAoibGlmZWN5Y2xlL2R1cGxpY2F0ZSI6IHRydWUsCiJlZGl0b3IvaW5zcGVjdCI6IHRydWUsCiJlZGl0b3IvcHJlc2VudCI6IHRydWUsCiJlZGl0b3IvbWFuYWdlUGFnZXMiOiB0cnVlLAoiZWRpdG9yL3NlbGVjdCI6IHRydWUsCiJlZGl0b3Ivem9vbSI6IHRydWUKfSwKInZhbHVlMSI6IHsKInZlcnNpb24iOiAyLAoiZGVzaWduL3N0eWxlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvbW92ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvcmVzaXplIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9yb3RhdGUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL2ZsaXAiOiBmYWxzZSwKImNvbnRlbnQvcmVwbGFjZSI6IGZhbHNlLAoibGlmZWN5Y2xlL2Rlc3Ryb3kiOiBmYWxzZSwKImxpZmVjeWNsZS9kdXBsaWNhdGUiOiBmYWxzZSwKImVkaXRvci9pbnNwZWN0IjogZmFsc2UsCiJlZGl0b3IvcHJlc2VudCI6IGZhbHNlLAoiZWRpdG9yL21hbmFnZVBhZ2VzIjogZmFsc2UsCiJlZGl0b3Ivc2VsZWN0IjogZmFsc2UsCiJlZGl0b3Ivem9vbSI6IGZhbHNlCn0sCiJ2YWx1ZTIiOiB7CiJ2ZXJzaW9uIjogMiwKImRlc2lnbi9zdHlsZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL21vdmUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL3Jlc2l6ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2Uvcm90YXRlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9mbGlwIjogZmFsc2UsCiJjb250ZW50L3JlcGxhY2UiOiBmYWxzZSwKImxpZmVjeWNsZS9kZXN0cm95IjogZmFsc2UsCiJsaWZlY3ljbGUvZHVwbGljYXRlIjogZmFsc2UsCiJlZGl0b3IvaW5zcGVjdCI6IGZhbHNlLAoiZWRpdG9yL3ByZXNlbnQiOiBmYWxzZSwKImVkaXRvci9tYW5hZ2VQYWdlcyI6IGZhbHNlLAoiZWRpdG9yL3NlbGVjdCI6IGZhbHNlLAoiZWRpdG9yL3pvb20iOiBmYWxzZQp9LAoidmFsdWUzIjogewoidmVyc2lvbiI6IDIsCiJkZXNpZ24vc3R5bGUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9tb3ZlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9yZXNpemUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL3JvdGF0ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvZmxpcCI6IGZhbHNlLAoiY29udGVudC9yZXBsYWNlIjogZmFsc2UsCiJsaWZlY3ljbGUvZGVzdHJveSI6IGZhbHNlLAoibGlmZWN5Y2xlL2R1cGxpY2F0ZSI6IGZhbHNlLAoiZWRpdG9yL2luc3BlY3QiOiBmYWxzZSwKImVkaXRvci9wcmVzZW50IjogZmFsc2UsCiJlZGl0b3IvbWFuYWdlUGFnZXMiOiBmYWxzZSwKImVkaXRvci9zZWxlY3QiOiBmYWxzZSwKImVkaXRvci96b29tIjogZmFsc2UKfQp9Cn0sCiJoYXNfZHJvcF9zaGFkb3ciOiB0cnVlLAoiZHJvcF9zaGFkb3ciOiB7CiJ2ZXJzaW9uIjogMSwKImVuYWJsZWQiOiBmYWxzZSwKImNvbG9yIjogewoidmVyc2lvbiI6IDQsCiJjb2xvclNwYWNlIjogMCwKImNvbXBvbmVudHMiOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiAwLjAsCiJ5IjogMC4wLAoieiI6IDAuMCwKInciOiAwLjI1Cn0KfSwKInhPZmZzZXQiOiAxLjc2Nzc2Njk1MjUxNDY0ODUsCiJ5T2Zmc2V0IjogMS43Njc3NjY5NTI1MTQ2NDg1LAoieEJsdXJSYWRpdXMiOiAxLjAsCiJ5Qmx1clJhZGl1cyI6IDEuMCwKImNsaXAiOiBmYWxzZQp9LAoiaGlkZGVuIjogZmFsc2UsCiJjbGlwcGVkIjogZmFsc2UsCiJkaXNhYmxlX3NlbGVjdGlvbiI6IGZhbHNlLAoiaXNfcGxhY2Vob2xkZXIiOiBmYWxzZSwKImlzX3BsYWNlaG9sZGVyX2NvbnRlbnQiOiBmYWxzZSwKImJsb2NrX2NyZWF0b3Jfcm9sZSI6IDAsCiJibG9ja19jb21tb24iOiB7CiJ2ZXJzaW9uIjogMSwKIm5hbWUiOiAiZGlzaF91bmRlZmluZWQiLAoiZXhwb3J0YWJsZSI6IHRydWUsCiJhbHdheXNPblRvcCI6IGZhbHNlCn0sCiJkZXNjcmlwdGlvbiI6IHsKInZlcnNpb24iOiAxLAoidmFsdWUiOiAiIgp9LAoibWV0YWRhdGEiOiBbXSwKImhhc19ibG9ja19wbGF5YmFja190aW1lIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxheWJhY2tfY29udHJvbCI6IGZhbHNlLAoiaGFzX2Jsb2NrX2R1cmF0aW9uIjogZmFsc2UsCiJoYXNfYmxvY2tfdGltZV9vZmZzZXQiOiBmYWxzZSwKImhhc19ibG9ja190cmltIjogZmFsc2UsCiJibG9ja19zb2xvX3BsYXliYWNrIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxhY2Vob2xkZXJfY29udHJvbHMiOiB0cnVlLAoiYmxvY2tfcGxhY2Vob2xkZXJfY29udHJvbHMiOiB7CiJ2ZXJzaW9uIjogMSwKInNob3dPdmVybGF5IjogZmFsc2UsCiJzaG93QnV0dG9uIjogZmFsc2UKfSwKInZlcnNpb24iOiA4LAoib3BhY2l0eSI6IDEuMCwKInN0cm9rZSI6IHsKInZlcnNpb24iOiAxLAoiY29sb3IiOiB7CiJ2ZXJzaW9uIjogNCwKImNvbG9yU3BhY2UiOiAwLAoiY29tcG9uZW50cyI6IHsKInZlcnNpb24iOiAxLAoieCI6IDAuMCwKInkiOiAwLjAsCiJ6IjogMC4wLAoidyI6IDEuMAp9Cn0sCiJ3aWR0aCI6IDAuMDUxMTgxMTUyNDYyOTU5MjksCiJzdHlsZSI6IDAsCiJwb3NpdGlvbiI6IDEsCiJjb3JuZXJHZW9tZXRyeSI6IDEsCiJlbmFibGVkIjogdHJ1ZQp9LAoiZmlsbCI6IHsKInZlcnNpb24iOiAxLAoidmFsdWUiOiB7CiJ2ZXJzaW9uIjogMSwKInR5cGUiOiAwLAoiZGF0YSI6IHsKImluZGV4IjogMCwKImRhdGEiOiB7CiJ2ZXJzaW9uIjogNCwKImNvbG9yU3BhY2UiOiAwLAoiY29tcG9uZW50cyI6IHsKInZlcnNpb24iOiAxLAoieCI6IDAuMCwKInkiOiAwLjAsCiJ6IjogMC4wLAoidyI6IDEuMAp9Cn0KfQp9LAoiZW5hYmxlZCI6IHRydWUKfSwKIm91dGxpbmVDb2xvciI6IHsKInZlcnNpb24iOiA0LAoiY29sb3JTcGFjZSI6IDAsCiJjb21wb25lbnRzIjogewoidmVyc2lvbiI6IDEsCiJ4IjogMC4wLAoieSI6IDAuMCwKInoiOiAwLjAsCiJ3IjogMS4wCn0KfSwKIm91dGxpbmVXaWR0aCI6IDAuMDUxMTgxMTUyNDYyOTU5MjksCiJvdXRsaW5lRW5hYmxlZCI6IHRydWUsCiJjb2xvciI6IHsKInZlcnNpb24iOiA0LAoiY29sb3JTcGFjZSI6IDAsCiJjb21wb25lbnRzIjogewoidmVyc2lvbiI6IDEsCiJ4IjogMC4wLAoieSI6IDAuMCwKInoiOiAwLjAsCiJ3IjogMS4wCn0KfSwKImNvbG9yRW5hYmxlZCI6IHRydWUKfQpdLAoiaGllcmFyY2hpZXMiOiBbCnsKInJvb3QiOiA1NjQxMzM5MDEsCiJjaGlsZHJlbiI6IFtdCn0KXSwKInBhcmVudHMiOiBbCjQKXQp9Cn0=",
    title:
      "UBQ1ewoiZm9ybWF0IjogIi8vbHkuaW1nLmNlc2RrL2VsZW1lbnRzIiwKInZlcnNpb24iOiAiMS4wLjAiLAoiZGVzaWduRWxlbWVudHMiOiB7CiJkZXNpZ25FbGVtZW50cyI6IFsKewoiZW50aXR5IjogNzQsCiJ1dWlkIjogImM0OTY0MWY0LTEwNWEtNDdhZS1hZTFhLWNhNjUyNTQyNTRiNyIsCiJpZCI6ICIvL2x5LmltZy51YnEvZmlsbC9jb2xvciIsCiJiYXNlX3Byb3BzX3ZlcnNpb24iOiAyOCwKImJsb2NrX3JlbmRlcl9jb25uZWN0aW9ucyI6IFsKMTY3NzcyMjcKXSwKImJsb2NrX2NyZWF0b3Jfcm9sZSI6IDAsCiJibG9ja19jb21tb24iOiB7CiJ2ZXJzaW9uIjogMSwKIm5hbWUiOiAiIiwKImV4cG9ydGFibGUiOiB0cnVlLAoiYWx3YXlzT25Ub3AiOiBmYWxzZQp9LAoiZGVzY3JpcHRpb24iOiB7CiJ2ZXJzaW9uIjogMSwKInZhbHVlIjogIiIKfSwKIm1ldGFkYXRhIjogW10sCiJoYXNfYmxvY2tfcGxheWJhY2tfdGltZSI6IGZhbHNlLAoiaGFzX2Jsb2NrX3BsYXliYWNrX2NvbnRyb2wiOiBmYWxzZSwKImhhc19ibG9ja19kdXJhdGlvbiI6IGZhbHNlLAoiaGFzX2Jsb2NrX3RpbWVfb2Zmc2V0IjogZmFsc2UsCiJoYXNfYmxvY2tfdHJpbSI6IGZhbHNlLAoiYmxvY2tfc29sb19wbGF5YmFjayI6IGZhbHNlLAoiaGFzX2Jsb2NrX3BsYWNlaG9sZGVyX2NvbnRyb2xzIjogZmFsc2UsCiJ2ZXJzaW9uIjogMSwKInZhbHVlIjogewoidmVyc2lvbiI6IDQsCiJjb2xvclNwYWNlIjogMCwKImNvbXBvbmVudHMiOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiAwLjAsCiJ5IjogMC4wLAoieiI6IDAuMCwKInciOiAxLjAKfQp9Cn0sCnsKImVudGl0eSI6IDE2Nzc3MjI3LAoidXVpZCI6ICIzYjEzMzIwOS1lODdmLTQ0YWYtOGNkMy03YzAxMmVkZWQzYzkiLAoiaWQiOiAiLy9seS5pbWcudWJxL3RleHQiLAoiYmFzZV9wcm9wc192ZXJzaW9uIjogMjgsCiJoYXNfYmxvY2tfel9pbmRleF92YWx1ZSI6IGZhbHNlLAoiYmxvY2tfcG9zaXRpb24iOiB7CiJ2ZXJzaW9uIjogMiwKImxlZnQiOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAxLAoidmFsdWUiOiAwLjE1MjkxMzI3MjM4MDgyODg3Cn0sCiJ0b3AiOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAxLAoidmFsdWUiOiAwLjI0NjgxODM5MzQ2ODg1NjgKfSwKInJpZ2h0IjogewoidmVyc2lvbiI6IDEsCiJ1bml0IjogMCwKInZhbHVlIjogMC4wCn0sCiJib3R0b20iOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAwLAoidmFsdWUiOiAwLjAKfSwKInR5cGUiOiAwCn0sCiJibG9ja19zaXplIjogewoidmVyc2lvbiI6IDEsCiJ3aWR0aCI6IHsKInZlcnNpb24iOiAxLAoidW5pdCI6IDEsCiJ2YWx1ZSI6IDguMDkwMjE0NzI5MzA5MDgyCn0sCiJoZWlnaHQiOiB7CiJ2ZXJzaW9uIjogMSwKInVuaXQiOiAzLAoidmFsdWUiOiAwLjAKfQp9LAoiaGFzX2Jsb2NrX21hcmdpbl92YWx1ZSI6IGZhbHNlLAoiaGFzX2Jsb2NrX2RlcHRoX3ZhbHVlIjogZmFsc2UsCiJibG9ja19yb3RhdGlvbiI6IHsKInZlcnNpb24iOiAxLAoieCI6IDAuMCwKInkiOiAwLjAsCiJ6IjogMC4wCn0sCiJibG9ja19zY2FsZSI6IHsKInZlcnNpb24iOiAxLAoieCI6IDEuMCwKInkiOiAxLjAsCiJ6IjogMS4wCn0sCiJibG9ja19ibGVuZF9tb2RlIjogMSwKImJsb2NrX3NvcnRpbmdfb3JkZXIiOiAwLAoiaGFzX2Jsb2NrX2ZpbGxfdmFsdWUiOiB0cnVlLAoiYmxvY2tfZmlsbCI6IHsKInZlcnNpb24iOiAxLAoiZW5hYmxlZCI6IHRydWUsCiJ2YWx1ZSI6IDc0Cn0sCiJoYXNfYmxvY2tfZWZmZWN0c192YWx1ZSI6IGZhbHNlLAoiaGFzX2Jsb2NrX2JsdXJfdmFsdWUiOiBmYWxzZSwKImJsb2NrX2NvbnRlbnRfZmlsbF9tb2RlIjogMSwKImhhc19ibG9ja19jcm9wIjogZmFsc2UsCiJibG9ja19zY29wZXMiOiB7CiJ2ZXJzaW9uIjogMSwKInNjb3BlcyI6IHsKInZhbHVlMCI6IHsKInZlcnNpb24iOiAyLAoiZGVzaWduL3N0eWxlIjogdHJ1ZSwKImRlc2lnbi9hcnJhbmdlIjogdHJ1ZSwKImRlc2lnbi9hcnJhbmdlL21vdmUiOiB0cnVlLAoiZGVzaWduL2FycmFuZ2UvcmVzaXplIjogdHJ1ZSwKImRlc2lnbi9hcnJhbmdlL3JvdGF0ZSI6IHRydWUsCiJkZXNpZ24vYXJyYW5nZS9mbGlwIjogdHJ1ZSwKImNvbnRlbnQvcmVwbGFjZSI6IHRydWUsCiJsaWZlY3ljbGUvZGVzdHJveSI6IHRydWUsCiJsaWZlY3ljbGUvZHVwbGljYXRlIjogdHJ1ZSwKImVkaXRvci9pbnNwZWN0IjogdHJ1ZSwKImVkaXRvci9wcmVzZW50IjogdHJ1ZSwKImVkaXRvci9tYW5hZ2VQYWdlcyI6IHRydWUsCiJlZGl0b3Ivc2VsZWN0IjogdHJ1ZSwKImVkaXRvci96b29tIjogdHJ1ZQp9LAoidmFsdWUxIjogewoidmVyc2lvbiI6IDIsCiJkZXNpZ24vc3R5bGUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9tb3ZlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9yZXNpemUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL3JvdGF0ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvZmxpcCI6IGZhbHNlLAoiY29udGVudC9yZXBsYWNlIjogZmFsc2UsCiJsaWZlY3ljbGUvZGVzdHJveSI6IGZhbHNlLAoibGlmZWN5Y2xlL2R1cGxpY2F0ZSI6IGZhbHNlLAoiZWRpdG9yL2luc3BlY3QiOiBmYWxzZSwKImVkaXRvci9wcmVzZW50IjogZmFsc2UsCiJlZGl0b3IvbWFuYWdlUGFnZXMiOiBmYWxzZSwKImVkaXRvci9zZWxlY3QiOiBmYWxzZSwKImVkaXRvci96b29tIjogZmFsc2UKfSwKInZhbHVlMiI6IHsKInZlcnNpb24iOiAyLAoiZGVzaWduL3N0eWxlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvbW92ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UvcmVzaXplIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9yb3RhdGUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL2ZsaXAiOiBmYWxzZSwKImNvbnRlbnQvcmVwbGFjZSI6IGZhbHNlLAoibGlmZWN5Y2xlL2Rlc3Ryb3kiOiBmYWxzZSwKImxpZmVjeWNsZS9kdXBsaWNhdGUiOiBmYWxzZSwKImVkaXRvci9pbnNwZWN0IjogZmFsc2UsCiJlZGl0b3IvcHJlc2VudCI6IGZhbHNlLAoiZWRpdG9yL21hbmFnZVBhZ2VzIjogZmFsc2UsCiJlZGl0b3Ivc2VsZWN0IjogZmFsc2UsCiJlZGl0b3Ivem9vbSI6IGZhbHNlCn0sCiJ2YWx1ZTMiOiB7CiJ2ZXJzaW9uIjogMiwKImRlc2lnbi9zdHlsZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2UiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL21vdmUiOiBmYWxzZSwKImRlc2lnbi9hcnJhbmdlL3Jlc2l6ZSI6IGZhbHNlLAoiZGVzaWduL2FycmFuZ2Uvcm90YXRlIjogZmFsc2UsCiJkZXNpZ24vYXJyYW5nZS9mbGlwIjogZmFsc2UsCiJjb250ZW50L3JlcGxhY2UiOiBmYWxzZSwKImxpZmVjeWNsZS9kZXN0cm95IjogZmFsc2UsCiJsaWZlY3ljbGUvZHVwbGljYXRlIjogZmFsc2UsCiJlZGl0b3IvaW5zcGVjdCI6IGZhbHNlLAoiZWRpdG9yL3ByZXNlbnQiOiBmYWxzZSwKImVkaXRvci9tYW5hZ2VQYWdlcyI6IGZhbHNlLAoiZWRpdG9yL3NlbGVjdCI6IGZhbHNlLAoiZWRpdG9yL3pvb20iOiBmYWxzZQp9Cn0KfSwKImhhc19kcm9wX3NoYWRvdyI6IHRydWUsCiJkcm9wX3NoYWRvdyI6IHsKInZlcnNpb24iOiAxLAoiZW5hYmxlZCI6IGZhbHNlLAoiY29sb3IiOiB7CiJ2ZXJzaW9uIjogNCwKImNvbG9yU3BhY2UiOiAwLAoiY29tcG9uZW50cyI6IHsKInZlcnNpb24iOiAxLAoieCI6IDAuMCwKInkiOiAwLjAsCiJ6IjogMC4wLAoidyI6IDAuMjUKfQp9LAoieE9mZnNldCI6IDEuNzY3NzY2OTUyNTE0NjQ4NSwKInlPZmZzZXQiOiAxLjc2Nzc2Njk1MjUxNDY0ODUsCiJ4Qmx1clJhZGl1cyI6IDEuMCwKInlCbHVyUmFkaXVzIjogMS4wLAoiY2xpcCI6IGZhbHNlCn0sCiJoaWRkZW4iOiBmYWxzZSwKImNsaXBwZWQiOiBmYWxzZSwKImRpc2FibGVfc2VsZWN0aW9uIjogZmFsc2UsCiJpc19wbGFjZWhvbGRlciI6IGZhbHNlLAoiaXNfcGxhY2Vob2xkZXJfY29udGVudCI6IGZhbHNlLAoiYmxvY2tfY3JlYXRvcl9yb2xlIjogMCwKImJsb2NrX2NvbW1vbiI6IHsKInZlcnNpb24iOiAxLAoibmFtZSI6ICJzZWNfdGl0bGUiLAoiZXhwb3J0YWJsZSI6IHRydWUsCiJhbHdheXNPblRvcCI6IGZhbHNlCn0sCiJkZXNjcmlwdGlvbiI6IHsKInZlcnNpb24iOiAxLAoidmFsdWUiOiAiIgp9LAoibWV0YWRhdGEiOiBbXSwKImhhc19ibG9ja19wbGF5YmFja190aW1lIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxheWJhY2tfY29udHJvbCI6IGZhbHNlLAoiaGFzX2Jsb2NrX2R1cmF0aW9uIjogZmFsc2UsCiJoYXNfYmxvY2tfdGltZV9vZmZzZXQiOiBmYWxzZSwKImhhc19ibG9ja190cmltIjogZmFsc2UsCiJibG9ja19zb2xvX3BsYXliYWNrIjogZmFsc2UsCiJoYXNfYmxvY2tfcGxhY2Vob2xkZXJfY29udHJvbHMiOiBmYWxzZSwKInZlcnNpb24iOiAxOSwKInRleHQiOiAiV2lsZCBNdXNocm9vbSBhbmQgVHJ1ZmZsZSBSaXNvdHRvIiwKImZvbnRGaWxlVXJpIjogIi9leHRlbnNpb25zL2x5LmltZy5jZXNkay5mb250cy9mb250cy9BcmNoaXZvL3N0YXRpYy9BcmNoaXZvL0FyY2hpdm8tQm9sZC50dGYiLAoiZXh0ZXJuYWxSZWZlcmVuY2UiOiAiLy9seS5pbWcuY2VzZGsuZm9udHMvYXJjaGl2b19ib2xkIiwKIm9wYWNpdHkiOiAxLjAsCiJmb250U2l6ZSI6IDM0LjMyOTUyNDk5Mzg5NjQ4NywKImNvbG9yIjogewoidmVyc2lvbiI6IDQsCiJjb2xvclNwYWNlIjogMCwKImNvbXBvbmVudHMiOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiAwLjAsCiJ5IjogMC4wLAoieiI6IDAuMCwKInciOiAxLjAKfQp9LAoiY29sb3JFbmFibGVkIjogdHJ1ZSwKImJhY2tncm91bmRDb2xvciI6IHsKInZlcnNpb24iOiA0LAoiY29sb3JTcGFjZSI6IDAsCiJjb21wb25lbnRzIjogewoidmVyc2lvbiI6IDEsCiJ4IjogMC42NjY3MDAwMDU1MzEzMTEsCiJ5IjogMC42NjY3MDAwMDU1MzEzMTEsCiJ6IjogMC42NjY3MDAwMDU1MzEzMTEsCiJ3IjogMS4wCn0KfSwKImJhY2tncm91bmRDb2xvckVuYWJsZWQiOiBmYWxzZSwKImFsaWdubWVudCI6IDAsCiJ2ZXJ0aWNhbEFsaWdubWVudCI6IDAsCiJsaW5lSGVpZ2h0IjogMS4wLAoibGV0dGVyU3BhY2luZyI6IDAuMCwKInBhcmFncmFwaFNwYWNpbmciOiAwLjAsCiJ0ZXh0UnVucyI6IFtdLAoiaGlkZUxpbmVzT3V0c2lkZU9mRnJhbWUiOiB0cnVlLAoiY2xpcExpbmVzT3V0c2lkZU9mRnJhbWUiOiB0cnVlLAoiYXV0b21hdGljRm9udFNpemVFbmFibGVkIjogZmFsc2UsCiJtaW5BdXRvbWF0aWNGb250U2l6ZSI6IC0xLjAsCiJtYXhBdXRvbWF0aWNGb250U2l6ZSI6IC0xLjAsCiJoYXNMYXlvdXRSZWZlcmVuY2VGcmFtZSI6IHRydWUsCiJsYXlvdXRSZWZlcmVuY2VPcmlnaW4iOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiAwLjE1MjkxMzI3MjM4MDgyODg3LAoieSI6IDAuMjQ2ODE4MzkzNDY4ODU2OCwKInoiOiAwLjAKfSwKImxheW91dFJlZmVyZW5jZURpbWVuc2lvbnMiOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiA4LjA5MDIxNDcyOTMwOTA4MiwKInkiOiAwLjUxODc1NzI4MzY4NzU5MTYsCiJ6IjogMC4wCn0sCiJzdHJva2UiOiB7CiJ2ZXJzaW9uIjogMSwKImNvbG9yIjogewoidmVyc2lvbiI6IDQsCiJjb2xvclNwYWNlIjogMCwKImNvbXBvbmVudHMiOiB7CiJ2ZXJzaW9uIjogMSwKIngiOiAwLjY3MDAwMDAxNjY4OTMwMDUsCiJ5IjogMC42NzAwMDAwMTY2ODkzMDA1LAoieiI6IDAuNjcwMDAwMDE2Njg5MzAwNSwKInciOiAxLjAKfQp9LAoid2lkdGgiOiAwLjAxODM5MDk1OTEyODczNzQ1LAoic3R5bGUiOiA1LAoicG9zaXRpb24iOiAwLAoiY29ybmVyR2VvbWV0cnkiOiAxLAoiZW5hYmxlZCI6IGZhbHNlCn0KfQpdLAoiaGllcmFyY2hpZXMiOiBbCnsKInJvb3QiOiAxNjc3NzIyNywKImNoaWxkcmVuIjogW10KfQpdLAoicGFyZW50cyI6IFsKNApdCn0KfQ==",
  };
  const InsertDishInCanvas = async (dish: any) => {
    try {
      const firstPage = await getCurrentSelectedPage(cesdkInstance?.current);
      console.log(cesdkInstance?.current.engine.block.findAll())
      const block = await cesdkInstance?.current.engine.block.loadFromString(
        design?.value
      );
      const childrenList =
        await cesdkInstance?.current.engine.block.getChildren(block[0]);
      childrenList.forEach((element: any) => {
        const getName = cesdkInstance?.current.engine.block.getName(element);
        if (getName === "title") {
          cesdkInstance?.current.engine.block.replaceText(element, dish?.title);
        } else if (getName === "price") {
          cesdkInstance?.current.engine.block.replaceText(element, dish?.price);
        } else {
          cesdkInstance?.current.engine.block.replaceText(
            element,
            dish?.description
          );
        }
      });
      cesdkInstance?.current.engine.block.setName(
        block[0],
        `dish_${dish?.id?.toString()}`
      );
      await cesdkInstance?.current.engine.block.appendChild(
        firstPage,
        block[0]
      );
      setinput(input + 1);
      return block[0];
    } catch (error) {
      console.log("error", error);
    }
  };
  const addDishSideSection = () => {
    var elementWithShadowRoot = document.querySelector(
      "#cesdkContainer #root-shadow"
    );
    var shadowRoot = elementWithShadowRoot?.shadowRoot;
    const leftPanel =
      "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY";

    var listChildren = shadowRoot?.querySelector(`${leftPanel}`)?.children[0]
      ?.children[1] as any;
    const textContent = listChildren?.lastElementChild?.textContent?.trim();
    if (textContent !== "Dishes") {
      var newElement = document.createElement("div");
      newElement.innerHTML = `
        <button type="button" name="librarydock-Custom component" class="UBQ_Button__block--C5ITk UBQ_Button__ubq-variant_Plain--tlabL UBQ_Dock__button--sx24I" aria-pressed="false" data-cy="librarydock-Custom component" data-loading="false" data-active="false"><span><div class="UBQ_Dock__buttonLabel--hClD8"><div class="UBQ_AssetLibraryDockIcon__customIconWrapper--NCFjB UBQ_AssetLibraryDockIcon__customIconWrapperLarge--Elsb0" style="background-image: url('https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/templates/menu.svg?t=2023-09-26T15%3A00%3A28.187Z'); background-size: contain;"></div><span>Menu Placeholder</span></div></span></button>
      `;
      newElement.addEventListener("click", (e) => {
        e.stopPropagation();
        // if (!isDrawerOpen) {
        //   setclickSection(Math.random());
        //   setIsDrawerOpen(true);
        // }
        InsertDishInCanvas({ title: "dish", price: "$34", description: "this is a dish description" })
        // alert("section component was added!")
      });

      // Append newElement to the end of listChildren
      listChildren?.appendChild(newElement);
    }
  };
  useEffect(() => {
    addDishSideSection();
  }, [cesdkInstance?.current]);


  function translateToAssetResult(image: any) {
    return {
      id: image.id.toString(),
      meta: {
        uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
        thumbUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
        width: image?.width,
        height: image?.height,
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
  const selectedIds = cesdkInstance?.current?.engine?.block?.findAllSelected();

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
      throw error;
    } finally {
      setloading(false);
    }
  };

  const saveToLibrary = async () => {
    try {
      setlibraryLoading(true);
      if (template) {
        const selectedIds =
          cesdkInstance?.current.engine?.block?.findAllSelected();
        const isGroupable =
          cesdkInstance?.current.engine.block.isGroupable(selectedIds) &&
          selectedIds?.lenght > 1;

        const group = isGroupable
          ? cesdkInstance?.current?.engine.block.group(selectedIds)
          : false;
        const saveAbleId = isGroupable ? [group] : selectedIds;
        const savedBlocks =
          await cesdkInstance?.current.engine.block.saveToString(saveAbleId);
        const mimeType = "image/png";
        const options = { pngCompressionLevel: 0 };
        const blob = await cesdkInstance?.current.engine.block.export(
          saveAbleId[0],
          mimeType,
          options
        );
        const response = await dbClient.storage
          .from("elementsThumbnail")
          .upload(uuidv4(), blob);
        if (!response?.data?.path) {
          return;
        }
        console.log("template", template);
        const { error, data } = await supabase
          .from("ElementLibrary")
          .insert({
            element: savedBlocks,
            template_id: template?.id,
            createdBy: user?.id,
            thumbnail: response?.data?.path,
            restaurant_id: user?.restaurant_id,
            location: template?.location,
          })
          .select()
          .single();
        const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL
          }/storage/v1/object/public/elementsThumbnail/${response?.data?.path
          }?${Date.now()}`;
        const newItem = {
          id: data?.id?.toString(),
          createdBy: user?.id || null,
          meta: {
            uri: "https://img.ly/static/ubq_samples/imgly_logo.jpg",
            blockType: "//ly.img.ubq/text",
            thumbUri: imagePath,
            width: 100,
            height: 10,
            value: savedBlocks,
            name: "dddddwestg",
          },
          context: {
            sourceId: "Elements",
          },
        };
        const newList = [newItem, ...libraryElements];
        setlibraryElements(newList);

        await cesdkInstance?.current.engine.asset.removeSource("Elements");
        const customSource = {
          id: "Elements",
          previewBackgroundType: "contain",
          gridBackgroundType: "contain",

          async findAssets(queryData: any) {
            return Promise.resolve({
              assets: newList,
              total: newList.length,
              currentPage: queryData.page,
              nextPage: undefined,
            });
          },
          async applyAsset(assetResult: any) {
            try {
              const firstPage = await getCurrentSelectedPage(
                cesdkInstance?.current
              );
              const block =
                await cesdkInstance?.current.engine.block.loadFromString(
                  assetResult?.meta?.value
                );
              cesdkInstance?.current.engine.block.setName(block[0], "ddddd");
              await cesdkInstance?.current.engine.block.appendChild(
                firstPage,
                block[0]
              );
              await cesdkInstance?.current.engine.block.setSelected(
                block[0],
                true
              );
              await cesdkInstance?.current.engine.block.select(block[0]);
              const isSourceExist = cesdkInstance?.current.engine.asset
                .findAllSources()
                ?.includes(customComponent?.recent);
              if (isSourceExist) {
                const findList =
                  await cesdkInstance?.current.engine.asset.findAssets(
                    customComponent?.recent
                  );
                const isAlreadyExist = findList?.assets?.find(
                  (i: any) => i?.id === assetResult?.id
                );
                if (!isAlreadyExist) {
                  const newList = [assetResult, ...findList?.assets];
                  await cesdkInstance?.current.engine.asset.removeSource(
                    customComponent?.recent
                  );
                  await cesdkInstance?.current.engine.asset.addSource(
                    getConfigOfRecentComponent(newList, customComponent?.recent)
                  );
                }
              } else {
                await cesdkInstance?.current.engine.asset.addSource(
                  getConfigOfRecentComponent(
                    [assetResult],
                    customComponent?.recent
                  )
                );
              }
            } catch (error) {
              throw error;
            }
          },
          async applyAssetToBlock(assetResult: any, block: any) {
            cesdkInstance?.current.engine.asset.defaultApplyAssetToBlock(
              assetResult,
              block
            );
          },
        };
        await cesdkInstance?.current.engine.asset.addSource(customSource);
        var elementWithShadowRoot = document.querySelector(
          "#cesdkContainer #root-shadow "
        );
        var shadowRoot = elementWithShadowRoot?.shadowRoot;
        const sideBarPanel =
          "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY div";
        var sideBarPanelLibrary = shadowRoot?.querySelector(`${sideBarPanel}`)
          ?.children[1]?.children[3] as HTMLElement;
        sideBarPanelLibrary?.click();
      } else {
        const value = await cesdkInstance?.current.save();
        if (user) {
          saveTemplate(value);
        } else {
          openAuthDialog();
        }
      }
      toast.success("Component has been saved!");
    } catch (error) {
      console.log("error", error);
    } finally {
      setlibraryLoading(false);
    }
  };

  const saveMenuToLibrary = async () => {
    // input is a page id, output is a group id of all the components within the page
    async function groupComponents(page: string) {
      const childrenOfPage = cesdkInstance?.current.engine?.block?.getChildren(page)
      if (cesdkInstance?.current.engine?.block?.isGroupable(childrenOfPage)) {
        const group = cesdkInstance?.current?.engine.block.group(childrenOfPage);
        const savedBlock = await cesdkInstance?.current.engine.block.saveToString([group]);
        console.log(savedBlock)
        return (savedBlock)
      }

    }
    try {
      const pageBlocks = cesdkInstance?.current?.engine.scene.getPages()
      const pageGroups = Promise.all(pageBlocks.map(async (page: string) => await groupComponents(page)))
      setPreviewContent(await pageGroups)
      const value = await cesdkInstance?.current.save();
      if (user) {
        saveTemplate(value);
      } else {
        openAuthDialog();
      }
      toast.success("Component has been saved! test");
    } catch (error) {
      console.log("error", error);
    } finally {
      setlibraryLoading(false);
    }
  };
  const injectMenuIntoCanvas = async () => {
    try {
      const menuPlaceholders = await cesdkInstance?.current?.engine?.block.findByName("menu_placeholder")
      // console.log("menu placeholders, ", menuPlaceholders)
      const pages = cesdkInstance?.current.engine.block.getChildren(3);
      for (let i = 0; i < pages.length; i++) {
        const pageChildren = cesdkInstance?.current.engine.block.getChildren(pages[i]);
        const placeholdersOnPage = pageChildren.filter((item: number) => menuPlaceholders.includes(item))
        for (let n = 0; n < placeholdersOnPage.length; n++) {
          const block = await cesdkInstance?.current.engine.block.loadFromString(layout?.content[i]);
          cesdkInstance?.current.engine.block.appendChild(placeholdersOnPage[n], block[0])
          cesdkInstance?.current.engine.block.setPositionX(block[0], 0.05)
          cesdkInstance?.current.engine.block.setPositionY(block[0], 0)
          cesdkInstance?.current.engine.block.setFillEnabled(placeholdersOnPage[n], false)
          cesdkInstance?.current.engine.block.setStrokeEnabled(placeholdersOnPage[n], false)
        }
      }
      // debugger
    } catch (error) {
      setMenuInjected(false)
      console.log("error", error);
    }
  };
  const changeCustomComponentTitle = () => {
    var elementWithShadowRoot = document.querySelector(
      "#cesdkContainer #root-shadow "
    );
    var shadowRoot = elementWithShadowRoot?.shadowRoot;
    const leftPanel =
      "div .UBQ_Theme__block--nxqW8 div .UBQ_Editor__body--C8OfY #ubq-portal-container_panelLeft div .UBQ_AssetLibraryDock__panelContent--ED9NO .UBQ_AssetLibraryContent__block--mQiYI div div ";

    var listChildren = shadowRoot?.querySelector(`${leftPanel}`);
    const opendBlokElement = listChildren?.children[2] as HTMLElement;
    // console.log('targetElement',);
    const newName = opendBlokElement?.textContent?.split("/")[1];
    // console.log("aaa", opendBlokElement?.className);

    if (
      opendBlokElement &&
      opendBlokElement.textContent &&
      opendBlokElement?.className
    ) {
      opendBlokElement.textContent =
        opendBlokElement?.className ===
          "UBQ_AssetLibraryBreadcrumb__label--PA5RI" && newName
          ? newName
          : opendBlokElement.textContent;
    }

    var opendElement = shadowRoot?.querySelector(`${leftPanel}`) as HTMLElement;
    const childText = opendElement?.children as HTMLCollection;
    for (let index = 0; index < childText?.length; index++) {
      const element = childText[index];
      const target = element?.children[0]?.children[0]?.children[0];

      if (target?.textContent === "Elements/Elements") {
        target.textContent = "Current Menu Components";
      } else {
        if (target?.textContent) {
          target.textContent =
            target?.textContent?.split("/")[1] ?? target?.textContent;
        }
      }
    }
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      changeCustomComponentTitle();
    }, 100);

    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      changeCustomComponentTitle();
    }, 100);
    setMenuInjected(false)
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (!menuInjected) {
      injectMenuIntoCanvas();
      setMenuInjected(true)
    }
  }, [cesdkInstance?.current]);
  return (
    <div onClick={() => setinput(input + 1)}>
      <AuthDialog opened={authDialog} onClose={closeAuthDialog} />
      {loadinEditor && (
        <Box
          style={{
            backgroundColor: "#D6DBE1",
            height: "calc(100vh - 70px)",
            position: "absolute",
            zIndex: 1000,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Flex align={"center"} gap={21}>
            <Box>
              <TailSpin
                height="50"
                width="50"
                color="black"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
            </Box>
            <Box>
              <Text fz={"lg"} color="black" style={{ fontWeight: "bold" }}>
                Loading Editor
              </Text>
              <Text color="black">Just a few seconds</Text>
            </Box>
          </Flex>
        </Box>
      )}

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
        previewContent={previewContent}
        restaurantsOptions={restaurantsOptions}
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
