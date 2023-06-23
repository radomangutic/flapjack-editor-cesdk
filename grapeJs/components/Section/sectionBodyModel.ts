import { ModelDefinition } from "../../shared/types";
import { SECTION_BODY_TYPE } from "./constants";

export const defaultSectionBodyComponent = {
  type: SECTION_BODY_TYPE,
  attributes: {
    class: "section-body",
  },
  styles: `
    .section-body {
      display: flex;
      flex-flow: row nowrap;
      flex-grow: 1;
    }
  `,
  tagName: "section-body",
  draggable: false,
  droppable: false,
  hoverable: false,
  selectable: false,
};

export function sectionBodyModel(): ModelDefinition {
  return {
    defaults: defaultSectionBodyComponent,
  };
}
