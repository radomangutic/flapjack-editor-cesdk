import { ModelDefinition } from "../../shared/types";
import { FLOAT_IMAGE_TYPE } from "../FloatImage";
import { HEADER_TYPE } from "./constants";

export const defaultHeaderComponent = {
  type: HEADER_TYPE,
  tagName: "header",
  resizable: {
    // Handlers
    tl: 0, // Top left
    tc: 1, // Top center
    tr: 0, // Top right
    cl: 0, // Center left
    cr: 0, // Center right
    bl: 0, // Bottom left
    bc: 1, // Bottom center
    br: 0, // Bottom right
  },
  styles: `
    .header {
      display: flex;
      align-items: center;
    }
  `,
  droppable: true,
  attributes: {
    class: "header header-image-left",
  },
  style: { "z-index": 2, "min-height": "55px" },
  components: [
    {
      type: FLOAT_IMAGE_TYPE,
    },
    {
      type: "text",
      content: "Text Box",
      style: {
        padding: "10px",
        display: "inline-block",
        "z-index": 2,
        position: "absolute",
        left: "110px",
      },
      dmode: "absolute",
      attributes: {
        class: "custom-text-box menu-title color-menu",
      },
    },
  ],
};

export function headerModel(): ModelDefinition {
  return {
    defaults: defaultHeaderComponent,
  };
}
