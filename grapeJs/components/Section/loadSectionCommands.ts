import grapesjs from "grapesjs";
import { defaultDishComponent } from "./Dish";
import {
  MENU_ITEM_SELECTOR,
  SECTION_BODY_SELECTOR,
  SECTION_BODY_TYPE,
  SECTION_COMMANDS,
  SECTION_HEADING_ROW_SELECTOR,
  SECTION_HEADING_ROW_TYPE,
  SECTION_TYPE,
} from "./constants";
import { isSection } from "./utils";
import { DISH_TYPE } from "./Dish/constants";
import { defaultSpacerComponent } from "./Spacer";
import { spinNumber } from "../../utils/spinNumber";

export function loadSectionCommands(editor: grapesjs.Editor) {
  const commands = editor.Commands;

  commands.add(SECTION_COMMANDS.ALIGN_HEADING, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const headingRow = selectedSection
        .components()
        .find((component) => component.is(SECTION_HEADING_ROW_TYPE));
      const trait = headingRow.getTrait("headingAlignment");
      if (!trait) return;
      const currentAlignment = trait.getValue();
      const alignments = trait.attributes.options?.map((opt) => opt.value);
      const nextAlignment =
        alignments?.[
          (alignments.indexOf(currentAlignment) + 1) % alignments.length
        ];
      headingRow.addAttributes({
        headingAlignment: nextAlignment,
      });
    },
  });

  commands.add(SECTION_COMMANDS.ALIGN_DISH, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const dishes = selectedSection.findType(DISH_TYPE);
      if (dishes.length === 0) return;
      const firstDish = dishes[0];
      const trait = firstDish.getTrait("dishAlignment");
      if (!trait) return;
      const currentAlignment = trait.getValue();
      const alignments = trait.attributes.options?.map((opt) => opt.value);
      const nextAlignment =
        alignments?.[
          (alignments.indexOf(currentAlignment) + 1) % alignments.length
        ];

      dishes.forEach((dish) => {
        dish.addAttributes({
          dishAlignment: nextAlignment,
        });
      });
    },
  });

  commands.add(SECTION_COMMANDS.UPDATE_COLUMNS, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const trait = selectedSection.getTrait("sectionColumnTotal");
      if (!trait) return;
      const currentColumns = parseInt(trait.getValue());
      const maxColumns = trait.attributes.max
        ? parseInt(trait.attributes.max)
        : 1;
      const minColumns = trait.attributes.min
        ? parseInt(trait.attributes.min)
        : 1;
      const step = trait.attributes.step || 1;
      const nextColumns = spinNumber(
        currentColumns,
        minColumns,
        maxColumns,
        step
      );
      selectedSection.addAttributes({
        sectionColumnTotal: nextColumns,
      });
    },
  });

  commands.add(SECTION_COMMANDS.ADD_DISH, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!selectedComponent) {
        editor.getComponents();
        const sections = editor
          .getWrapper()
          .components()
          .models.filter(isSection);
        if (sections.length === 0) return;
        const lastSection = sections[sections.length - 1];
        addDishAndSelect(lastSection, editor);
        return;
      } else if (selectedComponent.is(SECTION_TYPE)) {
        addDishAndSelect(selectedComponent, editor);
        return;
      }
      const closestSection = selectedComponent.closestType(SECTION_TYPE);
      addDishAndSelect(closestSection, editor);
    },
  });

  commands.add(SECTION_COMMANDS.ADD_SPACER, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) {
        editor.getComponents();
        const sections = editor
          .getWrapper()
          .components()
          .models.filter(isSection);
        if (sections.length === 0) return;
        const lastSection = sections[sections.length - 1];
        addSpacerAndSelect(lastSection, editor);
        return;
      }
      addSpacerAndSelect(selectedComponent, editor);
    },
  });

  commands.add(SECTION_COMMANDS.ALIGN_DISH_PRICE, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const dishes = selectedSection.findType(DISH_TYPE);
      if (dishes.length === 0) return;
      const firstDish = dishes[0];
      const trait = firstDish.getTrait("priceAlignment");
      if (!trait) return;
      const currentAlignment = trait.getValue();
      const alignments = trait.attributes.options?.map((opt) => opt.value);
      const nextAlignment =
        alignments?.[
          (alignments.indexOf(currentAlignment) + 1) % alignments.length
        ];

      dishes.forEach((dish) => {
        dish.addAttributes({
          priceAlignment: nextAlignment,
        });
      });
    },
  });

  commands.add(SECTION_COMMANDS.POSITION_DESCRIPTION, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const dishes = selectedSection.findType(DISH_TYPE);
      if (dishes.length === 0) return;
      const firstDish = dishes[0];
      const trait = firstDish.getTrait("descriptionInLine");
      if (!trait) return;
      const isDescriptionInline = trait.getValue();
      dishes.forEach((dish) => {
        dish.addAttributes({
          descriptionInLine: !isDescriptionInline,
        });
      });
    },
  });

  commands.add(SECTION_COMMANDS.TOGGLE_ADD_ON, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const trait = selectedSection.getTrait("hasAddOn");
      if (!trait) return;
      const currentAddOn = trait.getValue();
      selectedSection.addAttributes({
        hasAddOn: !currentAddOn,
      });
    },
  });

  commands.add(SECTION_COMMANDS.BRING_FORWARD, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const style = selectedSection.getStyle();
      const zIndex = style["z-index"];
      const currentZIndex =
        zIndex !== undefined || zIndex !== null ? parseInt(zIndex) : 1;
      selectedSection.setStyle({
        ...style,
        "z-index": currentZIndex + 1,
      });
    },
  });

  commands.add(SECTION_COMMANDS.SEND_BACKWARD, {
    run: (editor) => {
      const selectedComponent = editor.getSelected();
      if (!isSection(selectedComponent)) return;
      const selectedSection = selectedComponent;
      const style = selectedSection.getStyle();
      const zIndex = style["z-index"];
      const currentZIndex =
        zIndex !== undefined || zIndex !== null ? parseInt(zIndex) : 1;
      selectedSection.setStyle({
        ...style,
        "z-index": currentZIndex - 1,
      });
    },
  });

  commands.add(SECTION_COMMANDS.UPDATE_COLUMN_PADDING, {
    run: (editor, _, options = { value: 0 }) => {
      const { value } = options;
      editor.Css.setRule(`.section ${SECTION_BODY_SELECTOR}`, {
        ...editor.Css.getRule(`.section ${SECTION_BODY_SELECTOR}`)?.getStyle(),
        gap: `${value}px`,
      });
      editor.Css.setRule(`.section ${SECTION_HEADING_ROW_SELECTOR}`, {
        ...editor.Css.getRule(
          `.section ${SECTION_HEADING_ROW_SELECTOR}`
        )?.getStyle(),
        gap: `${value}px`,
      });
    },
  });
}

function addDishAndSelect(
  section: grapesjs.Component,
  editor: grapesjs.Editor
) {
  const sectionBody = section
    .components()
    .find((component) => component.is(SECTION_BODY_TYPE));
  if (!sectionBody) return;
  const sectionColumnWithLeastMenuItems =
    getLeastItemSectionColumn(sectionBody);
  const currentDish = sectionBody.findType(DISH_TYPE)[0];
  const newDish = sectionColumnWithLeastMenuItems.components().add({
    ...defaultDishComponent,
    attributes: currentDish.getAttributes(),
    style: currentDish.getStyle(),
  });
  if (!newDish) return;
  setTimeout(() => {
    editor.select(newDish);
  });
}

function addSpacerAndSelect(
  section: grapesjs.Component,
  editor: grapesjs.Editor
) {
  const sectionBody = section
    .components()
    .find((component) => component.is(SECTION_BODY_TYPE));
  if (!sectionBody) return;
  const sectionColumnWithLeastMenuItems =
    getLeastItemSectionColumn(sectionBody);
  const newSpacer = sectionColumnWithLeastMenuItems
    .components()
    .add(defaultSpacerComponent);
  if (!newSpacer) return;
  setTimeout(() => {
    editor.select(newSpacer);
  });
}

function getLeastItemSectionColumn(sectionBody: grapesjs.Component) {
  const sectionColumns = sectionBody.components().models;
  return sectionColumns.reduce((leastMenuItemsColumn, column) => {
    if (
      column.find(MENU_ITEM_SELECTOR).length <
      leastMenuItemsColumn.find(MENU_ITEM_SELECTOR).length
    ) {
      return column;
    }
    return leastMenuItemsColumn;
  }, sectionColumns[0]);
}
