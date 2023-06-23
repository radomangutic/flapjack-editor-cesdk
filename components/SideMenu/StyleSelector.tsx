import { useState, useEffect, useCallback } from "react";
import {
  ActionIcon,
  Button,
  Grid,
  Group,
  Indicator,
  Popover,
  Stack,
  Text,
  HoverCard,
  Slider,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconCheck, IconPalette, IconPencil, IconPlus } from "@tabler/icons";
import { IFont, IPalette } from "../../interfaces";
import { useDialog, useUpsell, useUser } from "../../hooks";
import UpsertPaletteDialog from "./UpsertPaletteDialog";
import UpsertFontDialog from "./UpsertFontDialog";
import theme from "../../config/theme";
import Image from "next/image";
import icon from "../../public/style-selector.svg";
import grapesjs from "grapesjs";
import { userCanEditFontAndColor } from "../../helpers/userCanEditFontAndColor";

interface IStyleSelectorProps {
  selectedPalette: IPalette | null;
  setSelectedPalette: (palette: IPalette) => void;
  selectedFont: IFont | null;
  setSelectedFont: (font: IFont) => void;
  setSelectedColumnsPadding: (padding: number) => void;
  selectedColumnsPadding: number;
  setSelectedHorizontalPadding: (padding: number) => void;
  selectedHorizontalPadding: number;
  setSelectedVerticalPadding: (padding: number) => void;
  selectedVerticalPadding: number;
  editor: grapesjs.Editor;
  assetsTemplate: string[];
}

const StyleSelector = ({
  selectedFont,
  setSelectedFont,
  selectedPalette,
  setSelectedPalette,
  selectedColumnsPadding,
  setSelectedColumnsPadding,
  selectedHorizontalPadding,
  setSelectedHorizontalPadding,
  selectedVerticalPadding,
  setSelectedVerticalPadding,
  editor,
  assetsTemplate,
}: IStyleSelectorProps) => {
  const [palettes, setPalettes] = useState<IPalette[]>([]);
  const [addPalette, openAddPalette, closeAddPalette] = useDialog(false);
  const [editPalette, setEditPalette] = useState<IPalette | null>(null);
  const [fonts, setFonts] = useState<IFont[]>([]);
  const [addFont, openAddFont, closeAddFont] = useDialog(false);
  const [editFont, setEditFont] = useState<IFont | null>(null);
  const supabase = useSupabaseClient();
  const user = useUser();
  const { triggerUpsellOr } = useUpsell(Boolean(userCanEditFontAndColor(user)), user?.id)

  const fetchPalettes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("palettes")
        .select(
          "id, name, primaryColor, secondaryColor, tertiaryColor, textColor, backgroundColor, menuColor"
        )
        .order("paletteOrder", { ascending: true });
      if (error) throw error;
      setPalettes(data);
    } catch (err) {
      console.error(err);
    }
  }, [supabase]);
  const fetchFonts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("fonts")
        .select(
          "id, name, titleFont, headerFont, bodyFont, headerFontSize, titleFontSize, bodyFontSize, menuFont, menuFontSize"
        )
        .order("fontOrder", { ascending: true });
      if (error) throw error;
      setFonts(data);
    } catch (err) {
      console.error(err);
    }
  }, [supabase]);

  useEffect(() => {
    const uploadFont: IFont | undefined = fonts.find(
      (font) => font.name === selectedFont?.name
    );
    if (uploadFont) {
      setSelectedFont(uploadFont);
    }
  }, [fonts]);

  useEffect(() => {
    const uploadPalette: IPalette | undefined = palettes.find(
      (palette) => palette.name === selectedPalette?.name
    );
    if (uploadPalette) {
      setSelectedPalette(uploadPalette);
    }
  }, [palettes]);

  useEffect(() => {
    fetchPalettes();
    fetchFonts();
  }, [fetchFonts, fetchPalettes]);

  const handleEditPalette = (palette: IPalette) => {
    setEditPalette(palette);
    openAddPalette();
  };

  const handleEditFont = (font: IFont) => {
    setEditFont(font);
    openAddFont();
  };
  if (selectedFont?.bodyFontSize) {
    editor.getWrapper().setStyle({
      ...editor.getWrapper().getStyle(),
      "font-size": `${selectedFont?.bodyFontSize}px`,
    });
  }
  useEffect(() => {
    if (assetsTemplate && assetsTemplate.length > 0 && palettes.length > 0) {
      const findPalette = palettes.find(
        (palette) => palette.name === assetsTemplate[1]
      ) as IPalette;
      setSelectedPalette(findPalette);
    }
    if (assetsTemplate && assetsTemplate.length > 0 && fonts.length > 0) {
      const findfont = fonts.find(
        (font) => font.name === assetsTemplate[2]
      ) as IFont;
      setSelectedFont(findfont);
    }
  }, [assetsTemplate]);

  return (
    <>
      {!editPalette && (
        <UpsertPaletteDialog
          opened={addPalette}
          onClose={closeAddPalette}
          fetchPalettes={fetchPalettes}
        />
      )}
      {editPalette && (
        <UpsertPaletteDialog
          opened={addPalette}
          onClose={() => {
            closeAddPalette();
            setEditPalette(null);
          }}
          palette={editPalette}
          fetchPalettes={fetchPalettes}
        />
      )}
      {!editFont && (
        <UpsertFontDialog
          opened={addFont}
          onClose={closeAddFont}
          fetchFonts={fetchFonts}
        />
      )}
      {editFont && (
        <UpsertFontDialog
          opened={addFont}
          onClose={() => {
            closeAddFont();
            setEditFont(null);
          }}
          font={editFont}
          fetchFonts={fetchFonts}
        />
      )}
      <Popover
        width={338}
        position="right-start"
        withArrow
        shadow="md"
        offset={20}
        styles={(theme) => ({
          dropdown: {
            borderColor: theme.colors.dark,
          },
          arrow: {
            borderColor: theme.colors.dark,
          },
        })}
      >
        <Popover.Target>
          <div>
            <HoverCard shadow="md" position="right">
              <HoverCard.Target>
                <ActionIcon
                  variant="subtle"
                  color={theme.colors.blue[6]}
                  sx={{
                    width: 48,
                    height: 48,
                  }}
                  className="menu-bar-button"
                >
                  <Image src={icon} alt="palette" />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown
                bg={theme.colors.dark[4]}
                c="#fff"
                sx={{ border: "none" }}
              >
                <Text size="sm">Style Selector</Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </div>
        </Popover.Target>
        <Popover.Dropdown
          p="lg"
          sx={(theme) => ({
            backgroundColor: theme.colors.dark,
          })}
        >
          <Text size="md" fw={700} color="white">
            Style Selector
          </Text>
          <Text size="md" fw={700} color="white" mt="xl">
            Palettes
          </Text>
          <Group mt="md" p="md" sx={{ overflowX: "auto" }} noWrap>
            {palettes.map((palette) => (
              <Indicator
                key={palette.name}
                label={<IconPencil size={16} />}
                size={28}
                offset={4}
                color="dark"
                className="cursor-pointer"
                onClick={() => handleEditPalette(palette)}
                disabled={!userCanEditFontAndColor(user)}
              >
                <Indicator
                  label={<IconCheck size={16} />}
                  size={28}
                  offset={8}
                  className="cursor-pointer"
                  position="top-start"
                  disabled={palette.name !== selectedPalette?.name}
                >
                  <Grid
                    w={62}
                    h={62}
                    gutter={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPalette(palette);
                    }}
                  >
                    <Grid.Col span={4} bg={palette.primaryColor} />
                    <Grid.Col span={4} bg={palette.secondaryColor} />
                    <Grid.Col span={4} bg={palette.tertiaryColor} />
                  </Grid>
                </Indicator>
              </Indicator>
            ))}
            {user && (
              <ActionIcon
                variant="outline"
                color="gray"
                w={62}
                miw={62}
                h={62}
                onClick={triggerUpsellOr(
                  openAddPalette,
                )}
              >
                <IconPlus size={36} color="white" />
              </ActionIcon>
            )}
          </Group>
          {user?.role === "flapjack" && (
            <>
              <Text size="md" fw={700} color="white" mt="xl" mb="xl">
                Horizontal Padding
              </Text>
              <Slider
                value={selectedHorizontalPadding}
                onChange={(value) => setSelectedHorizontalPadding(value)}
                marks={[
                  { value: 20, label: "20px" },
                  { value: 50, label: "50px" },
                  { value: 80, label: "80px" },
                ]}
              />
            </>
          )}
          {user?.role === "flapjack" && (
            <>
              <Text size="md" fw={700} color="white" mt="xl" mb="xl">
                Vertical Padding
              </Text>
              <Slider
                value={selectedVerticalPadding}
                onChange={(value) => setSelectedVerticalPadding(value)}
                marks={[
                  { value: 20, label: "20px" },
                  { value: 50, label: "50px" },
                  { value: 80, label: "80px" },
                ]}
              />
            </>
          )}
          {user?.role === "flapjack" && (
            <>
              <Text size="md" fw={700} color="white" mt="xl" mb="xl">
                Column Padding
              </Text>
              <Slider
                value={selectedColumnsPadding}
                onChange={(value) => setSelectedColumnsPadding(value)}
                marks={[
                  { value: 20, label: "20px" },
                  { value: 50, label: "50px" },
                  { value: 80, label: "80px" },
                ]}
              />
            </>
          )}
          <Text size="md" fw={700} color="white" mt="xl">
            Fonts
          </Text>
          <Stack mt="md" p="md" mah={320} sx={{ overflowY: "auto" }}>
            {fonts.map((font) => (
              <Indicator
                key={font.name}
                label={<IconPencil size={16} />}
                size={28}
                offset={4}
                color="dark"
                className="cursor-pointer"
                onClick={() => handleEditFont(font)}
                disabled={!userCanEditFontAndColor(user)}
              >
                <Indicator
                  label={<IconCheck size={16} />}
                  size={28}
                  offset={8}
                  className="cursor-pointer"
                  position="top-start"
                  disabled={font.name !== selectedFont?.name}
                >
                  <Button
                    variant="outline"
                    color="gray"
                    fullWidth
                    onClick={(event: any) => {
                      event.stopPropagation();
                      setSelectedFont(font);
                    }}
                  >
                    {font.name}
                  </Button>
                </Indicator>
              </Indicator>
            ))}
            {user && (
              <Button
                variant="outline"
                color="gray"
                onClick={triggerUpsellOr(
                  openAddFont,
                )}
              >
                <IconPlus size={36} color="white" />
              </Button>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

export default StyleSelector;
