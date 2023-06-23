import grapesjs from "grapesjs";
import { DISH_ROW_TYPE, DISH_TAG, DISH_TYPE } from "./constants";
import { dishModel } from "./dishModel";
import { dishRowModel } from "./dishRowModel";
import { loadDishEvents } from "./loadDishEvents";

/**
 * Dish plugin adds the `Dish` custom component to the editor.
 * Dish is a menu item that represents a single food/drink on the menu.
 */
export const Dish: grapesjs.Plugin = (editor) => {
  loadDishEvents(editor);
  const domc = editor.Components;

  domc.addType(DISH_ROW_TYPE, {
    isComponent: (el) => el && el.tagName === "dish-row",
    model: dishRowModel(),
  });

  domc.addType(DISH_TYPE, {
    isComponent: (el) => el && el.tagName === DISH_TAG,
    model: dishModel(),
  });
};

// Re-export the type and model for external use
export { DISH_TYPE } from "./constants";
export { defaultDishComponent } from "./dishModel";
