import grapesjs from "grapesjs";
import { FLOAT_IMAGE_TYPE } from "./constants";

export function loadFloatImageEvents(editor: grapesjs.Editor) {
  /**
   * Using float image components to display the dropped image files.
   *
   * @see {@link https://grapesjs.com/docs/api/canvas.html#canvas}
   */
  editor.on("canvas:dragdata", (data: DataTransfer, result) => {
    if (!data.types.includes("Files")) return;
    result.content.forEach((content: any) => {
      if (content.type === "image") {
        content.type = FLOAT_IMAGE_TYPE;
      }
    });
  });

  /**
   * Catch the resize event which is triggered by [SelectComponent](https://github.com/GrapesJS/grapesjs/blob/a2ca4b1a93520e61cc7e49a42f103d5887e33cf2/src/commands/view/SelectComponent.ts#L431)
   */
  // @ts-ignore
  editor.on("component:resize", () => {
    // Update the image position after resizing to not have content shift issue
    const isResizing =
      editor.Canvas.getBody().classList.contains("gjs-resizing");
    if (isResizing) return;
    const selectedComponent = editor.getSelected();
    if (selectedComponent && selectedComponent.is(FLOAT_IMAGE_TYPE)) {
      const imageComponent = selectedComponent;
      const imageEl = imageComponent.getEl();
      const imageBoundingRect = imageEl.getBoundingClientRect();
      const translateStrings = imageEl.style.transform.match(/-?\d+/g);
      // The translate strings must have both `translateX` and `translateY` values
      if (!translateStrings || translateStrings.length < 2) return;
      const [translateX, translateY] = translateStrings.map((tValue) =>
        parseFloat(tValue)
      );
      // Update the image position
      const currentStyle = imageComponent.getStyle();
      const top = parseFloat(currentStyle.top);
      const left = parseFloat(currentStyle.left);
      imageComponent.setStyle({
        ...currentStyle,
        top: `${top + translateY}px`,
        left: `${left + translateX}px`,
        width: imageEl.style.width || `${imageBoundingRect.width}px`,
        height: imageEl.style.height || `${imageBoundingRect.height}px`,
      });
      imageEl.style.transform = "";
      imageEl.style.width = "";
      imageEl.style.height = "";
    }
  });

  /**
   * The design mode uses the [command `core:component-drag`](https://github.com/GrapesJS/grapesjs/blob/4c993c04f8e4fc824e5d1d1d4d8af53ac40fa630/src/commands/view/ComponentDrag.js#L46) to move component.
   *
   * The command uses the Dragger utility to move component. We can use the [DraggerOptions](https://github.com/GrapesJS/grapesjs/blob/971bbffbc52f5ee4226fa4ef32a157ec85b1303a/src/utils/Dragger.ts#L16) to remove the snap function from the design mode.
   */
  editor.on("run:core:component-drag:before", (options) => {
    options.dragger = {
      snapOffset: 0, // remove snapping from design mode
    };
    // canvas overflow hidden
    editor.Canvas.getBody().style.overflow = "hidden";
  });
}
