import { useEffect, useRef, useState } from "react";
import CreativeEditorSDK from "@cesdk/cesdk-js";
import { useUser } from "../../hooks/useUser";

const Editor = ({ openAuthDialog }: { openAuthDialog: () => void }) => {
  const cesdkContainer = useRef<HTMLDivElement>(null);
  const user = useUser();
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
        onExport: (blobs: any) => {
          if (user && user.subscriptionActive) {
            downloadBlobFile(blobs?.[0], `flapjack.png`);
          } else {
            openAuthDialog();
          }
          return Promise.resolve();
        },
        onUpload: undefined,
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
        (instance: any) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources();
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
