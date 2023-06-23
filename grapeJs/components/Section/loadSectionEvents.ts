import grapesjs from "grapesjs";
import {
  MENU_ITEM_SELECTOR,
  SECTION_ADD_ON_TYPE,
  SECTION_BODY_TYPE,
  SECTION_COLUMN_TYPE,
  SECTION_HEADING_TYPE,
  SECTION_TYPE,
} from "./constants";
import { sectionToolbarItems } from "./sectionToolbar";
import { defaultFillerComponent } from "./Filler";
import { FILLER_TYPE } from "./Filler/constants";
import { DISH_TYPE } from "./Dish";

function isSection(component: grapesjs.Component) {
  return component.is(SECTION_TYPE);
}

export function loadSectionEvents(editor: grapesjs.Editor) {
  /**
    * Unlock section content if section is selected
    */
  editor.on("component:selected", (selectedComponent: grapesjs.Component) => {
    if (!isSection(selectedComponent)) return;
    unlockHeading(selectedComponent);
    unlockAddOn(selectedComponent);
    setupToolbar(selectedComponent);
  });

  /**
    * Lock section content if section is deselected
    */
  editor.on(
    "component:deselected",
    (deselectedComponent: grapesjs.Component) => {
      if (!isSection(deselectedComponent)) return;

      // Prevent locking section content if the user is editing the section content
      const isEditing = editor.getEditing() !== null;
      if (isEditing) return;
      lockHeading(deselectedComponent);
      lockAddOn(deselectedComponent);
    }
  );

  editor.on("component:add", (component: grapesjs.Component) => {
    if (component.getClasses().includes("menu-item")) {
      redistributeSectionItems(component);
    }
  });
}

function unlockHeading(selectedSection: grapesjs.Component) {
  const heading = selectedSection.findType(SECTION_HEADING_TYPE);
  heading.forEach((heading) => {
    heading.set("hoverable", true);
  });
}

function lockHeading(deselectedSection: grapesjs.Component) {
  const heading = deselectedSection.findType(SECTION_HEADING_TYPE);
  heading.forEach((heading) => {
    heading.set("hoverable", false);
  });
}

function unlockAddOn(selectedSection: grapesjs.Component) {
  const addOn = selectedSection.findType(SECTION_ADD_ON_TYPE);
  addOn.forEach((addOn) => {
    addOn.set("hoverable", true);
  });
}

function lockAddOn(deselectedSection: grapesjs.Component) {
  const addOn = deselectedSection.findType(SECTION_ADD_ON_TYPE);
  addOn.forEach((addOn) => {
    addOn.set("hoverable", false);
  });
}

function setupToolbar(selectedSection: grapesjs.Component) {
  const toolbar = selectedSection.get("toolbar");
  toolbar?.unshift(...sectionToolbarItems);
  selectedSection.set("toolbar", toolbar);
}

function redistributeSectionItems(updatedSectionItem: grapesjs.Component) {
  const sectionBody = updatedSectionItem.closestType(SECTION_BODY_TYPE);
  if (!sectionBody) return;
  const sectionColumns = sectionBody.findType(SECTION_COLUMN_TYPE);
  // Get the largest number of menu items in a column
  const maxMenuItems = Math.max(
    ...sectionColumns.map((col) => col.find(MENU_ITEM_SELECTOR).length)
  );
  const fillerHeight = updatedSectionItem.is(DISH_TYPE)
    ? updatedSectionItem.getEl().offsetHeight
    : sectionBody.findType(DISH_TYPE)[0].getEl().offsetHeight;
  // Add filler component to each column to make them all the same height
  sectionColumns.forEach((col) => {
    const menuItems = col.find(MENU_ITEM_SELECTOR);
    const fillerCount = maxMenuItems - menuItems.length;
    col.findType(FILLER_TYPE).forEach((filler) => filler.remove());
    for (let i = 0; i < fillerCount; i++) {
      col.components().add({
        ...defaultFillerComponent,
        style: {
          height: `${fillerHeight}px`,
        },
      });
    }
  });
}
