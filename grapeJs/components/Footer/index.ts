import grapesjs from "grapesjs";
import { FOOTER_TYPE } from "./constants";
import { footerModel } from "./footerModel";

export function Footer(editor: grapesjs.Editor) {
  const domc = editor.Components;
  domc.addType(FOOTER_TYPE, {
    isComponent: (el) => el && el.classList && el.classList.contains("footer"),
    model: footerModel(),
  });
}

// Re-export the type and model for external use
export { FOOTER_TYPE } from "./constants";
export { defaultFooterComponent } from "./footerModel";
