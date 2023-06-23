import { toPng as htmlToPng } from "html-to-image";
import { MenuExporter } from "./MenuExporter";

export class MenuImageExporter implements MenuExporter {
  constructor(
    private readonly htmlElement: HTMLElement,
    private readonly width: number,
    private readonly height: number
  ) {}

  async export(): Promise<void> {
    const dataURL = await htmlToPng(this.htmlElement, {
      width: this.width,
      height: this.height,
    });
    const image = new Image();
    image.src = dataURL;
    const downloadLink = document.createElement("a");
    downloadLink.download = "template.png";
    downloadLink.href = dataURL;
    downloadLink.click();
  }
}
