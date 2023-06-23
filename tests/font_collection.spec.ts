import { test, expect } from "./fixtures/template_page.fixture";
import { resetDatabase } from "./helpers/database.helper";
import path from "path";
import { FLAPJACK_FILE } from "./config/constants";

const FONT_COLLECTION_NAME = "Modern Font Collection";

test.describe("Font Collection", () => {
  // Sign in as Flapjack User
  test.use({ storageState: FLAPJACK_FILE });

  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("update font collection", async ({ page }) => {
    /**
     * Create a new font called "Modern Font Collection"
     */
    // Click the add font collection button
    const insertSectionButton = page.getByRole("button", {
      name: "Section Selector",
    });
    await insertSectionButton.click();

    const paletteButton = page.getByRole("button", { name: "palette" });
    await paletteButton.click();
    await page.locator(".mantine-Stack-root > button").first().click();
    await page.getByPlaceholder("Font Collection Name").click();
    await page
      .getByPlaceholder("Font Collection Name")
      .fill(FONT_COLLECTION_NAME);

    const menuFontFamilySelect = page.getByLabel("Menu Font *");
    const headerFontFamilySelect = page.getByLabel("Header Font *");
    const dishTitleFontFamilySelect = page.getByLabel("Title Font *");
    const dishDescriptionFontFamilySelect = page.getByLabel("Body Font *");
    const menuTitleFontSizeInput = page.getByLabel("Menu Title Font Size");
    const sectionHeaderFontSizeInput = page.getByLabel(
      "Section Header Font Size"
    );
    const dishTitleFontSizeInput = page.getByLabel("Dish Title Font Size");
    const dishDescriptionFontSizeInput = page.getByLabel("Dish Body Font Size");

    // Set font family
    await menuFontFamilySelect.click();
    await page.getByRole("option", { name: "Abel" }).click();
    await headerFontFamilySelect.click();
    await page.getByRole("option", { name: "Abel" }).click();
    await dishTitleFontFamilySelect.click();
    await page.getByRole("option", { name: "Abel" }).click();
    await dishDescriptionFontFamilySelect.click();
    await page.getByRole("option", { name: "Abel" }).click();

    // Set font size
    await menuTitleFontSizeInput.click();
    await menuTitleFontSizeInput.fill("16");
    await sectionHeaderFontSizeInput.click();
    await sectionHeaderFontSizeInput.fill("16");
    await dishTitleFontSizeInput.click();
    await dishTitleFontSizeInput.fill("16");
    await dishDescriptionFontSizeInput.click();
    await dishDescriptionFontSizeInput.fill("16");

    // Save font collection
    await page.getByRole("button", { name: "Save" }).click();

    // Update the font collection
    await paletteButton.click();
    const newFontCollectionButton = page.getByRole("button", {
      name: FONT_COLLECTION_NAME,
    });
    await newFontCollectionButton.click();

    // Make sure the font is updated in the canvas
    const canvasFrame = page.frameLocator(".gjs-frame");
    const sectionHeaderText = canvasFrame.getByText("Heading").first();
    const dishTitleText = canvasFrame.getByText("Title").first();
    const descriptionText = canvasFrame.getByText("Description").first();
    await expect(sectionHeaderText).toHaveCSS("font-size", "16px");
    await expect(dishTitleText).toHaveCSS("font-size", "16px");
    await expect(descriptionText).toHaveCSS("font-size", "16px");

    // Check the font collection value
    const editFontButton = page
      .locator(`.mantine-Indicator-root`, { hasText: FONT_COLLECTION_NAME })
      .first()
      .locator(".icon")
      .first();
    await editFontButton.click();

    // Set font family
    await menuFontFamilySelect.click();
    await page.getByRole("option", { name: "Bentham" }).click();
    await headerFontFamilySelect.click();
    await page.getByRole("option", { name: "Bentham" }).click();
    await dishTitleFontFamilySelect.click();
    await page.getByRole("option", { name: "Bentham" }).click();
    await dishDescriptionFontFamilySelect.click();
    await page.getByRole("option", { name: "Bentham" }).click();

    // Update font size
    await sectionHeaderFontSizeInput.click();
    await sectionHeaderFontSizeInput.fill("24");
    await dishTitleFontSizeInput.click();
    await dishTitleFontSizeInput.fill("17");
    await dishDescriptionFontSizeInput.click();
    await dishDescriptionFontSizeInput.fill("15");
    await menuTitleFontSizeInput.click();
    await menuTitleFontSizeInput.fill("30");
    await page.getByRole("button", { name: "Update" }).click();

    await expect(sectionHeaderText).toHaveCSS("font-size", "24px");
    await expect(dishTitleText).toHaveCSS("font-size", "17px");
    await expect(descriptionText).toHaveCSS("font-size", "15px");
  });

  test("upload font collection", async ({ page }) => {
    /**
     * Create a new font called "Modern Font Collection"
     */
    // Click the add font collection button
    const insertSectionButton = page.getByRole("button", {
      name: "Section Selector",
    });
    await insertSectionButton.click();

    const paletteButton = page.getByRole("button", { name: "palette" });
    await paletteButton.click();
    await page.locator(".mantine-Stack-root > button").first().click();
    await page.getByPlaceholder("Font Collection Name").click();
    await page
      .getByPlaceholder("Font Collection Name")
      .fill(FONT_COLLECTION_NAME);

    // Upload font
    const menuFontUploadButton = page
      .locator("div")
      .filter({
        hasText: /^Menu Title Font SizeApply SizeMenu Font \*Upload font$/,
      })
      .getByRole("button", { name: "Upload font" });
    const headerFontUploadButton = page
      .locator("div")
      .filter({
        hasText:
          /^Section Header Font SizeApply SizeHeader Font \*Upload font$/,
      })
      .getByRole("button", { name: "Upload font" });
    const dishTitleFontUploadButton = page
      .locator("div")
      .filter({
        hasText: /^Dish Title Font SizeApply SizeTitle Font \*Upload font$/,
      })
      .getByRole("button", { name: "Upload font" });
    const dishBodyFontUploadButton = page
      .locator("div")
      .filter({
        hasText: /^Dish Body Font SizeApply SizeBody Font \*Upload font$/,
      })
      .getByRole("button", { name: "Upload font" });

    const uploadButtons = [
      menuFontUploadButton,
      headerFontUploadButton,
      dishTitleFontUploadButton,
      dishBodyFontUploadButton,
    ];
    for (const button of uploadButtons) {
      const fileChooserPromise = page.waitForEvent("filechooser");
      await button.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(
        path.resolve(__dirname, "./helpers/data/Roboto-Regular.ttf")
      );
    }
    await page.getByRole("button", { name: "Save" }).click();

    // Update the font collection
    await paletteButton.click();
    const newFontCollectionButton = page.getByRole("button", {
      name: FONT_COLLECTION_NAME,
    });
    await newFontCollectionButton.click();

    // Make sure the font is updated in the canvas
    const canvasFrame = page.frameLocator(".gjs-frame");
    const sectionHeaderText = canvasFrame.getByText("Heading").first();
    const dishTitleText = canvasFrame.getByText("Title").first();
    const descriptionText = canvasFrame.getByText("Description").first();
    await expect(sectionHeaderText).toHaveCSS("font-family", /Roboto/);
    await expect(dishTitleText).toHaveCSS("font-family", /Roboto/);
    await expect(descriptionText).toHaveCSS("font-family", /Roboto/);
  });
});
