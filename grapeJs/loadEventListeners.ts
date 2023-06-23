import grapesjs from "grapesjs";
import { IUserDetails } from "../interfaces";
import { FOOTER_TYPE } from "./components";
import { showNotification } from "@mantine/notifications";

function surroundElement(
  targetElement: HTMLElement,
  wrapperElement: HTMLElement
) {
  targetElement.parentNode?.insertBefore(wrapperElement, targetElement);
  wrapperElement.appendChild(targetElement);
}

function createElement(
  tagName: keyof HTMLElementTagNameMap,
  classList: string[]
) {
  const el = document.createElement(tagName);
  classList.forEach((c) => el.classList.add(c));
  return el;
}

/**
 * Update iframe body height to iframe exact height
 */
function updateIframeBodyHeight(editor: grapesjs.Editor) {
  const iframeEl = editor.Canvas.getFrameEl();
  editor.Css.setRule("body", {
    ...editor.Css.getRule("body")?.getStyle(),
    height: iframeEl.offsetHeight + "px",
    overflow: "hidden",
  });
}

export const loadEventListeners = (
  editor: grapesjs.Editor,
  user: IUserDetails | null,
  openSubscribeModal: () => void,
  checkoutCallback: () => void,
  supaUser: any
) => {
  // @ts-ignore
  editor.on("device:select", (selectedDevice) => {
    const canvasFrames = document.querySelector<HTMLElement>(
      ".gjs-cv-canvas__frames"
    );
    const canvas = document.querySelector<HTMLElement>(".gjs-cv-canvas");
    const zoomSize = editor.Canvas.getZoom();
    const frameWrapper =
      document.querySelector<HTMLElement>(".gjs-frame-wrapper");

    // Set the frames size to the same as the content size
    if (frameWrapper && canvasFrames && canvas) {
      const deviceAttributes = selectedDevice.attributes;
      const widthUnit = String(deviceAttributes.width).replace(/[\d\.]+/, "");
      const heightUnit = String(deviceAttributes.height).replace(/[\d\.]+/, "");
      const contentWidth = parseFloat(deviceAttributes.width);
      const contentHeight = parseFloat(deviceAttributes.height);

      frameWrapper.style.width = `${contentWidth}${widthUnit}`;
      frameWrapper.style.height = `${contentHeight}${heightUnit}`;

      canvasFrames.style.width = `${contentWidth}${widthUnit}`;
      canvasFrames.style.height = `${contentHeight}${heightUnit}`;
      canvasFrames.style.position = "static";

      const zoomSizePercent = zoomSize / 100;
      canvas.style.width = `${zoomSizePercent * contentWidth}${widthUnit}`;
      canvas.style.height = `${zoomSizePercent * contentHeight}${heightUnit}`;

      // Show the toolbox in small page size
      canvas.style.overflow = "visible";

      updateIframeBodyHeight(editor);

      // Update canvas offset
      editor.refresh();
    }
  });

  // load editor document called when the editor is first loaded
  editor.on("load", () => {
    const iframeEl = editor.Canvas.getFrameEl();
    const iframeBody = editor.Canvas.getBody();
    updateIframeBodyHeight(editor);
    iframeBody.addEventListener("paste", (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain");
      //@ts-ignore
      e.target.ownerDocument.execCommand("insertText", false, text);
    });
    editor.Canvas.getFrameEl().setAttribute("data-hj-allow-iframe", "");
    // Disapear ToolBar
    const toolbarWrapper = document.querySelector(".gjs-toolbar");
    toolbarWrapper?.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    // Make the editor container has the same background as the editor
    document.querySelector(".gjs-editor-cont")?.classList.add("gjs-one-bg");

    // Add wrapper for grapesjs canvas
    if (document.querySelector(".canvas-wrapper") === null) {
      const framesWrapper = createElement("div", ["canvas-wrapper"]);
      surroundElement(editor.Canvas.getElement(), framesWrapper);
      const scrollableContent = createElement("div", ["scrollable-content"]);
      surroundElement(framesWrapper, scrollableContent);
      const scrollableWrapper = createElement("div", ["scrollable-wrapper"]);
      surroundElement(scrollableContent, scrollableWrapper);
    }
    // canvas overflow hidden
    iframeBody.style.overflow = "hidden";
  });

  // called when a component is added to the editor
  editor.on("component:add", (model) => {
    if (
      // @ts-ignore
      editor.getComponents().models.filter((model) => {
        if (model.view?.attr?.class?.includes("footer")) return true;
        return false;
      }).length > 1
    ) {
      const footerModel = editor
        .getComponents()
        //@ts-ignore
        .models.find((modeltest) => modeltest.is(FOOTER_TYPE));
      const removeFooter = footerModel.collection;
      removeFooter.remove(footerModel);
    }
  });

  // component update event, called when a component is updated in the editor
  editor.on("component:update", (model) => {
    // TODO: move this to footer component
    if (model.getClasses().includes("footer-text")) {
      const signUpbtn = document.querySelector(".sign-up");
      model.getEl().addEventListener("keydown", (e: any) => {
        if (!signUpbtn && supaUser && user && !user.subscriptionActive) {
          e.preventDefault();
          checkoutCallback();
        }
        if (signUpbtn) {
          e.preventDefault();
          openSubscribeModal();
        }
      });
      model.getEl().addEventListener("dblclick", () => {
        if (!signUpbtn && supaUser && user && !user.subscriptionActive) {
          checkoutCallback();
        }
        if (signUpbtn) {
          openSubscribeModal();
        }
      });
    }

    decreaseFontSizeIfOverflown(editor);
  });

  editor.on("component:remove", () => {
    increaseFontSize(editor);
  });
};

const MIN_FONT_SIZE = 4;

function decreaseFontSizeIfOverflown(editor: grapesjs.Editor) {
  const wrapper = editor.getWrapper();
  if (!wrapper || !wrapper.getEl()) return;

  const wrapperEl = wrapper.getEl();
  if (!isOverflown(wrapperEl)) return;
  const wrapperFontSize = parseFloat(
    window.getComputedStyle(wrapperEl).fontSize
  );
  if (wrapperFontSize <= MIN_FONT_SIZE) {
    showNotification({
      title: "Extra Content",
      message: "Please reduce content from the page",
      color: "red",
      autoClose: false,
    });
    return;
  }
  editor.getWrapper().setStyle({
    ...editor.getWrapper().getStyle(),
    "font-size": `${wrapperFontSize - 1}px}`,
  });
  decreaseFontSizeByClassName(editor, ".font-header");
  decreaseFontSizeByClassName(editor, ".font-title");
  decreaseFontSizeByClassName(editor, ".font-body");
  decreaseFontSizeIfOverflown(editor);
}

function decreaseFontSizeByClassName(
  editor: grapesjs.Editor,
  className: string
) {
  const fontSize = getFontSizeByClassName(editor, className);
  if (!fontSize) return;
  const newFontSize = fontSize - 1;
  editor.Css.setRule(className, {
    ...editor.Css.getRule(className)?.getStyle(),
    "font-size": `${newFontSize}px`,
  });
}

/**
 * Increase the font size of the text in the menu until the canvas is overflown.
 * When the canvas is overflown, decrease the font size until it is not overflown.
 */
function increaseFontSize(editor: grapesjs.Editor) {
  const wrapper = editor.getWrapper();

  if (!wrapper || !wrapper.getEl()) return;
  const wrapperEl = wrapper.getEl();
  const wrapperFontSizeStr = wrapper.getStyle()["font-size"];
  const selectedFontSize = sessionStorage.getItem("bodyFontSize");
  const maxFontSize = selectedFontSize ? parseFloat(selectedFontSize) : 16;
  if (!wrapperFontSizeStr || isOverflown(wrapperEl)) {
    decreaseFontSizeIfOverflown(editor);
    return;
  }
  const wrapperFontSize = parseFloat(wrapperFontSizeStr);
  if (wrapperFontSize >= maxFontSize) return;
  editor.getWrapper().setStyle({
    ...editor.getWrapper().getStyle(),
    "font-size": `${wrapperFontSize + 1}px`,
  });
  increaseFontSizeByClassName(editor, ".font-header");
  increaseFontSizeByClassName(editor, ".font-title");
  increaseFontSizeByClassName(editor, ".font-body");
  increaseFontSize(editor);
}

function increaseFontSizeByClassName(
  editor: grapesjs.Editor,
  className: string
) {
  const fontSize = getFontSizeByClassName(editor, className);
  if (!fontSize) return;
  const newFontSize = fontSize + 1;
  editor.Css.setRule(className, {
    ...editor.Css.getRule(className)?.getStyle(),
    "font-size": `${newFontSize}px`,
  });
}

function getFontSizeByClassName(editor: grapesjs.Editor, className: string) {
  const cssRule = editor.Css.getRule(className);
  if (!cssRule) return null;
  const fontSizeStr = cssRule.getStyle("font-size") as unknown as string;
  if (!fontSizeStr) return null;
  return parseFloat(fontSizeStr);
}


function isOverflown(el: HTMLElement) {
  const parentHeight = el.clientHeight;
  for (const child of Array.from(el.children)) {
    // Ignore images in the overflow check
    if (child.tagName === "IMG") continue;
    const { height } = child.getBoundingClientRect();

    // If the child causes overflow or is overflowing vertically, return true
    const isOverflownVertically =
      height > parentHeight || child.scrollHeight > parentHeight;
    if (isOverflownVertically) {
      return true;
    }
  }
  return false;
}