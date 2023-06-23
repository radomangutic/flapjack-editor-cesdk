import grapesjs from "grapesjs";
import { SPACER_TAG, SPACER_TYPE } from "./constants";
import { defaultSpacerComponent } from "./spacerModel";

/**
 * Spacer plugin adds the `Spacer` custom component to the editor.
 * Spacer is a menu item that adds space between other menu items.
 * Spacer does not have any content and does not contain any information.
 * Spacer is used to create a visual separation between menu items.
 */
export const Spacer: grapesjs.Plugin = (editor) => {
  const domc = editor.Components;

  domc.addType(SPACER_TYPE, {
    isComponent: (el) => el && el.tagName === SPACER_TAG,
    model: defaultSpacerComponent,
  });
};

// Re-export the type and model for external use
export { SPACER_TYPE } from "./constants";
export { defaultSpacerComponent } from "./spacerModel";
