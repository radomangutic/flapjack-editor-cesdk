import { test, expect } from "@playwright/test";

test("Login with phone", async ({ page }) => {
  await page.goto("http://localhost:3000/templates");
  await page.locator(".PhoneInputInput").first().click();
  await page
    .locator(".PhoneInputInput")
    .first()
    .fill(`1208568${getRandomChar("0123456789")}`);
  const responsePromise = page.waitForResponse(
    "https://wmdpmyvxnuwqtdivtjij.supabase.co/auth/v1/otp"
  );
  await page.locator(".loginWithPhoneButton").first().click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});

test("Login with email", async ({ page }) => {
  await page.goto("http://localhost:3000/templates");
  await page.locator(".loginWithEmailButton").first().click();
  await page.locator("#mantine-r1").first().click();
  await page
    .locator("#mantine-r1")
    .first()
    .fill(
      `test${getRandomChar("abcdefghijklmnopqrstuvwxyz0123456789")}@email.com`
    );
  const responsePromise = page.waitForResponse(
    "https://wmdpmyvxnuwqtdivtjij.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2Flocalhost%3A3000"
  );
  await page.locator(".loginWithEmailButton").first().click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});

test("Create menu", async ({ page }) => {
  await page.goto("http://localhost:3000/template");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.locator(".loginWithEmailButton").first()).toBeVisible();
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
