import grapesjs from "grapesjs";
import { SINGLE_CLICK_TEXT_BOX_TYPE } from "./constants";
import { singleClickTextBoxModel } from "./singleClickTextBoxModel";
import { singleClickTextBoxView } from "./singleClickTextBoxView";

/**
 * Inherit from the GrapesJS text component and add the single click functionality.
 *
 * Learn more at [GrapesJS Text Component](https://github.com/GrapesJS/grapesjs/blob/ccf14b38dcf1a6089220e01f2c1f0bbdcf67ed69/src/dom_components/view/ComponentTextView.ts#L11)
 */
export function SingleClickText(editor: grapesjs.Editor) {
  const domc = editor.Components;
  domc.addType(SINGLE_CLICK_TEXT_BOX_TYPE, {
    extend: "text",
    extendFnView: ["onActive", "onDisable"],
    model: singleClickTextBoxModel(),
    view: singleClickTextBoxView(),
  });
}

// Re-export the type for external use
export { SINGLE_CLICK_TEXT_BOX_TYPE } from "./constants";
