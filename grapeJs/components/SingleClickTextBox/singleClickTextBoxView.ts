import { ViewDefinition } from "../../shared/types";

export function singleClickTextBoxView(): ViewDefinition {
  return {
    events: {
      click: "active",
      dbclick: undefined,
      paste: "pasteAsPlainText",
    },
    active(e: MouseEvent) {
      // The text is able to edit with a single click only if it is hoverable
      const isHoverable = this.model.get("hoverable");
      if (!isHoverable) return;
      this.onActive(e);
    },

    /**
     * Remove empty text component after editing
     */
    onDisable() {
      const content = this.model.getEl().textContent;
      if (!content || content.length === 0) {
        this.model.remove();
      }
    },

    pasteAsPlainText(e: ClipboardEvent) {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain");
      this.model.getEl().ownerDocument.execCommand("insertText", false, text);
    },
  };
}
