import grapesjs from "grapesjs";
import { MENU_BODY_TYPE } from "./constants";

export function loadMenuBodyEvents(editor: grapesjs.Editor) {
  editor.on("load", () => {
    // Add the menu body component if it doesn't exist
    const menuBodies = editor.getWrapper().findType(MENU_BODY_TYPE);
    if (menuBodies.length > 0) return;
    editor.Components.addComponent(
      {
        type: MENU_BODY_TYPE,
      },
      {}
    );
  });
}
