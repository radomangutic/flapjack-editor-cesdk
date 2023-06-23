import grapesjs from "grapesjs";
import { ModelDefinition } from "../../shared/types";
import { SECTION_COLUMN_TYPE } from "./constants";
import { DISH_SELECTOR } from "./Dish/constants";
import { SPACER_SELECTOR } from "./Spacer/constants";

export const defaultSectionColumnComponent = {
  type: SECTION_COLUMN_TYPE,
  styles: `
    .section-col {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      word-wrap: break-word;
      word-break: break-word;
    }
  `,
  attributes: {
    class: "section-col",
  },
  draggable: false,
  droppable: `${DISH_SELECTOR}, ${SPACER_SELECTOR}`,
  hoverable: false,
  selectable: false,
};

export function sectionColumnModel(): ModelDefinition {
  return {
    defaults: defaultSectionColumnComponent,
  };
}
