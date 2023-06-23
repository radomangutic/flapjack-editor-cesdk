import grapesjs from "grapesjs";
import { SECTION_TYPE } from "./constants";

export function isSection(
  component: grapesjs.Component | null
): component is grapesjs.Component {
  if (!component) return false;
  return component.is(SECTION_TYPE);
}
