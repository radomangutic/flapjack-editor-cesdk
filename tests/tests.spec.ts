import { test, expect } from "@playwright/test";

test("Login with phone", async ({ page }) => {
  await page.goto("http://localhost:3000/templates");
  await  page
  .locator(".PhoneInputInput")
  .first().click();
  await  page
  .locator(".PhoneInputInput")
  .first()
    .fill(`1208568${getRandomChar("0123456789")}`);
  await page.getByRole("button", { name: "Log in with Phone" }).click();
  await expect(page.getByRole("button", { name: "Verify Otp" })).toBeVisible();
});

test("Login with email", async ({ page }) => {
  await page.goto("http://localhost:3000/templates");
  await page.getByRole("button", { name: "Log in with Email" }).click();
  await page.locator("#email").first().click();
  await page
    .locator("#email")
    .first()
    .fill(
      `test${getRandomChar("abcdefghijklmnopqrstuvwxyz0123456789")}@email.com`
    );
  await page.getByRole("button", { name: "Log in with Email" }).click();
  await expect(page.getByText("Please check your email")).toBeVisible();
});

test("Save menu", async ({ page }) => {
  await page.goto("http://localhost:3000/menu/preview/103");
  await page.getByLabel("Export Images").click();
  await expect(
    page.getByRole("button", { name: "Log in with Phone" })
  ).toBeVisible();
});

test("Create menu", async ({ page }) => {
  await page.goto("http://localhost:3000/template");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByPlaceholder("Enter your phone number")).toBeVisible();
});

function getRandomChar(inputString: string): string | null {
  const digits = inputString.match(/\d/g);

  // Check if there are enough digits to form a four-digit string
  if (digits && digits.length >= 4) {
    const randomIndices: any = [];
    const resultDigits = [];

    // Generate four unique random indices
    while (randomIndices.length < 4) {
      const randomIndex = Math.floor(Math.random() * digits.length);

      // Ensure the generated index is unique
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
      }
    }

    // Retrieve the characters at the random indices
    for (const index of randomIndices) {
      resultDigits.push(digits[index]);
    }

    // Combine the digits to form a four-digit string
    return resultDigits.join("");
  }

  // Return null if there are not enough digits
  return null;
}
