import { ModelDefinition } from "../../../shared/types";
import { SECTION_COLUMN_SELECTOR } from "../constants";
import { SPACER_TAG, SPACER_TYPE } from "./constants";

export const defaultSpacerComponent = {
  type: SPACER_TYPE,
  tagName: SPACER_TAG,
  name: "Spacer",
  draggable: `${SECTION_COLUMN_SELECTOR}`,
  droppable: false,
  style: { "min-height": "20px" },
  attributes: {
    class: "spacer menu-item",
  },
  resizable: {
    // Handlers
    tl: 0, // Top left
    tc: 1, // Top center
    tr: 0, // Top right
    cl: 0, // Center left
    cr: 0, // Center right
    bl: 0, // Bottom left
    bc: 1, // Bottom center
    br: 0, // Bottom right
  },
};

export function spacerModel(): ModelDefinition {
  return {
    defaults: defaultSpacerComponent,
  };
}
