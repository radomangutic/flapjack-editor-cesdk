import { ActionIcon, Popover, Button, Text, HoverCard } from "@mantine/core";
import { IconDots, IconSection } from "@tabler/icons";
import {
  defaultHeaderComponent,
  defaultFooterComponent,
  defaultTextBoxComponent,
} from "../../grapeJs/components";
import {
  footer2Component,
  footer3Component,
  footer4Component,
  footer5Component,
} from "../../grapeJs/components/Footer/footerModel";
import theme from "../../config/theme";
import grapejs from "grapesjs";
import { useUser } from "../../hooks";
import { SECTION_COMMANDS } from "../../grapeJs/components/Section/constants";
interface IStyleSelectorProps {
  editor: grapejs.Editor;
}

function addSpacer(editor: grapejs.Editor) {
  editor.runCommand(SECTION_COMMANDS.ADD_SPACER);
}

const AdditionalSelector = ({ editor }: IStyleSelectorProps) => {
  const user = useUser();
  const addSection = (sections: string) => {
    if (!editor || !editor.getWrapper()) return;
    const fontSize = parseInt(
      window
        .getComputedStyle(editor.getWrapper().getEl())
        .fontSize.replace("px", "")
    );
    if (fontSize <= 4) {
      return;
    }

    if (sections === "header") {
      editor.runCommand("header:add");
    }
    if (sections === "footer") {
      editor.addComponents(defaultFooterComponent);
    }
    if (sections === "textBox") {
      // @ts-ignore
      const getHeaderComponent = editor.getComponents().at(0);
      if (getHeaderComponent?.attributes.tagName === "Header") {
        getHeaderComponent.append(defaultTextBoxComponent);
      }
    }
    if (sections === "footer-2") {
      editor.addComponents(footer2Component);
    }
    if (sections === "footer-3") {
      editor.addComponents(footer3Component);
    }
    if (sections === "footer-4") {
      editor.addComponents(footer4Component);
    }
    if (sections === "footer-5") {
      editor.addComponents(footer5Component);
    }
  };

  const actions = [
    {
      label: "Add Header",
      action: () => addSection("header"),
    },
    {
      label: "Add Footer",
      action: () => addSection("footer"),
    },
    {
      label: "Add Footer 2",
      action: () => addSection("footer-2"),
      onlyFlapjack: true,
    },
    {
      label: "Add Footer 3",
      action: () => addSection("footer-3"),
      onlyFlapjack: true,
    },
    {
      label: "Add Footer 4",
      action: () => addSection("footer-4"),
      onlyFlapjack: true,
    },
    {
      label: "Add Footer 5",
      action: () => addSection("footer-5"),
      onlyFlapjack: true,
    },
    {
      label: "Add Spacer",
      action: () => addSpacer(editor),
    },
  ];

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
        <Popover.Target>
          <div>
            <HoverCard shadow="md" position="right">
              <HoverCard.Target>
                <ActionIcon
                  variant="subtle"
                  color={theme.colors.blue[6]}
                  sx={{
                    width: 48,
                  }}
                  className="menu-bar-button"
                >
                  <IconDots
                    className="menu-bar-icon"
                    size={32}
                    color={theme.colors.dark[3]}
                  />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown
                bg={theme.colors.dark[4]}
                c="#fff"
                sx={{ border: "none" }}
              >
                <Text size="sm">Additional Section</Text>
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
          <Text size="lg" fw={700} color="white">
            Insert Section
          </Text>
          {actions.map(
            (action) =>
              (!action.onlyFlapjack || user?.role === "flapjack") && (
                <Button
                  key={action.label}
                  variant="outline"
                  fullWidth
                  leftIcon={"ICO"}
                  className="sectionBtn"
                  styles={(theme) => ({
                    root: {
                      border: 0,
                      height: 50,
                      paddingLeft: 20,
                      paddingRight: 20,
                      color: "#fff",
                      backgroundColor: "#2f2f2f",
                      marginBottom: "8px",
                    },
                    leftIcon: {
                      marginRight: 15,
                      backgroundColor: "#575757",
                      padding: "8px",
                      borderRadius: "5px",
                    },
                  })}
                  onClick={action.action}
                >
                  {action.label}
                </Button>
              )
          )}
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

export default AdditionalSelector;
