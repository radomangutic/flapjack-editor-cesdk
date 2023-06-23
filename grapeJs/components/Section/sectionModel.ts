import { ModelDefinition } from "../../shared/types";
import { defaultDishComponent } from "./Dish";
import {
  SECTION_ADD_ON_TYPE,
  SECTION_BODY_TYPE,
  SECTION_COLUMN_TYPE,
  SECTION_HEADING_TYPE,
  SECTION_TYPE,
  MENU_ITEM_SELECTOR,
  SECTION_HEADING_ROW_TYPE,
} from "./constants";
import { defaultSectionAddOnComponent } from "./sectionAddOnModel";
import { defaultSectionColumnComponent } from "./sectionColumnModel";
import { defaultSectionBodyComponent } from "./sectionBodyModel";
import { MENU_BODY_SELECTOR } from "../MenuBody/constants";

export const defaultSectionComponent = {
  type: SECTION_TYPE,
  name: "Section",
  draggable: `${MENU_BODY_SELECTOR}`,
  droppable: false,
  attributes: {
    class: "section",
    sectionColumnTotal: 1,
    hasAddOn: false,
  },
  styles: `
    .section {
      display: flex;
      flex-flow: column nowrap;
      flex-grow: 1;
      padding: 12px;
      position: relative;
    }
  `,
  components: [
    {
      type: SECTION_HEADING_ROW_TYPE,
      components: [
        {
          type: SECTION_HEADING_TYPE,
          content: "Heading",
        },
      ],
    },
    {
      type: SECTION_BODY_TYPE,
      components: [
        {
          type: SECTION_COLUMN_TYPE,
          components: Array.from({ length: 2 }, () => defaultDishComponent),
        },
      ],
    },
  ],
  traits: [
    {
      type: "number",
      name: "sectionColumnTotal",
      label: "Section Columns",
      min: 1,
      max: 3,
      step: 1,
    },
    {
      type: "checkbox",
      name: "hasAddOn",
      label: "Add On",
    },
  ],
};

export function sectionModel(): ModelDefinition {
  return {
    defaults: defaultSectionComponent,
    init() {
      this.on(
        "change:attributes:sectionColumnTotal",
        this.updateSectionColumns
      );
      this.on("change:attributes:hasAddOn", this.toggleAddOn);
    },

    /**
     * Change the layout of the section by changing the number of the columns in the section.
     *
     * Redistribute the current menu items to new column layout in order for them to have the same number of items.
     * The filler items are added by listening to the `component:add` event.
     *
     * @see {@link ./loadSectionEvents.ts}
     */
    updateSectionColumns() {
      const { sectionColumnTotal } = this.getAttributes();
      const headingRow = this.components().find((component) =>
        component.is(SECTION_HEADING_ROW_TYPE)
      );
      headingRow.addAttributes({ headingColumnTotal: sectionColumnTotal });
      const menuItems = this.find(MENU_ITEM_SELECTOR);
      const newSectionBody = this.components().add(defaultSectionBodyComponent);
      const newSectionColumns = Array.from({ length: sectionColumnTotal }, () =>
        newSectionBody.components().add(defaultSectionColumnComponent)
      );
      const sectionBody = this.components().find((component) =>
        component.is(SECTION_BODY_TYPE)
      );

      // Creating new menu items for the new columns is redundant. It is slow and causes issues with styles and properties.
      // Move the menu items and filler items into the new columns to keep the styles and properties.
      menuItems.forEach((item, index) => {
        item.move(newSectionColumns[index % sectionColumnTotal], {});
      });

      // Reset the section body to the new number of columns
      sectionBody.remove();
      this.components().add(newSectionBody);
    },

    toggleAddOn() {
      const { hasAddOn } = this.getAttributes();
      if (Boolean(hasAddOn)) {
        this.addAddOn();
        return;
      }
      this.removeAddOn();
    },
    addAddOn() {
      this.components().add(defaultSectionAddOnComponent);
    },
    removeAddOn() {
      const addOn = this.components().find((component) =>
        component.is(SECTION_ADD_ON_TYPE)
      );
      this.components().remove(addOn);
    },
  };
}
