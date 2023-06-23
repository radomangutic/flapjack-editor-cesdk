import { test, expect } from './fixtures/template_page.fixture'
import { Page, Locator } from "@playwright/test";
import { resetDatabase } from "./helpers/database.helper";
import path from "path";
import { FLAPJACK_FILE } from "./config/constants";

test.describe("Paddings", () => {
  // Sign in as Flapjack User
  test.use({ storageState: FLAPJACK_FILE });

  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("apply paddings correctly", async ({ page }) => {
    page.waitForSelector(".gjs-frame");
    const canvasFrame = page.frameLocator(".gjs-frame");

    // Add section with 3 columns
    await page.getByRole("button", { name: "Section Selector" }).click();
    const adjustColumnButton = page.locator(".darkIcon > rect").first();
    await adjustColumnButton.click();

    await adjustColumnButton.click();

    const sectionColumnNumber = await canvasFrame.locator(".section-col").count()
    expect(sectionColumnNumber).toEqual(3);

    await page.getByRole("button", { name: "palette" }).click();
    const horizontalPaddingThumb = page
      .locator(".mantine-Slider-thumb")
      .first();
    const verticalPaddingThumb = page.locator(".mantine-Slider-thumb").nth(1);
    const columnPaddingThumb = page.locator(".mantine-Slider-thumb").nth(2);

    const horizontalPaddingSlider = page
      .locator(".mantine-Slider-root")
      .first();
    const verticalPaddingSlider = page.locator(".mantine-Slider-root").nth(1);
    const columnPaddingSlider = page.locator(".mantine-Slider-root").nth(2);

    await changeSlider(
      page,
      horizontalPaddingThumb,
      horizontalPaddingSlider,
      20
    );
    await changeSlider(page, verticalPaddingThumb, verticalPaddingSlider, 30);
    await changeSlider(page, columnPaddingThumb, columnPaddingSlider, 50);

    // Make sure the paddings are updated in the canvas
    const menuBodyElement = canvasFrame.locator(
      'menu-body'
    );
    await expect(menuBodyElement).toHaveCSS("padding-right", "20px");
    await expect(menuBodyElement).toHaveCSS("padding-left", "20px");
    await expect(menuBodyElement).toHaveCSS("padding-top", "30px");
    await expect(menuBodyElement).toHaveCSS("padding-bottom", "30px");

    const sectionColumn = canvasFrame.locator("section-body").first();
    await expect(sectionColumn).toHaveCSS("gap", "50px");
  });
});

async function changeSlider(
  page: Page,
  thumb: Locator,
  slider: Locator,
  targetValue: number
) {
  const thumbBoundingBox = await thumb.boundingBox();
  const sliderBoundingBox = await slider.boundingBox();
  const maxSliderValueStr = await thumb.getAttribute("aria-valuemax");

  if (
    thumbBoundingBox === null ||
    sliderBoundingBox === null ||
    maxSliderValueStr === null
  )
    return;

  const startPoint = {
    x: thumbBoundingBox.x + thumbBoundingBox.width / 2,
    y: thumbBoundingBox.y + thumbBoundingBox.height / 2,
  };

  const maxSliderValue = parseFloat(maxSliderValueStr);
  const targetValuePercent = targetValue / maxSliderValue;

  const endPoint = {
    x: sliderBoundingBox.x + sliderBoundingBox.width * targetValuePercent,
    y: thumbBoundingBox.y + thumbBoundingBox.height / 2,
  };

  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y);
  await page.mouse.up();
}
