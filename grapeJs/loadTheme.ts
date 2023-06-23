import { SupabaseClient } from "@supabase/supabase-js";
import grapesjs from "grapesjs";
import { IFont, IPalette } from "../interfaces";

export const loadTheme = (
  editor: grapesjs.Editor,
  selectedPalette: IPalette | null,
  selectedFont: IFont | null,
  selectedColumnsPadding: number,
  selectedHorizontalPadding: number,
  selectedVerticalPadding: number,
  supabase: SupabaseClient
) => {
  editor.Css.setRule(".flapjackFooter span", {
    color: "red",
  });
  // style  editor body
  selectedPalette &&
    editor.Css.setRule("body", {
      ...editor.Css.getRule("body")?.getStyle(),
      ...(selectedPalette && {
        color: selectedPalette.textColor,
        "background-color": selectedPalette.backgroundColor,
      }),
    });

  // style  editor wrapper
  editor.Css.setRule('[data-gjs-type="wrapper"]', {
    display: "flex",
    "flex-direction": "column",
    padding: 0,
    height: "100%",
  });

  editor.Css.setRule(".align-left", {
    "text-align": "left",
  });
  editor.Css.setRule(".align-center", {
    "text-align": "center",
  });
  editor.Css.setRule(".align-right", {
    "text-align": "right",
  });
  editor.Css.setRule(".divider", {
    "background-color": "black",
    height: "2px",
  });

  // style for selected color  Palette
  if (selectedPalette) {
    editor.Css.setRule(".background-primary", {
      "background-color": selectedPalette.primaryColor,
    });
    editor.Css.setRule(".background-secondary", {
      "background-color": selectedPalette.secondaryColor,
    });
    editor.Css.setRule(".background-tertiary", {
      "background-color": selectedPalette.tertiaryColor,
    });
    editor.Css.setRule(".color-primary", {
      color: selectedPalette.primaryColor,
    });
    editor.Css.setRule(".color-secondary", {
      color: selectedPalette.secondaryColor,
    });
    editor.Css.setRule(".color-tertiary", {
      color: selectedPalette.tertiaryColor,
    });
    editor.Css.setRule(".color-menu", {
      color: selectedPalette.menuColor,
    });
    editor.Css.setRule(".color-background", {
      color: selectedPalette.backgroundColor,
    });
    editor.Css.setRule(".divider", {
      "background-color": selectedPalette.textColor,
      height: "2px",
    });
  }
  editor.Css.setRule(".footer", {
    width: "100%",
    "text-align": "center",
    position: "fixed",
    bottom: 0,
    padding: "8px 8px 12px",
    right: 0,
  });
  editor.Css.setRule(".footer-2", {
    position: "fixed",
    width: "100%",
    bottom: 0,
    right: 0,
    padding:
      selectedHorizontalPadding > 20
        ? `0px ${selectedHorizontalPadding}px 20px ${selectedHorizontalPadding}px`
        : "0px 33px 20px 33px",
  });
  editor.Css.setRule(".footer-2 .footer-content", {
    "padding-top": "15px",
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    color: "",
  });
  editor.Css.setRule(".footer-2 .footer-content.footer-content-solid", {
    "border-top": `2px solid ${selectedPalette?.textColor || "black"}`,
  });
  editor.Css.setRule(".footer-2 .footer-content.footer-content-dashed", {
    "border-top": `2px dashed ${selectedPalette?.textColor || "black"}`,
  });
  editor.Css.setRule("spacer", {
    display: "inline-block",
  });

  editor.Css.setRule(".menu-item", {
    width: "100%",
    "border-spacing": 0,
  });
  editor.Css.setRule(".menu-item tbody", {
    "z-index": "5",
    position: "relative",
  });

  if (selectedFont) {
    const getFontURL = (
      font: Exclude<
        keyof IFont,
        | "id"
        | "name"
        | "menuFontSize"
        | "headerFontSize"
        | "titleFontSize"
        | "bodyFontSize"
      >
    ) => {
      const fontURL = selectedFont[font]?.url;
      const isCustomFont = selectedFont[font]?.custom;
      if (isCustomFont) {
        const { data } = supabase.storage.from("fonts").getPublicUrl(fontURL);
        if (data) return data.publicUrl;
      }
      return fontURL;
    };
    const menuFontUrl = getFontURL("menuFont");
    const bodyFontUrl = getFontURL("bodyFont");
    const headerFontUrl = getFontURL("headerFont");
    const titleFontUrl = getFontURL("titleFont");

    // TODO: Adding new font faces every time duplicates the font faces unnecessarily. Clear the font face before adding new ones is a better choice.
    editor.Css.addRules(
      `@font-face {
        font-family: ${selectedFont.menuFont?.name.replace(/\.[^/.]+$/, "")};
        src: url("${menuFontUrl}");
      }
      @font-face {
        font-family: ${selectedFont.bodyFont.name.replace(/\.[^/.]+$/, "")};
        src: url("${bodyFontUrl}");
      }
      @font-face {
        font-family: ${selectedFont.headerFont.name.replace(/\.[^/.]+$/, "")};
        src: url("${headerFontUrl}");
      }
      @font-face {
        font-family: ${selectedFont.titleFont.name.replace(/\.[^/.]+$/, "")};
        src: url("${titleFontUrl}");
      }`
    );
    editor.Css.setRule(".menu-title", {
      "font-family": selectedFont.menuFont
        ? selectedFont.menuFont.name.replace(/\.[^/.]+$/, "")
        : "inherit",
      "font-size": selectedFont.menuFontSize
        ? selectedFont.menuFontSize + "px" + "!important"
        : "inherit",
    });
    editor.Css.setRule(".font-title", {
      "font-family": selectedFont.titleFont.name.replace(/\.[^/.]+$/, ""),
      "font-size": selectedFont.titleFontSize + "px" + "!important",
    });
    editor.Css.setRule(".font-header", {
      "font-family": selectedFont.headerFont.name.replace(/\.[^/.]+$/, ""),
      "font-size": selectedFont.headerFontSize + "px",
    });
    editor.Css.setRule(".font-body", {
      "font-family": selectedFont.bodyFont.name.replace(/\.[^/.]+$/, ""),
      "font-size": selectedFont.bodyFontSize + "px" + "!important",
    });
    // get body prev color and backgroud color
    const { color: bodyColor, backgroundColor: bodyBackgroundColor } =
      getComputedStyle(editor.Canvas.getBody());
    editor.Css.setRule("body", {
      ...editor.Css.getRule("body")?.getStyle(),
      color: bodyColor,
      "background-color":
        bodyBackgroundColor === "rgba(0, 0, 0, 0)"
          ? "#fff"
          : bodyBackgroundColor,
      "font-family": selectedFont.bodyFont.name.replace(/\.[^/.]+$/, ""),
      "font-size": selectedFont.bodyFontSize + "px" + "!important",
    });
  }
};
