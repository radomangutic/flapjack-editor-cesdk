import { ModelDefinition } from "../../shared/types";
import { SECTION_HEADING_TYPE } from "./constants";

export const defaultSectionHeadingComponent = {
  type: SECTION_HEADING_TYPE,
  tagName: "section-heading",
  name: "Heading",
  attributes: { class: "section-heading font-header color-primary" },
  styles: `
    .section-heading {
      flex: 1 1 0;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      word-wrap: break-word;
      word-break: break-word;
    }
  `,
  draggable: false,
  droppable: false,
  hoverable: false,
  selectable: false,
};

export function sectionHeadingModel(): ModelDefinition {
  return {
    defaults: defaultSectionHeadingComponent,
  };
}
