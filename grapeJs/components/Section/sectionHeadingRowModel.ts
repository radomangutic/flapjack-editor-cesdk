import { ModelDefinition } from "../../shared/types";
import { SECTION_HEADING_ROW_TYPE, SECTION_HEADING_TYPE } from "./constants";
import { defaultSectionHeadingComponent } from "./sectionHeadingModel";

export const defaultSectionHeadingRowComponent = {
  type: SECTION_HEADING_ROW_TYPE,
  tagName: "section-heading-row",
  name: "Heading Row",
  attributes: {
    class: "section-heading-row",
    headingAlignment: "left",
    headingsColumnTotal: 1,
  },
  styles: `
    .section-heading-row {
      display: flex;
      flex-flow: row nowrap;
    }
  `,
  draggable: false,
  droppable: false,
  hoverable: false,
  selectable: false,
  traits: [
    {
      type: "number",
      label: "Heading Columns",
      name: "headingColumnTotal",
      min: 1,
      max: 3,
      step: 1,
    },
    {
      type: "select",
      name: "headingAlignment",
      label: "Heading Alignment",
      options: [
        { value: "left", name: "Left" },
        { value: "center", name: "Center" },
        { value: "right", name: "Right" },
      ],
    },
  ],
};

export function sectionHeadingRowModel(): ModelDefinition {
  return {
    defaults: defaultSectionHeadingRowComponent,
    init() {
      this.on(
        "change:attributes:headingAlignment",
        this.updateHeadingAlignment
      );
      this.on(
        "change:attributes:headingColumnTotal",
        this.updateHeadingColumns
      );
    },

    updateHeadingColumns() {
      const { headingColumnTotal } = this.getAttributes();
      const currentHeadings = this.findType(SECTION_HEADING_TYPE);
      const currentHeading = currentHeadings[0];

      // Add headings with the same style as current ones if the current heading count is less than the total of needed headings
      const defaultHeadings = Array.from(
        { length: headingColumnTotal - currentHeadings.length || 0 },
        () =>
          this.components().add({
            ...defaultSectionHeadingComponent,
            components: "Heading",
            style: currentHeading.getStyle(),
          })
      );
      const headings = currentHeadings
        .slice(0, headingColumnTotal)
        .concat(defaultHeadings);

      this.components().reset(headings);
    },

    updateHeadingAlignment() {
      const { headingAlignment } = this.getAttributes();
      const headings = this.findType(SECTION_HEADING_TYPE);
      headings.forEach((heading) => {
        const currentStyle = heading.getStyle();
        heading.setStyle({ ...currentStyle, "text-align": headingAlignment });
      });
    },
  };
}
