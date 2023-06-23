import grapesjs from "grapesjs";
import { HEADER_TYPE } from "./constants";
import { defaultHeaderComponent } from "./headerModel";

const MAX_HEADER_COUNT = 1;

export function loadHeaderCommands(editor: grapesjs.Editor) {
  editor.Commands.add("header:add", {
    run: (editor: grapesjs.Editor) => {
      const wrapper = editor.getWrapper();
      const headerCount = wrapper.findType(HEADER_TYPE).length;
      if (headerCount >= MAX_HEADER_COUNT) return;
      const header = wrapper.components().add(defaultHeaderComponent);
      header.move(wrapper, { at: 0 });
    },
  });
}
