import { test, expect } from "./fixtures/template_page.fixture";
import { resetDatabase } from "./helpers/database.helper";

test.describe("Color Palette", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("apply color palette correctly", async ({ page }) => {
    await page.locator("#mantine-rn-target").click();
    await page.getByRole("button", { name: "ICO Add Header" }).click();
    await page.getByRole("button", { name: "Section Selector" }).click();
    await page.getByRole("button", { name: "palette" }).click();

    /* Select the `De La Mar` color palette.
     * @see {@link ./helpers/data/palettes.json}
     *
     * Though this selector works, it does not have any indicator that we have selected the right palette. This results in a lack of user's accessibilities.
     */
    await page.locator(".mantine-Grid-root > div:nth-child(3)").first().click();

    // Make sure the font is updated in the canvas
    const canvasFrame = page.frameLocator(".gjs-frame");
    const menuBody = canvasFrame.locator("body").first();
    const menuHeaderText = canvasFrame.locator(".menu-title").first();
    const sectionHeaderText = canvasFrame.locator(".section-heading").first();
    const dishTitleText = canvasFrame.getByText("Title").first();
    const descriptionText = canvasFrame.getByText("Description").first();

    await expect(menuBody).toHaveCSS("background-color", hexToRgb("#FFFFFF"));
    await expect(menuHeaderText).toHaveCSS("color", hexToRgb("#7194bC"));
    await expect(sectionHeaderText).toHaveCSS("color", hexToRgb("#4e667B"));
    await expect(dishTitleText).toHaveCSS("color", hexToRgb("#6fb7d1"));
    await expect(descriptionText).toHaveCSS("color", hexToRgb("#6fb7d1"));
  });
});

/**
 * PlayWright uses `getComputedStyle` in `toHaveCSS`. The color it gets always in the rgb format.
 *
 * Since the color palette uses hex value, we have to convert it to rgb to compare.
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}
