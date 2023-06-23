import grapesjs from "grapesjs";
import { ModelDefinition } from "../../shared/types";
import { FLOAT_IMAGE_TYPE } from "./constants";
import { floatImageToolbarItems } from "./floatImageToolbar";
import { imageResizerOptions } from "./imageResizerOptions";

export const defaultFloatImageComponent = {
  type: FLOAT_IMAGE_TYPE,
  name: "image",
  dmode: "absolute",
  resizable: imageResizerOptions,
  attributes: { class: "float-image" },
  style: {
    position: "absolute",
    "max-width": "none",
    "max-height": "none",
  },
};

export function floatImageModel(editor: grapesjs.Editor): ModelDefinition {
  return {
    defaults: defaultFloatImageComponent,
    init() {
      this.setupToolbar();
      this.placeOnTop();

      this.on("change:src", this.onSrcUpdate);
    },
    setupToolbar() {
      const toolbar = this.get("toolbar");
      toolbar?.unshift(...floatImageToolbarItems);
      this.set("toolbar", toolbar);
    },

    /**
     * Place the float image on top of all other components
     */
    placeOnTop() {
      const doc = editor.Canvas.getDocument();
      if (!doc) return;
      const highestZIndex = Array.from(doc.querySelectorAll("body *"))
        .map((el) => parseFloat(window.getComputedStyle(el).zIndex))
        .reduce(
          (highestZIndex, zIndex) =>
            highestZIndex < zIndex ? zIndex : highestZIndex,
          0
        );

      const style = this.getStyle();
      this.setStyle({
        ...style,
        "z-index": highestZIndex + 1,
      });
    },
    onSrcUpdate() {
      // Set the image max size to be equal to the canvas size on the first load
      const canvasBody = editor.Canvas.getBody();
      const [canvasWidth, canvasHeight] = [
        canvasBody.offsetWidth,
        canvasBody.offsetHeight,
      ];
      const image = new Image();
      const imageSource = this.sanitizeImageSource(
        this.get("src"),
        canvasWidth,
        canvasHeight
      );
      image.onload = () => {
        if (image.height === 0 || image.width === 0) return;
        // Preserve the aspect ratio of the image while scaling
        const ratio = Math.min(
          canvasWidth / image.width,
          canvasHeight / image.height
        );
        const width = image.width * ratio;
        const height = image.height * ratio;
        this.setStyle({
          ...this.getStyle(),
          width: `${width}px`,
          height: `${height}px`,
        });
        this.set("src", imageSource);
      };
      image.src = imageSource;
    },

    sanitizeImageSource(src: string, width: number, height: number) {
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
        // Init the size of the svg image if it is not pre-defined
        const viewBox = svg.getAttribute("viewBox")?.split(/\s/);
        if (svg.getAttribute("width") && svg.getAttribute("height")) return src;
        if (svg.getAttribute("width") === null) {
          svg.setAttribute("width", viewBox?.[2] || width.toString());
        }
        if (svg.getAttribute("height") === null) {
          svg.setAttribute("height", viewBox?.[3] || height.toString());
        }
        const svg64 = btoa(svg.outerHTML);
        const image64 = "data:image/svg+xml;base64," + svg64;
        return image64;
      }
      return src;
    },
  };
}
