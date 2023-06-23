import grapesjs from "grapesjs";
import { IToolBar } from "../interfaces/IToolBar";
import { defaultHeaderComponent, defaultFloatImageComponent, defaultFooterComponent, defaultSectionComponent } from "./components";
import { defaultDishComponent } from "./components/Section/Dish";

export const loadBlocks = (editor: grapesjs.Editor) => {
  // Header Block
  editor.BlockManager.getAll().remove("header");
  editor.BlockManager.add("header", {
    label: "Header",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-card-heading" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M3 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0-5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1z"/>
    </svg>`,
    category: {
      label: "Flapjack",
      //@ts-ignore
      order: -1,
      open: true,
    },
    content: defaultHeaderComponent,
    attributes: {
      title: "Insert header",
    },
  });

  //Footer Block
  editor.BlockManager.getAll().remove("footer");
  editor.BlockManager.add("footer", {
    label: "Footer",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-card-heading" viewBox="0 0 16 16">
    <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
    <path d="M3 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0-5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1z"/>
  </svg>`,
    category: {
      label: "Flapjack",
      //@ts-ignore
      order: -1,
      open: true,
    },
    content: defaultFooterComponent,
    attributes: {
      title: "Insert footer",
    },
  });
  // image block
  editor.BlockManager.getAll().remove("image");
  editor.BlockManager.add("image", {
    label: "Image",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
    </svg>`,
    content: defaultFloatImageComponent,
    category: {
      label: "Flapjack",
      //@ts-ignore
      order: -1,
      open: true,
    },
    activate: true,
  });
  // menu-item block
  editor.BlockManager.getAll().remove("menu-item");
  editor.BlockManager.add("menu-item", {
    label: "Menu Item",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-justify-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
    </svg>`,
    content: defaultDishComponent,
    category: {
      label: "Flapjack",
      //@ts-ignore
      order: -1,
      open: true,
    },
    attributes: {
      title: "Insert Menu Item",
    },
  });
  // section block
  editor.BlockManager.getAll().remove("section");
  editor.BlockManager.add("section", {
    label: "Section",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-justify-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
    </svg>`,
    content: defaultSectionComponent,
    category: {
      label: "Flapjack",
      //@ts-ignore
      order: -1,
      open: true,
    },
    attributes: {
      title: "Insert Text block",
    },
  });

  // REMOVE TOOLBAR BLUE ICON
  editor.DomComponents.getTypes().forEach((elType) => {
    let { model: oldModel, view: oldView } = elType;
    editor.DomComponents.addType(elType.id, {
      model: oldModel.extend({
        initToolbar() {
          oldModel.prototype.initToolbar.apply(this, arguments);
          const toolbar = this.get("toolbar");
          if (toolbar?.some((item: IToolBar) => typeof item?.command === "function")) {
            toolbar.splice(0, 1);
            const commandIndex = toolbar?.findIndex(
              (item: IToolBar) => item?.command === "tlb-delete"
            );
            if (commandIndex) {
              toolbar[commandIndex] = {
                ...toolbar[commandIndex],
                label: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"  viewBox="0 0 24 24" fill="none">
                <path d="M9.09155 9.78809H11.031V16.3334H9.09155V9.78809Z" />
                <path d="M12.9695 9.78784H14.9089V16.3332H12.9695V9.78784Z"/>
                <path d="M15.3937 3.96962C15.3937 3.71259 15.2916 3.46586 15.1098 3.28409C14.9279 3.10214 14.6813 3 14.4241 3H9.57565C9.31845 3 9.07189 3.10214 8.88994 3.28409C8.70816 3.46587 8.60602 3.71258 8.60602 3.96962V5.66651L4 5.66668V7.60609H5.69691V18.9998C5.69691 19.2569 5.79922 19.5036 5.981 19.6854C6.16278 19.8673 6.4095 19.9694 6.66671 19.9694H17.3333C17.5905 19.9694 17.8372 19.8673 18.019 19.6854C18.2008 19.5036 18.3031 19.2569 18.3031 18.9998V7.60609H20V5.66685H15.394L15.3937 3.96962ZM10.5453 4.93938H13.4545V5.66669H10.5453V4.93938ZM16.3634 7.60592V18.03H7.63621V7.60592H16.3634Z"/>
                </svg>`,
              };
            }

            const commandIndexCopy = toolbar?.findIndex(
              (item: IToolBar) => item?.command === "tlb-clone"
            );
            if (commandIndexCopy) {
              toolbar[commandIndexCopy] = {
                ...toolbar[commandIndexCopy],
                label: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="darkIcon"   viewBox="0 0 24 24" fill="none">
                <path  d="M7.59974 17.3989H5.3499C4.60437 17.3989 4 16.7946 4 16.049V4.3499C4 3.60437 4.60437 3 5.3499 3H17.049C17.7946 3 18.3989 3.60437 18.3989 4.3499V6.59974"  stroke-width="1.97985"/>
                <mask id="path-2-inside-1_501_9237" fill="white">
                <rect x="5.80127" y="4.80127" width="16.1988" height="16.1988" rx="1.3499"/>
                </mask>
                <rect x="5.80127" y="4.80127" width="16.1988" height="16.1988" rx="1.3499"  stroke-width="3.95971" mask="url(#path-2-inside-1_501_9237)"/>
                </svg>`,
              };
            }
          }
          this.set("toolbar", toolbar);
        },
      }),
      view: oldView,
    });
  });

  // RTE
  const rte = editor.RichTextEditor
  rte.remove('bold')
  rte.remove('italic')
  rte.remove('underline')
  rte.remove('strikethrough')
  rte.remove('link')
  rte.remove('wrap')

  editor.BlockManager.getAll().remove("add-on");
  editor.BlockManager.add("add-on", {
    label: "Add On",
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-building-add" viewBox="0 0 16 16">
    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Z"/>
    <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5a.5.5 0 0 1-1 0V1H3v14h3v-2.5a.5.5 0 0 1 .5-.5H8v4H3a1 1 0 0 1-1-1V1Z"/>
    <path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
  </svg>`,
    content: {
      tagName: "table",
      type: "table",
      attributes: { class: "add-on" },
      components: [
        {
          tagName: "tbody",
          type: "tbody",
          components: [
            {
              tagName: "tr",
              type: "row",
              components: [
                {
                  tagName: "td",
                  type: "cell",
                  attributes: { class: "font-header color-primary" },
                  components: ["<div>Item</div>"],
                },
                {
                  tagName: "td",
                  type: "cell",
                  components: ["<div>Price</div>"],
                },
              ],
            },
          ],
        },
      ],
    },
    category: "Basic",
    attributes: {
      title: "Insert Add on",
    },
  });
};
