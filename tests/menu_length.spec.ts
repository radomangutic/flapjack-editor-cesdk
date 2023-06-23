import { test, expect } from "./fixtures/template_page.fixture";

const MIN_FONT_SIZE = 4;

test.describe("Menu Length", () => {
  test("Does not show alert when the page is not overflown", async ({
    page,
  }) => {
    const insertSectionButton = page.getByRole("button", {
      name: "Section Selector",
    });

    const canvasFrame = page.frameLocator(".gjs-frame");
    const wrapperElement = canvasFrame
      .locator('div[data-gjs-type="wrapper"]')
      .first();

    // Add 13 sections to the menu
    const SECTION_COUNT = 13;
    await insertSectionButton.click({ delay: 100, clickCount: SECTION_COUNT });

    // All the sections are added to the menu
    const sections = canvasFrame.getByText(/Heading/);
    await expect(sections).toHaveCount(SECTION_COUNT);

    const lastSectionHeading = sections.nth(SECTION_COUNT - 1);
    const warningTitle = page.getByText("Extra Content");

    await expect(warningTitle).toBeHidden();
    // Check if the wrapper element is overflown
    const isOverflown = await wrapperElement.evaluate(elIsOverflown);
    expect(isOverflown).toBe(false);
    // The last section heading is visible and the warning is hidden
    const isLastSectionHeadingVisible = await lastSectionHeading.evaluate(
      elIsVisibleInWrapper
    );
    expect(isLastSectionHeadingVisible).toBe(true);
  });

  test("Shows alert when the page is overflown", async ({ page }) => {
    const insertSectionButton = page.getByRole("button", {
      name: "Section Selector",
    });
    // Add a large number of sections to make the menu overflow
    const SECTION_COUNT = 30;
    await insertSectionButton.click({
      delay: 100,
      clickCount: SECTION_COUNT,
    });

    const canvasFrame = page.frameLocator(".gjs-frame");
    const wrapperElement = canvasFrame
      .locator('div[data-gjs-type="wrapper"]')
      .first();

    // All the sections are added to the menu
    const sections = canvasFrame.getByText(/Heading/);
    await expect(sections).toHaveCount(SECTION_COUNT);

    const lastSectionHeading = sections.nth(SECTION_COUNT - 1);
    const warningTitle = page.getByText("Extra Content").first();

    // Check if the wrapper element is overflown
    const isOverflown = await wrapperElement.evaluate(elIsOverflown);
    expect(isOverflown).toBe(true);
    // The last section heading is hidden and the warning is visible
    const isLastSectionHeadingVisible = await lastSectionHeading.evaluate(
      elIsVisibleInWrapper
    );
    expect(isLastSectionHeadingVisible).toBe(false);
    await expect(warningTitle).toBeVisible();
    await expect(wrapperElement).toHaveCSS("font-size", `${MIN_FONT_SIZE}px`, {
      timeout: 10000,
    });
  });
});

function elIsVisibleInWrapper(el: HTMLElement) {
  const wrapper: HTMLElement | null = el.closest(
    'div[data-gjs-type="wrapper"]'
  );
  const wrapperHeight = wrapper?.offsetHeight;
  const elBoundingRect = el.getBoundingClientRect();
  const elTop = elBoundingRect.top;
  if (!wrapperHeight) return false;
  return elTop < wrapperHeight;
}

function elIsOverflown(el: HTMLElement) {
  return el.clientHeight < el.scrollHeight;
}
