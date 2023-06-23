import { ModelDefinition } from "../../shared/types";
import { SECTION_SELECTOR } from "../Section/constants";
import { MENU_BODY_TAG } from "./constants";

export const defaultMenuBodyModel = {
  tagName: MENU_BODY_TAG,
  draggable: false,
  droppable: `${SECTION_SELECTOR}`,
  components: [],
  styles: `
        .menu-body {
          display: flex;
          flex-flow: column nowrap;
          flex-grow: 1;
          height: 100%;
        }
      `,
  attributes: {
    class: "menu-body",
  },
  removable: false,
  selectable: false,
  hoverable: false,
};

export function menuBodyModel(): ModelDefinition {
  return {
    defaults: defaultMenuBodyModel,
  };
}
