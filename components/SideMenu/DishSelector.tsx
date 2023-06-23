import { ActionIcon, Popover, Text, HoverCard } from "@mantine/core";
import theme from "../../config/theme";
import grapesjs from "grapesjs";
import icon from "../../public/dish-selector.svg";
import Image from "next/image";
import { SECTION_COMMANDS } from "../../grapeJs/components/Section/constants";

interface IStyleSelectorProps {
  editor: grapesjs.Editor;
}

export const addDishComponent = (editor: grapesjs.Editor) => {
  editor.runCommand(SECTION_COMMANDS.ADD_DISH);
};
const DishSelector = ({ editor }: IStyleSelectorProps) => {
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
              onClick={() => addDishComponent(editor)}
            >
              <Image src={icon} alt="dish selector" />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown
            bg={theme.colors.dark[4]}
            c="#fff"
            sx={{ border: "none" }}
          >
            <Text size="sm">Insert Dish</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Popover>
    </>
  );
};

export default DishSelector;
