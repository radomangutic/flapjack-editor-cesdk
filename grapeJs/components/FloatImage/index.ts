import grapesjs from "grapesjs";
import { FLOAT_IMAGE_TYPE } from "./constants";
import { floatImageModel } from "./floatImageModel";
import { loadFloatImageCommands } from "./loadFloatImageCommands";
import { loadFloatImageEvents } from "./loadFloatImageEvents";

export function FloatImage(editor: grapesjs.Editor) {
  loadFloatImageCommands(editor);
  loadFloatImageEvents(editor);
  const domc = editor.Components;
  domc.addType(FLOAT_IMAGE_TYPE, {
    isComponent: (el) =>
      el && el.classList && el.classList.contains("float-image"),
    extend: "image",
    model: floatImageModel(editor),
  });
}

// Re-export the type and model for external use
export { FLOAT_IMAGE_TYPE } from "./constants";
export { defaultFloatImageComponent } from "./floatImageModel";
