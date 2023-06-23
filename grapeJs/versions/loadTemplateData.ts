import { V1TemplateLoader } from "./V1TemplateLoader";
import { TemplateContent } from "./types";
import { V2TemplateLoader } from "./V2TemplateLoader";

export function loadTemplateData(templateContentJSON: TemplateContent) {
  const templateVersion = templateContentJSON.meta?.version.split(/\./)[0];
  if (!templateVersion || templateVersion === "1") {
    return new V1TemplateLoader(templateContentJSON).load();
  }
  if (templateVersion === "2") {
    return new V2TemplateLoader(templateContentJSON).load();
  }
  throw new Error("Unsupported template version");
}
