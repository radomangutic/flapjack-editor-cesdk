import { ModelDefinition } from "../../shared/types";
import { SINGLE_CLICK_TEXT_BOX_TYPE } from "../SingleClickTextBox";
import { SECTION_ADD_ON_TYPE } from "./constants";

export const defaultSectionAddOnComponent = {
  tagName: "section-add-on",
  type: SECTION_ADD_ON_TYPE,
  style: { "text-align": "center" },
  draggable: false,
  droppable: false,
  components: [
    {
      type: SINGLE_CLICK_TEXT_BOX_TYPE,
      components: "Add-on",
    },
  ],
};

export function sectionAddOnModel(): ModelDefinition {
  return {
    defaults: defaultSectionAddOnComponent,
  };
}
