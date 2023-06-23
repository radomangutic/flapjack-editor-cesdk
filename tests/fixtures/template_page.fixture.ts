import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/googleapis\.com/, async (route) => {
      route.fulfill({
        json: {
          items: [
            {
              category: "sans-serif",
              family: "Abel",
              files: {
                regular:
                  "http://fonts.gstatic.com/s/abel/v18/MwQ5bhbm2POE6VhLPJp6qGI.ttf",
              },
              kind: "webfonts#webfont",
              lastModified: "2022-09-22",
              subsets: ["latin"],
              variants: ["regular"],
              version: "v18",
            },
            {
              category: "serif",
              family: "Bentham",
              files: {
                regular:
                  "http://fonts.gstatic.com/s/bentham/v18/VdGeAZQPEpYfmHglKWw7CJaK_y4.ttf",
              },
              kind: "webfonts#webfont",
              lastModified: "2022-09-22",
              subsets: ["latin"],
              variants: ["regular"],
              version: "v18",
            },
          ],
        },
      });
    });

    await page.goto("/template");
    await use(page);
  },
});

export { expect } from "@playwright/test";
