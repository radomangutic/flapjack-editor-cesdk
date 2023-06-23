import grapesjs from "grapesjs";
import { MENU_BODY_TYPE } from "./constants";
import { loadMenuBodyCommands } from "./loadMenuBodyCommands";
import { loadMenuBodyEvents } from "./loadMenuBodyEvents";
import { menuBodyModel } from "./menuBodyModel";

/**
 * Menu Body component is used to separate the menu body with the menu header and menu footer.
 * It contains the menu section components.
 */
export const MenuBody: grapesjs.Plugin = (editor) => {
  loadMenuBodyEvents(editor);
  loadMenuBodyCommands(editor);
  const domc = editor.Components;
  domc.addType(MENU_BODY_TYPE, {
    isComponent: (el) => el && el.tagName === "MENU-BODY",
    model: menuBodyModel(),
  });
};

// Re-export the type and model for external use
export { MENU_BODY_TYPE };
export { defaultMenuBodyModel } from "./menuBodyModel";
