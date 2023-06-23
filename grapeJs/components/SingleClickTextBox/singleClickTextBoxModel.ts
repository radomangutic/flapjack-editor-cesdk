import { ModelDefinition } from "../../shared/types";

const defaultSingleClickTextBoxModel = {
  name: "text",
};

export function singleClickTextBoxModel(): ModelDefinition {
  return {
    defaults: defaultSingleClickTextBoxModel,
  };
}
