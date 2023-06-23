type RectDim = {
  t: number;
  l: number;
  w: number;
  h: number;
};

/**
 * The width cannot be resized off canvas according to this pull request https://github.com/GrapesJS/grapesjs/pull/1736/commits/6a823ddd8ac6f2c3887dea0de9818a316d225995
 *
 * For the resizer options, learn more at https://github.com/GrapesJS/grapesjs/blob/971bbffbc52f5ee4226fa4ef32a157ec85b1303a/src/utils/Resizer.ts#L26
 *
 * [The default `updateTarget` method](https://github.com/GrapesJS/grapesjs/blob/a2ca4b1a93520e61cc7e49a42f103d5887e33cf2/src/commands/view/SelectComponent.ts#L448-L452) limits the size of the image to the size of the canvas
 *
 * We have to customize `updateTarget` method to have component that has larger size than the canvas.
 */
export const imageResizerOptions = {
  updateTarget: (el: HTMLElement, rect: RectDim, opts: any) => {
    const { config, selectedHandler } = opts;
    const { keyWidth, keyHeight, unitHeight, unitWidth } = config;
    const onlyHeight = ["tc", "bc"].indexOf(selectedHandler) >= 0;
    const onlyWidth = ["cl", "cr"].indexOf(selectedHandler) >= 0;
    if (!onlyHeight) {
      el.style[keyWidth] = `${rect.w}${unitWidth}`;
    }
    if (!onlyWidth) {
      el.style[keyHeight] = `${rect.h}${unitHeight}`;
    }

    // Shift the image left and up to keep the image position.
    // This transform will be reset on the next resize, which causes the content shift issue.
    // The image position have to be updated after resizing not to move image on the next resize.
    // @see {@link ./loadFloatImageEvents.ts}
    const shiftLeft = rect.l;
    const shiftTop = rect.t;
    el.style.transform = `translateX(${shiftLeft}px) translateY(${shiftTop}px)`;
  },
  ratioDefault: true,
};
