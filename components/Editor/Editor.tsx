import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import {
  fetchAssets,
  fetchFonts,
  fetchResturants,
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
  preview,
  elementsList,
  sectionedList,
  globalTemplates,
}: {
  template: ITemplateDetails | null;
  preview?: boolean;
  elementsList?: any;
  sectionedList?: any;
  globalTemplates?: any;
}) => {
  const cesdkContainer = useRef<any>(null);
  const cesdkInstance = useRef<any>(null);
  let cesdk: { dispose: () => void };
  const supabase = useSupabaseClient();
  const [templateModal, settemplateModal] = useState<boolean>(false);
  const [content, setcontent] = useState<string>("");
  const [userData, setUserData] = useState<any>(getUser());
  const user = useUser();
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
  const [libraryElements, setlibraryElements] = useState(elementsList);
  const [usedComponenets, setusedComponenets] = useState<any>([]);
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
          console.log("assetResult", assetResult);

          const image = cesdkInstance?.current?.engine.block.create("image");
          cesdkInstance?.current?.engine.block.setString(
            image,
            "image/imageFileURI",
            assetResult.meta.uri
          );
          cesdkInstance?.current?.engine.block.setWidth(
            image,
            assetResult.meta.width
          );
          cesdkInstance?.current?.engine.block.setHeight(
            image,
            assetResult.meta.height
          );
          const firstPage =
            cesdkInstance?.current?.engine.block.findByType("page")[0];
          cesdkInstance?.current?.engine.block.appendChild(firstPage, image);
          cesdkInstance?.current?.engine.scene.zoomToBlock(
            firstPage,
            0,
            0,
            0,
            0
          );
          cesdkInstance?.current?.engine.editor.addUndoStep();
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
    return recentcustomSource;
  }
  const setup = async () => {
    const templateFonts = await fetchFonts();
    setFonts(templateFonts);
    const config: object = {
      logger: () => {},
      role: "Creator",
      theme: "light",
      license: process.env.REACT_APP_LICENSE,
      ...(template?.content && {
        initialSceneURL:
          process.env.NEXT_PUBLIC_SUPABASE_URL +
          `/storage/v1/object/public/templates/${
            template?.content
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
                show: preview ? false : true,
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
                      ...globalTemplates?.map(
                        (item: any) => item?.resturantDetail?.name
                      ),
                    ],
                  },
                  // Shapes
                  defaultEntries[4],
                  {
                    id: "Elements",
                    sourceIds: [
                      customComponent?.recent,
                      "Elements",
                      ...sectionedList?.map(
                        (item: any) => item?.resturantDetail?.name
                      )
                    ],
                    previewLength: 2,
                    gridColumns: 2,
                    previewBackgroundType: "contain",
                    gridBackgroundType: "contain",
                    icon: ({ theme, iconSize }: any) => {
                      return "https://wmdpmyvxnuwqtdivtjij.supabase.co/storage/v1/object/public/elementsThumbnail/icon.svg";
                    }
                  }
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
                  width: 5,
                  height: 5,
                },
              }
            );
          } catch (error) {
            throw error;
          }
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
      CreativeEditorSDK.init(cesdkContainer.current, config).then(
        async (instance: any) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources();
          cesdk = instance;
          cesdkInstance.current = instance;
          const firstPage = instance.engine.block.findByType("page")[0];
          sectionedList?.forEach(async (element: any) => {
            if (element?.items?.length > 0 && element?.resturantDetail?.name) {
              await instance?.engine?.asset?.addSource(
                getConfigOfRecentComponent(
                  element?.items,
                  element?.resturantDetail?.name
                )
              );
            }
          });
          globalTemplates?.forEach(async (element: any) => {
            if (element?.items?.length > 0 && element?.resturantDetail?.name) {
              await instance?.engine?.asset?.addSource(
                getConfigOfImageComponent(
                  element?.items.map(translateToAssetResult),
                  element?.resturantDetail?.name
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
                assets: libraryElements,
                total: libraryElements.length,
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
                    <span>${
                      libraryLoading ? "Loading..." : "Save to Library"
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
  function translateToAssetResult(image: any) {
    return {
      id: image.id.toString(),
      meta: {
        uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
        thumbUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templateImages/${image?.content}`,
        width: 3,
        height: 3,
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
        console.log('template',template)
        const { error, data } = await supabase
          .from("ElementLibrary")
          .insert({
            element: savedBlocks,
            template_id: template?.id,
            createdBy: user?.id,
            thumbnail: response?.data?.path,
            restaurant_id: user?.restaurant_id,
            location:template?.location
          })
          .select()
          .single();
        const imagePath = `${
          process.env.NEXT_PUBLIC_SUPABASE_URL
        }/storage/v1/object/public/elementsThumbnail/${
          response?.data?.path
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
