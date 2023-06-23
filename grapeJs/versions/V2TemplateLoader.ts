import { TemplateLoader } from "./TemplateLoader";
import { TemplateData } from "./types";

/**
 * Load the version 2 template
 */
export class V2TemplateLoader implements TemplateLoader {
  constructor(private template: TemplateData) {}

  load(): TemplateData {
    return this.template;
  }
}
