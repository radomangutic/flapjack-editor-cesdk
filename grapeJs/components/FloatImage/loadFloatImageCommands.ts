import grapesjs from "grapesjs";
import { FLOAT_IMAGE_COMMANDS } from "./constants";
import { defaultFloatImageComponent } from "./floatImageModel";
import { isFloatImage } from "./utils";

export function loadFloatImageCommands(editor: grapesjs.Editor) {
  editor.Commands.add(FLOAT_IMAGE_COMMANDS.ADD, {
    run: (editor: grapesjs.Editor) => {
      editor.Components.addComponent(
        {
          ...defaultFloatImageComponent,
          style: {
            ...defaultFloatImageComponent.style,
            top: 0,
            left: 0,
          },
        },
        {}
      );
    },
  });

  editor.Commands.add(FLOAT_IMAGE_COMMANDS.BRING_FORWARD, {
    run: (editor: grapesjs.Editor) => {
      const selectedComponent = editor.getSelected();
      if (!isFloatImage(selectedComponent)) return;
      const selectedFloatImage = selectedComponent;
      const style = selectedFloatImage.getStyle();
      const zIndex = style["z-index"];
      const currentZIndex =
        zIndex !== undefined || zIndex !== null ? parseInt(zIndex) : 1;
      selectedFloatImage.setStyle({
        ...style,
        "z-index": currentZIndex + 1,
      });
    },
  });

  editor.Commands.add(FLOAT_IMAGE_COMMANDS.SEND_BACKWARD, {
    run: (editor: grapesjs.Editor) => {
      const selectedComponent = editor.getSelected();
      if (!isFloatImage(selectedComponent)) return;
      const selectedFloatImage = selectedComponent;
      const style = selectedFloatImage.getStyle();
      const zIndex = style["z-index"];
      const currentZIndex =
        zIndex !== undefined || zIndex !== null ? parseInt(zIndex) : 1;
      selectedFloatImage.setStyle({
        ...style,
        "z-index": currentZIndex - 1,
      });
    },
  });
}
