import { ModelDefinition } from "../../../shared/types";
import { DISH_ROW_TYPE, DISH_TYPE } from "./constants";
import { SINGLE_CLICK_TEXT_BOX_TYPE } from "../../SingleClickTextBox";

const titleSelector = ".menu-item-title";
const priceSelector = ".menu-item-price";
const descriptionSelector = ".menu-item-description";

const disableInteractions = {
  droppable: false,
  draggable: false,
  selectable: false,
  hoverable: false,
  highlightable: false,
};

export const defaultDishComponent = {
  tagName: "dish",
  type: DISH_TYPE,
  name: "Dish",
  draggable: ".section-col",
  droppable: false,
  attributes: {
    class: "dish menu-item",
    dishAlignment: "flex-start",
    descriptionInLine: false,
    priceAlignment: "nextToTitle",
  },
  highlightable: false,
  styles: `
    .dish {
      display: flex;
      flex-direction: column;
    }
    .menu-item-price {
      word-break: keep-all;
      min-width: fit-content;
    }
  `,
  components: [
    {
      type: DISH_ROW_TYPE,
      components: [
        {
          ...disableInteractions,
          type: SINGLE_CLICK_TEXT_BOX_TYPE,
          attributes: {
            class: "menu-item-title font-title",
          },
          content: "Title",
        },
        {
          ...disableInteractions,
          type: SINGLE_CLICK_TEXT_BOX_TYPE,
          attributes: {
            class: "menu-item-price font-body",
          },
          content: "$10",
        },
      ],
    },
    {
      type: DISH_ROW_TYPE,
      components: [
        {
          ...disableInteractions,
          attributes: {
            class: "menu-item-description font-body",
          },
          type: SINGLE_CLICK_TEXT_BOX_TYPE,
          content: "Description",
        },
      ],
    },
  ],
  traits: [
    {
      type: "select",
      label: "Dish Alignment",
      name: "dishAlignment",
      options: [
        { value: "flex-start", name: "Left" },
        { value: "center", name: "Center" },
        { value: "flex-end", name: "Right" },
      ],
    },
    {
      type: "select",
      label: "Price Alignment",
      name: "priceAlignment",
      options: [
        { value: "nextToTitle", name: "Next to Title" },
        { value: "nextToDescription", name: "Next to Description" },
        { value: "belowDescription", name: "Below Description" },
        { value: "nextToTitleJustify", name: "Next to Title justified" },
      ],
    },
    {
      type: "checkbox",
      label: "Description In-line",
      name: "descriptionInLine",
    },
  ],
};

export function dishModel(): ModelDefinition {
  return {
    defaults: defaultDishComponent,

    init() {
      this.on("change:attributes:dishAlignment", this.updateDishAlignment);
      this.on(
        "change:attributes:descriptionInLine",
        this.updateDescriptionAlignment
      );
      this.on("change:attributes:priceAlignment", this.updatePriceAlignment);
    },

    updateDishAlignment() {
      const { dishAlignment } = this.getAttributes();
      this.setStyle({ "align-items": dishAlignment });
    },

    updateDescriptionAlignment() {
      const { descriptionInLine } = this.getAttributes();
      const isDescriptionInLine = Boolean(descriptionInLine);
      const title = this.find(titleSelector)[0];
      const price = this.find(priceSelector)[0];
      const description = this.find(descriptionSelector)[0];
      if (!title || !price || !description) return;
      if (isDescriptionInLine) {
        const rows = this.components().reset([
          {
            type: DISH_ROW_TYPE,
          },
        ]);
        title.move(rows[0], {});
        description.move(rows[0], {});
        price.move(rows[0], {});
        return;
      }
      const rows = this.components().reset([
        {
          type: DISH_ROW_TYPE,
        },
        {
          type: DISH_ROW_TYPE,
        },
      ]);
      title.move(rows[0], {});
      price.move(rows[0], {});
      description.move(rows[1], {});
      this.addAttributes({ priceAlignment: "nextToTitle" });
    },

    updatePriceAlignment() {
      const { priceAlignment } = this.getAttributes();
      const title = this.find(titleSelector)[0];
      const price = this.find(priceSelector)[0];
      const description = this.find(descriptionSelector)[0];
      if (!title || !price || !description) return;
      switch (priceAlignment) {
        case "nextToTitle": {
          const rows = this.components().reset([
            {
              type: DISH_ROW_TYPE,
            },
            {
              type: DISH_ROW_TYPE,
            },
          ]);
          title.move(rows[0], {});
          price.move(rows[0], {});
          description.move(rows[1], {});
          break;
        }
        case "nextToDescription": {
          const rows = this.components().reset([
            {
              type: DISH_ROW_TYPE,
            },
            {
              type: DISH_ROW_TYPE,
            },
          ]);
          title.move(rows[0], {});
          description.move(rows[1], {});
          price.move(rows[1], {});
          break;
        }
        case "belowDescription": {
          const rows = this.components().reset([
            {
              type: DISH_ROW_TYPE,
            },
            {
              type: DISH_ROW_TYPE,
            },
            {
              type: DISH_ROW_TYPE,
            },
          ]);
          title.move(rows[0], {});
          description.move(rows[1], {});
          price.move(rows[2], {});
          break;
        }
        case "nextToTitleJustify": {
          const rows = this.components().reset([
            {
              type: DISH_ROW_TYPE,
              style: { "justify-content": "space-between", width: "100%" },
            },
            {
              type: DISH_ROW_TYPE,
              style: { "justify-content": "space-between", width: "100%" },
            },
          ]);
          title.move(rows[0], {});
          price.move(rows[0], {});
          description.move(rows[1], {});
          break;
        }
      }
    },
  };
}
