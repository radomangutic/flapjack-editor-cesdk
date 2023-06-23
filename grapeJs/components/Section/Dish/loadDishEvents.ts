import grapesjs from "grapesjs";
import { DISH_TYPE } from "./constants";

const DISH_DETAILS_SELECTOR =
  ":is(.menu-item-title, .menu-item-price, .menu-item-description)";

export function loadDishEvents(editor: grapesjs.Editor) {
  /**
    * Unlock dish content if dish is selected
    */
  editor.on("component:selected", (selectedComponent: grapesjs.Component) => {
    if (!isDish(selectedComponent)) return;
    unlockDishDetails(selectedComponent);
  });

  /**
    * Lock dish content if dish is selected
    */
  editor.on(
    "component:deselected",
    (deselectedComponent: grapesjs.Component) => {
      if (!isDish(deselectedComponent)) return;

      // Prevent locking dish details if the user is editing the dish details
      const isEditing = editor.getEditing() !== null;
      if (isEditing) return;
      lockDishDetails(deselectedComponent);
    }
  );
}

function isDish(component: grapesjs.Component) {
  return component.is(DISH_TYPE);
}

/**
 * Make the dish details selectable and hoverable when the dish is selected
 */
function unlockDishDetails(selectedDish: grapesjs.Component) {
  const dishDetails = selectedDish.find(DISH_DETAILS_SELECTOR);
  dishDetails.forEach((dishDetail) => {
    dishDetail.set("hoverable", true);
  });
}

/**
 * Make the dish details unselectable and unhoverable when the dish is deselected
 */
function lockDishDetails(deselectedDish: grapesjs.Component) {
  const dishDetails = deselectedDish.find(DISH_DETAILS_SELECTOR);
  dishDetails.forEach((dishDetail) => {
    dishDetail.set("hoverable", false);
  });
}
