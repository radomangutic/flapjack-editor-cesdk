import grapesjs from "grapesjs";
import { FILLER_TYPE } from "./constants";
import { fillerModel } from "./fillerModel";

/**
 * Filler plugin adds the `Filler` custom component to the editor.
 * Filler is not a menu item.
 * Filler is used to make the section columns have the same number of elements for styling.
 * Filler does not have any content and does not contain any information.
 */
export const Filler: grapesjs.Plugin = (editor) => {
  const domc = editor.Components;

  domc.addType(FILLER_TYPE, {
    isComponent: (el) => el && el.tagName === "filler",
    model: fillerModel(),
  });
};

// Re-export the type and model for external use
export { FILLER_TYPE } from "./constants";
export { defaultFillerComponent } from "./fillerModel";
