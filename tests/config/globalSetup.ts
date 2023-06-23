import { FullConfig, chromium, Page } from "@playwright/test";
import { FLAPJACK_FILE, PAID_USER_FILE, USER_FILE } from "./constants";
import { resetDatabase, resetUsers } from "../helpers/database.helper";

async function globalSetup(config: FullConfig) {
  await resetUsers();
  await resetDatabase();
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  if (!baseURL) {
    await browser.close();
    return;
  }
  await page.goto(`${baseURL}/template`);

  await loginUser(page, FLAPJACK_FILE, {
    email: "test@flapjack.com",
    password: "password",
  });
  await loginUser(page, PAID_USER_FILE, {
    email: "paid@gmail.com",
    password: "password",
  });
  await loginUser(page, USER_FILE, {
    email: "user@gmail.com",
    password: "password",
  });

  await browser.close();
}

async function loginUser(
  page: Page,
  storageStateFile: string,
  userCredentials: { email: string; password: string }
) {
  const { email, password } = userCredentials;
  await page.getByRole("button", { name: "Sign Up", exact: true }).click();
  await page
    .getByRole("link", { name: "Already have an account? Sign in" })
    .click();
  const emailInput = page.getByPlaceholder("Your email address");
  const passwordInput = page.getByPlaceholder("Your password");
  const signInButton = page.getByRole("button", {
    name: "Sign in",
    exact: true,
  });
  await emailInput.click();
  await emailInput.fill(email);
  await passwordInput.click();
  await passwordInput.fill(password);
  await signInButton.click();

  // Make sure the user is logged in if the avatar icon is visible
  await page.locator(".mantine-Avatar-root").last().click();

  // Store the authentication details
  await page.context().storageState({ path: storageStateFile });

  await page.getByRole("menuitem", { name: "Logout" }).click();

  // Close the pop up
  await page.reload();
}

export default globalSetup;
