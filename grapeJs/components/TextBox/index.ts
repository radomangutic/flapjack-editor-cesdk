import grapesjs from "grapesjs";
import { TEXT_BOX_TYPE } from "./constants";
import { textBoxModel } from "./textBoxModel";

export function TextBox(editor: grapesjs.Editor) {
  const domc = editor.DomComponents;

  domc.addType(TEXT_BOX_TYPE, {
    isComponent: (el) =>
      el && el.classList && el.classList.contains("custom-text-box"),
    model: textBoxModel(),
  });
}

// Re-export the type and model for external use
export { TEXT_BOX_TYPE } from "./constants";
export { defaultTextBoxComponent } from "./textBoxModel";
