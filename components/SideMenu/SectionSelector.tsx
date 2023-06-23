import { ActionIcon, Popover, Text, HoverCard } from "@mantine/core";
import grapesjs from "grapesjs";
import theme from "../../config/theme";
import icon from "../../public/section-selector.svg";
import NextImage from "next/image";

interface IStyleSelectorProps {
  editor: grapesjs.Editor;
}

const SectionSelector = ({ editor }: IStyleSelectorProps) => {
  const addSectionComponent = () => {
    editor.runCommand("menu-body:add-section");
  };

  return (
    <>
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
              onClick={() => addSectionComponent()}
            >
              <NextImage src={icon} alt="Section Selector" />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown
            bg={theme.colors.dark[4]}
            c="#fff"
            sx={{ border: "none" }}
          >
            <Text size="sm">Insert Section</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Popover>
    </>
  );
};

export default SectionSelector;
