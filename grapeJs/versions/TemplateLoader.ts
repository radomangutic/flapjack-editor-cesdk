import { TemplateData } from "./types";

export interface TemplateLoader {
  load(): TemplateData;
}
