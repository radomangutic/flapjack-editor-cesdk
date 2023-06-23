import { MenuExporter } from "./MenuExporter";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type MenuPDFExporterOptions = Partial<{
  /**
   * Page size unit
   * @default "px"
   */
  unit: "px" | "in";
}>;

const defaultOptions: Required<MenuPDFExporterOptions> = {
  unit: "px",
};

export class MenuPDFExporter implements MenuExporter {
  private readonly doc: jsPDF;
  private readonly options: MenuPDFExporterOptions;
  constructor(
    private readonly bodyElements: HTMLBodyElement[],
    width: number,
    height: number,
    options: MenuPDFExporterOptions = defaultOptions
  ) {
    this.options = { ...defaultOptions, ...options };
    this.doc = new jsPDF({
      unit: options.unit,
      format: [width, height],
    });
  }

  async export(): Promise<void> {
    for (const bodyElement of this.bodyElements) {
      const [pageWidth, pageHeight] = [
        this.doc.internal.pageSize.getWidth(),
        this.doc.internal.pageSize.getHeight(),
      ];

      // Adding a canvas element to the editor document for `html2canvas` to use the correct fonts.
      const canvas = document.createElement("canvas");

      // Scale the menu for higher image quality.
      const scale = 5;
      canvas.width = pageWidth * this.scaleFactor() * scale;
      canvas.height = pageHeight * this.scaleFactor() * scale;
      canvas.style.display = "none";
      bodyElement.appendChild(canvas);

      // Convert the menu to an image to make sure the text has the correct font.
      // Then add the image to the pdf file.
      await html2canvas(bodyElement, {
        canvas: canvas,
        scale,
        logging: false,
      });
      const imageSrc = canvas.toDataURL();
      this.doc.addImage(imageSrc, "PNG", 0, 0, pageWidth, pageHeight);
      this.doc.addPage();
      bodyElement.removeChild(canvas);
    }
    // Remove the last blank page
    this.doc.deletePage(this.doc.getNumberOfPages());

    this.doc.save("menu.pdf");
  }

  private scaleFactor(): number {
    switch (this.options.unit) {
      case "in":
        return 96;
      case "px":
      default:
        return 1;
    }
  }
}
