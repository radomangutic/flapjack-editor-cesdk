import { ModelDefinition } from "../../../shared/types";
import { DISH_ROW_TYPE } from "./constants";

export const defaultDishRowComponent = {
  type: DISH_ROW_TYPE,
  tagName: "dish-row",
  name: "Dish Row",
  draggable: false,
  droppable: false,
  highlightable: false,
  hoverable: false,
  selectable: false,
  attributes: { class: "dish-row" },
  styles: `
    .dish-row {
      display: flex;
      gap: 10px;
    }
  `,
};

export function dishRowModel(): ModelDefinition {
  return {
    defaults: defaultDishRowComponent,
  };
}
