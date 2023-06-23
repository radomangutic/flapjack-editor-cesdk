import { ModelDefinition } from "../../shared/types";
import { FOOTER_TYPE } from "./constants";

export const defaultFooterComponent = {
  type: FOOTER_TYPE,
  tagName: "footer",
  attributes: {
    class: "footer background-primary color-background flapjackFooter",
  },
  components: [
    {
      type: "text",
      content: `123 Menu St. 1(800) FLP-JACK<br/>Made with \u2665 by Flapjack.co`,
      editable: true,
      highlightable: false,
      attributes: {
        class: "footer-text",
      },
    },
  ],
};

export function footerModel(): ModelDefinition {
  return {
    defaults: defaultFooterComponent,
  };
}

export const footer2Component = {
  type: FOOTER_TYPE,
  tagName: "footer",
  attributes: {
    class: "footer flapjackFooter",
  },
  components: [
    {
      type: "text",
      content: `123 Menu St. 1(800) FLP-JACK<br/>Made with \u2665 by Flapjack.co`,
      editable: true,
      attributes: {
        "data-gjs-highlightable": "false",
        class: "footer-text",
      },
    },
  ],
};

export const footer3Component = {
  type: FOOTER_TYPE,
  tagName: "footer",
  attributes: {
    class: "footer footer-2 flapjackFooter",
  },
  components: [
    {
      tagName: "div",
      attributes: {
        class: "footer-content footer-content-solid footer-text",
      },
      components: [
        {
          type: "text",
          editable: true,
          content: "123 Menu St. | 1-800-FLP-JACK",
          attributes: {
            class: "footer-text ",
          },
        },
        {
          type: "text",
          editable: true,
          content: "Made With \u2665 on Flapjack.co",
          attributes: {
            class: "footer-text",
          },
        },
      ],
    },
  ],
};

export const footer4Component = {
  type: FOOTER_TYPE,
  tagName: "footer",
  attributes: {
    class: "footer footer-2 flapjackFooter",
  },
  components: [
    {
      tagName: "div",
      attributes: {
        class: "footer-content footer-content-dashed footer-text",
      },
      components: [
        {
          type: "text",
          editable: true,
          content: "123 Menu St. | 1-800-FLP-JACK",
          attributes: {
            class: "footer-text",
          },
        },
        {
          type: "text",
          editable: true,
          content: "Made With \u2665 on Flapjack.co",
          attributes: {
            class: "footer-text",
          },
        },
      ],
    },
  ],
};

export const footer5Component = {
  type: FOOTER_TYPE,
  tagName: "footer",
  attributes: {
    class: "footer footer-2 flapjackFooter",
  },
  components: [
    {
      tagName: "div",
      attributes: {
        class: "footer-content footer-text",
      },
      components: [
        {
          type: "text",
          editable: true,
          content: "123 Menu St. | 1-800-FLP-JACK",
          attributes: {
            class: "footer-text",
          },
        },
        {
          type: "text",
          editable: true,
          content: "Made With \u2665 on Flapjack.co",
          attributes: {
            class: "footer-text",
          },
        },
      ],
    },
  ],
};
