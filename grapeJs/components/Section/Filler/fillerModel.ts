import { ModelDefinition } from "../../../shared/types";
import { FILLER_TAG, FILLER_TYPE } from "./constants";

export const defaultFillerComponent = {
  type: FILLER_TYPE,
  tagName: FILLER_TAG,
  name: "Filler",
  locked: true,
  draggable: false,
  droppable: false,
  selectable: false,
  hoverable: false,
  highlightable: false,
};

export function fillerModel(): ModelDefinition {
  return {
    defaults: defaultFillerComponent,
  };
}
