import grapesjs from "grapesjs";
import { HEADER_TYPE } from "./constants";
import { headerModel } from "./headerModel";
import { loadHeaderCommands } from "./loadHeaderCommands";

export function Header(editor: grapesjs.Editor) {
  loadHeaderCommands(editor);
  const domc = editor.DomComponents;
  domc.addType(HEADER_TYPE, {
    isComponent: (el) => el && el.classList && el.classList.contains("header"),
    model: headerModel(),
  });
}

// Re-export the type and model for external use
export { HEADER_TYPE } from "./constants";
export { defaultHeaderComponent } from "./headerModel";
