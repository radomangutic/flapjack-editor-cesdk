import grapesjs from "grapesjs";
import { defaultSectionComponent } from "../Section";
import { MENU_BODY_COMMANDS, MENU_BODY_TYPE } from "./constants";

export function loadMenuBodyCommands(editor: grapesjs.Editor) {
  const commands = editor.Commands;

  commands.add(MENU_BODY_COMMANDS.ADD_SECTION, {
    run: (editor: grapesjs.Editor) => {
      const menuBody = editor.getWrapper().findType(MENU_BODY_TYPE)[0];
      if (!menuBody) return;
      const newSection = menuBody.components().add(defaultSectionComponent);
      setTimeout(() => {
        editor.select(newSection);
      });
    },
  });

  commands.add(MENU_BODY_COMMANDS.UPDATE_VERTICAL_PADDING, {
    run: (editor: grapesjs.Editor, _, options = { value: 0 }) => {
      const { value } = options;
      const menuBody = editor.getWrapper().findType(MENU_BODY_TYPE)[0];
      if (!menuBody) return;
      menuBody.setStyle({
        ...menuBody.getStyle(),
        "padding-top": `${value}px`,
        "padding-bottom": `${value}px`,
      });
    },
  });

  commands.add(MENU_BODY_COMMANDS.UPDATE_HORIZONTAL_PADDING, {
    run: (editor: grapesjs.Editor, _, options = { value: 0 }) => {
      const { value } = options;
      const menuBody = editor.getWrapper().findType(MENU_BODY_TYPE)[0];
      if (!menuBody) return;
      menuBody.setStyle({
        ...menuBody.getStyle(),
        "padding-left": `${value}px`,
        "padding-right": `${value}px`,
      });
    },
  });
}
