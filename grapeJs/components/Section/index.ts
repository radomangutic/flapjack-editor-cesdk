import grapesjs from "grapesjs";
import { SINGLE_CLICK_TEXT_BOX_TYPE } from "../SingleClickTextBox";
import {
  SECTION_ADD_ON_TYPE,
  SECTION_BODY_TYPE,
  SECTION_COLUMN_TYPE,
  SECTION_HEADING_ROW_TAG,
  SECTION_HEADING_ROW_TYPE,
  SECTION_HEADING_TYPE,
  SECTION_TYPE,
} from "./constants";
import { Dish } from "./Dish";
import { Filler } from "./Filler";
import { Spacer } from "./Spacer";
import { loadSectionCommands } from "./loadSectionCommands";
import { loadSectionEvents } from "./loadSectionEvents";
import { sectionAddOnModel } from "./sectionAddOnModel";
import { sectionBodyModel } from "./sectionBodyModel";
import { sectionColumnModel } from "./sectionColumnModel";
import { sectionHeadingModel } from "./sectionHeadingModel";
import { sectionModel } from "./sectionModel";
import { sectionHeadingRowModel } from "./sectionHeadingRowModel";

export const Section: grapesjs.Plugin = (editor, config) => {
  Dish(editor, config);
  Filler(editor, config);
  Spacer(editor, config);

  loadSectionEvents(editor);
  loadSectionCommands(editor);
  const domc = editor.Components;

  domc.addType(SECTION_HEADING_ROW_TYPE, {
    isComponent: (el) => el && el.tagName === SECTION_HEADING_ROW_TAG,
    model: sectionHeadingRowModel(),
  });

  domc.addType(SECTION_HEADING_TYPE, {
    isComponent: (el) => el && el.tagName === "section-heading",
    extend: SINGLE_CLICK_TEXT_BOX_TYPE,
    model: sectionHeadingModel(),
  });

  domc.addType(SECTION_BODY_TYPE, {
    isComponent: (el) => el && el.tagName === "section-body",
    model: sectionBodyModel(),
  });

  domc.addType(SECTION_COLUMN_TYPE, {
    isComponent: (el) =>
      el && el.classList && el.classList.contains("section-col"),
    model: sectionColumnModel(),
  });

  domc.addType(SECTION_ADD_ON_TYPE, {
    isComponent: (el) => el && el.tagName === "section-add-on",
    model: sectionAddOnModel(),
  });

  domc.addType(SECTION_TYPE, {
    isComponent: (el) => el && el.classList && el.classList.contains("section"),
    model: sectionModel(),
  });
};

// Re-export the type and model for external use
export { SECTION_TYPE } from "./constants";
export { defaultSectionComponent } from "./sectionModel";
