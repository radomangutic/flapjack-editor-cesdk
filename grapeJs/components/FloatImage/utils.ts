import grapesjs from "grapesjs";
import { FLOAT_IMAGE_TYPE } from "./constants";

export function isFloatImage(
  component: grapesjs.Component | null
): component is grapesjs.Component {
  if (!component) return false;
  return component.is(FLOAT_IMAGE_TYPE);
}
