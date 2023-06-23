import {
  FLOAT_IMAGE_TYPE,
  FOOTER_TYPE,
  HEADER_TYPE,
  MENU_BODY_TYPE,
  SINGLE_CLICK_TEXT_BOX_TYPE,
} from "../components";
import {
  SECTION_BODY_TYPE,
  SECTION_COLUMN_TYPE,
  SECTION_HEADING_ROW_TYPE,
  SECTION_HEADING_TYPE,
  SECTION_TYPE,
} from "../components/Section/constants";
import { DISH_TYPE } from "../components/Section/Dish";
import { DISH_ROW_TYPE } from "../components/Section/Dish/constants";
import { SPACER_TYPE } from "../components/Section/Spacer";
import { TemplateLoader } from "./TemplateLoader";
import {
  ComponentData,
  FrameData,
  PageData,
  StyleData,
  TemplateData,
} from "./types";

/**
 * Load the version 1 template
 */
export class V1TemplateLoader implements TemplateLoader {
  constructor(private template: TemplateData) {}

  load(): TemplateData {
    const { pages } = this.template;
    const newPages = pages.map(convertV1Page);
    const newStyles = convertV1Styles(this.template.styles);

    return {
      ...this.template,
      pages: newPages,
      styles: newStyles,
    };
  }
}

function convertV1Page(page: PageData) {
  const newFrames = page.frames.map(convertV1Frame);
  return {
    ...page,
    frames: newFrames,
  };
}

function convertV1Frame(frame: FrameData) {
  const { component, ...rest } = frame;
  const convertedComponent = convertV1Component(component);

  // Move menu sections to the menu body
  const sections = convertedComponent.components?.filter(isSection);
  const nonSectionComponents = convertedComponent.components?.filter(
    (comp) => !isSection(comp)
  );
  const menuBody = {
    type: MENU_BODY_TYPE,
    components: sections,
  };
  const newComponents = nonSectionComponents
    ? [...nonSectionComponents, menuBody]
    : [menuBody];
  return {
    ...rest,
    component: {
      ...convertedComponent,
      components: newComponents,
    },
  };
}

function convertV1Component(component: ComponentData): ComponentData {
  if (isImage(component)) {
    return convertV1Image(component);
  }
  if (isHeader(component)) {
    return convertV1Header(component);
  }
  if (isFooter(component)) {
    return convertV1Footer(component);
  }
  if (isSection(component)) {
    return convertV1Section(component);
  }
  return {
    ...component,
    components: component.components?.map(convertV1Component),
  };
}

function convertV1Header(header: ComponentData): ComponentData {
  header.components?.forEach((component) => {
    if (component.type === "image") {
      component.type = FLOAT_IMAGE_TYPE;
    }
  });
  return {
    ...header,
    type: HEADER_TYPE,
    tagName: "header",
  };
}

function convertV1Footer(footer: ComponentData): ComponentData {
  return {
    ...footer,
    type: FOOTER_TYPE,
    tagName: "footer",
  };
}

function convertV1Image(image: ComponentData): ComponentData {
  return {
    ...image,
    type: FLOAT_IMAGE_TYPE,
    attributes: {
      ...image.attributes,
      src: sanitizeImageSource(image.attributes?.src),
    },
  };
}

function sanitizeImageSource(src: string) {
  if (src === undefined || src === null) return src;
  if (/svg\+xml/.test(src)) {
    const base64 = src.replace("data:image/svg+xml;base64,", "");
    const decoded = atob(base64);
    // Create svg element from string
    const parser = new DOMParser();
    const svg = parser.parseFromString(
      decoded,
      "image/svg+xml"
    ).documentElement;

    // Firefox requires the svg to have a defined width and height to render.
    // Init the size of the svg image if it is not pre-defined.
    const viewBox = svg.getAttribute("viewBox")?.split(/\s/);
    if (svg.getAttribute("width") && svg.getAttribute("height")) return src;
    if (svg.getAttribute("width") === null) {
      svg.setAttribute("width", viewBox?.[2]!);
    }
    if (svg.getAttribute("height") === null) {
      svg.setAttribute("height", viewBox?.[3]!);
    }
    const svg64 = btoa(svg.outerHTML);
    const image64 = "data:image/svg+xml;base64," + svg64;
    return image64;
  }
  return src;
}

function convertV1Section(section: ComponentData): ComponentData {
  const { components: sectionColumns } = section;
  if (!sectionColumns) return { ...section };
  let sectionColumnTotal = sectionColumns.length;
  const newHeadings = sectionColumns
    .flatMap((column) => findComponentsByClassName(column, "section-heading"))
    .map((heading) => ({
      type: SECTION_HEADING_TYPE,
      content: heading.components ? heading.components[0].content : "",
    }));
  const headingRow = {
    type: SECTION_HEADING_ROW_TYPE,
    components: newHeadings,
  };

  let newSectionColumns = sectionColumns
    .flatMap((column) =>
      findComponentsByClassName(column, "section-col__dishes")
    )
    .map(convertV1Column);

  // If the format is older than V1 and has not been saved, we have to convert it
  if (newSectionColumns.length === 0) {
    const columnTotalRegex = /section-column-\d+/;
    const sectionColumnTotalMatches = section.classes
      ?.find((className) => columnTotalRegex.test(className))
      ?.match(/\d+/);
    sectionColumnTotal = sectionColumnTotalMatches
      ? parseInt(sectionColumnTotalMatches[0])
      : 1;
    const menuItems = findComponentsByClassName(section, "menu-item");
    const columns: ComponentData[] = Array.from(
      { length: sectionColumnTotal },
      () => ({
        components: [],
      })
    );
    menuItems.forEach((item, index) => {
      columns[index % sectionColumnTotal].components?.push(item);
    });
    newSectionColumns = columns.map(convertV1Column);
  }

  return {
    ...section,
    type: SECTION_TYPE,
    components: [
      headingRow,
      { type: SECTION_BODY_TYPE, components: newSectionColumns },
    ],
    attributes: {
      ...section.attributes,
      sectionColumnTotal,
    },
  };
}

function convertV1Column(column: ComponentData) {
  const menuItems = column.components?.filter(({ classes }) =>
    classes?.includes("menu-item")
  );
  const newItems = menuItems
    ?.map((item) => {
      if (item.type === "spacer") {
        return {
          type: SPACER_TYPE,
        };
      }
      const title = findComponentByClassname(item, "menu-item-title");
      const price = findComponentByClassname(item, "menu-item-price");
      const description = findComponentByClassname(
        item,
        "menu-item-description"
      );
      if (!title || !price || !description) return null;
      const titleContent = title.components && title.components[0].content;
      const priceContent = price.components && price.components[0].content;
      const descriptionContent =
        description.components && description.components[0].content;
      return {
        type: DISH_TYPE,
        components: [
          {
            type: DISH_ROW_TYPE,
            components: [
              {
                type: SINGLE_CLICK_TEXT_BOX_TYPE,
                content: titleContent,
                classes: ["menu-item-title", "font-title"],
              },
              {
                type: SINGLE_CLICK_TEXT_BOX_TYPE,
                content: priceContent,
                classes: ["menu-item-price", "font-body"],
              },
            ],
          },
          {
            type: DISH_ROW_TYPE,
            components: [
              {
                type: SINGLE_CLICK_TEXT_BOX_TYPE,
                content: descriptionContent,
                classes: ["menu-item-description", "font-body"],
              },
            ],
          },
        ],
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && item !== undefined
    );
  return {
    type: SECTION_COLUMN_TYPE,
    components: newItems,
  };
}

function findComponentByClassname(
  component: ComponentData,
  className: string
): ComponentData | null {
  if (component.classes?.includes(className)) {
    return component;
  }
  if (component.components && component.components.length > 0) {
    for (let i = 0; i < component.components.length; i++) {
      const comp = component.components[i];
      const foundComp = findComponentByClassname(comp, className);
      if (foundComp !== null) {
        return foundComp;
      }
    }
  }
  if (className === "menu-item-price") {
  }
  return null;
}

function findComponentsByClassName(
  component: ComponentData,
  className: string
): ComponentData[] {
  if (component.classes?.includes(className)) {
    return [component];
  }
  if (component.components && component.components.length > 0)
    return component.components.flatMap((comp) =>
      findComponentsByClassName(comp, className)
    );
  return [];
}

function convertV1Styles(styles: StyleData[]) {
  return styles.filter((style) => {
    if (
      style.selectorsAdd &&
      style.selectorsAdd.match(/\.section-column|\.section-col/g)
    ) {
      return false;
    }
    if (style.selectorsAdd && style.selectorsAdd.match(/wrapper/g)) {
      style.style = {
        ...style.style,
        display: "flex",
        "flex-direction": "column",
      };
    }
    return true;
  });
}

function isSection(component: ComponentData) {
  return component.classes?.includes("section");
}

function isHeader(component: ComponentData) {
  return component.classes?.includes("header");
}

function isFooter(component: ComponentData) {
  return component.classes?.includes("footer");
}

function isImage(component: ComponentData) {
  return component.type === "image";
}
