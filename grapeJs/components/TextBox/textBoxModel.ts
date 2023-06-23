import { ModelDefinition } from "../../shared/types";

export const defaultTextBoxComponent = {
  tagName: "div",
  type: "text",
  content: "Text Box",
  style: { padding: "10px", display: "inline-block" },
  dmode: "absolute",
  attributes: {
    class: "custom-text-box menu-title",
  },
};

export function textBoxModel(): ModelDefinition {
  return {
    defaults: defaultTextBoxComponent,
  };
}
