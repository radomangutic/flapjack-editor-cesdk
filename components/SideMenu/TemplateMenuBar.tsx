import { useState, useEffect } from "react";
import { Flex, Stack, Text } from "@mantine/core";
import { IFont, IPalette } from "../../interfaces";
import StyleSelector from "./StyleSelector";
import grapesjs from "grapesjs";
import DishSelector from "./DishSelector";
import SectionSelector from "./SectionSelector";
import ImageSelector from "./ImageSelector";
import { Button } from "@mantine/core";
import { IconDownload, IconZoomIn, IconZoomOut } from "@tabler/icons";
import AdditionalSelector from "./AdditionalSelector";
import icon from "../../public/download.svg";
import Image from "next/image";
import { IPadding } from "../../interfaces/IPadding";
import { useSession } from "@supabase/auth-helpers-react";
import { useDialog, useUser } from "../../hooks";
import AuthDialog from "../AuthDialog";
import { useUpsell } from "../../hooks";

const MAX_ZOOM = 200
const MIN_ZOOM = 60

interface ITemplateMenuBarProps {
  selectedPalette: IPalette | null;
  setSelectedPalette: (palette: IPalette) => void;
  selectedFont: IFont | null;
  setSelectedFont: (font: IFont) => void;
  setSelectedColumnsPadding: (selectedPadding: number) => void;
  selectedColumnsPadding: number;
  setSelectedHorizontalPadding: (selectedHorizontalPadding: number) => void;
  selectedHorizontalPadding: number;
  setSelectedVerticalPadding: (selectedHorizontalPadding: number) => void;
  selectedVerticalPadding: number;
  onTemplateDownload?: () => void;
  editor: grapesjs.Editor;
  assetsTemplate:string[],
}

const TemplateMenuBar = ({
  selectedFont,
  setSelectedFont,
  selectedPalette,
  setSelectedColumnsPadding,
  selectedColumnsPadding,
  selectedHorizontalPadding,
  setSelectedHorizontalPadding,
  selectedVerticalPadding,
  setSelectedVerticalPadding,
  setSelectedPalette,
  onTemplateDownload,
  editor,
  assetsTemplate,
}: ITemplateMenuBarProps) => {
  const [zoomSize, setZoomSize] = useState<number>(70);
  const canvasZoomOut = () => {
    if (zoomSize > MIN_ZOOM) {
      setZoomSize(prevState => prevState - 5)
    }
  }
  const canvasZoomIn = () => {
    if (zoomSize < MAX_ZOOM) {
      setZoomSize((prevState) => prevState + 5);
    }
  };
  const [authDialog, openAuthDialog, closeAuthDialog] = useDialog(false);
  const session = useSession();
  const user = useUser();
  const { triggerUpsellOr } = useUpsell(user?.subscriptionActive, user?.id)
  useEffect(() => {
    editor.Canvas.setZoom(zoomSize);

    // Resize the canvas to match the content size
    const canvas = document.querySelector<HTMLElement>('.gjs-cv-canvas');
    const frameWrapper = document.querySelector<HTMLElement>(".gjs-frame-wrapper");
    if (canvas && frameWrapper) {
        const zoomSizePercent = zoomSize / 100;
        const [contentWidth, contentHeight] = [frameWrapper.clientWidth, frameWrapper.clientHeight]
        canvas.style.width = `${zoomSizePercent * contentWidth}px`;
        canvas.style.height = `${zoomSizePercent * contentHeight}px`;
        canvas.style.overflow = "visible";
    }
  }, [zoomSize, editor.Canvas]);

  return (
    <Stack
      align="center"
      justify="space-between"
      sx={(theme) => ({
        backgroundColor: "white",
        height: 320,
        width: 56,
        position: "fixed",
        left: "4%",
        top: "24%",
        zIndex: 2,
        borderRadius: 2,
      })}
      py="md"
    >
      <StyleSelector
        selectedFont={selectedFont}
        setSelectedFont={setSelectedFont}
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
        selectedColumnsPadding={selectedColumnsPadding}
        setSelectedColumnsPadding={setSelectedColumnsPadding}
        selectedHorizontalPadding={selectedHorizontalPadding}
        setSelectedHorizontalPadding={setSelectedHorizontalPadding}
        selectedVerticalPadding={selectedVerticalPadding}
        setSelectedVerticalPadding={setSelectedVerticalPadding}
        editor={editor}
        assetsTemplate={assetsTemplate}
      />
      <DishSelector editor={editor} />
      <SectionSelector editor={editor} />
      <ImageSelector editor={editor} />
      <AdditionalSelector editor={editor} />
      <Button
        color="orange"
        onClick={session ?
          triggerUpsellOr(onTemplateDownload) :
          openAuthDialog}
        styles={(theme) => ({
          root: {
            borderRadius: 2,
            height: 70,
            width: 56,
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "1rem",
            padding: 0,
            paddingTop: "10px",
          },
        })}
      >
        <Flex direction="column">
          <Image src={icon} alt="download" />
          <Text size={8} my="4px" weight={700}>
            Download
          </Text>
        </Flex>
      </Button>
      <Stack
        sx={{
          position: "fixed",
          zIndex: 2,
          left: 20,
          bottom: 20,
          flexDirection: "row",
          backgroundColor: "#fff",
          padding: "5px",
        }}
        spacing="xs"
        align="center"
      >
        <IconZoomIn
          size={25}
          style={{ cursor: "pointer" }}
          onClick={() => canvasZoomIn()}
          stroke="1px"
        />
        <small>{zoomSize}%</small>
        <IconZoomOut
          size={25}
          style={{ cursor: "pointer" }}
          onClick={() => canvasZoomOut()}
          stroke="1px"
        />
      </Stack>

      <AuthDialog opened={authDialog} onClose={closeAuthDialog} />
    </Stack>
  );
};

export default TemplateMenuBar;
