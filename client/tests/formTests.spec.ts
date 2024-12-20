import { test, expect, ElementHandle } from "@playwright/test";
// import '@testing-library/jest-dom/extend-expect'

test.describe("Signup form", () => {
  let emailInput: ElementHandle<SVGElement | HTMLElement>;
  let usernameInput: ElementHandle<SVGElement | HTMLElement>;
  let passwordInput: ElementHandle<SVGElement | HTMLElement>;
  let confirmPasswordInput: ElementHandle<SVGElement | HTMLElement>;
  let submitButton: ElementHandle<SVGElement | HTMLElement>;

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector('button[name="signup"]');
    await page.click('button[name="signup"]');
    await page.waitForSelector('form[name="signup"]');
    const signupForm = await page.$('form[name="signup"]');
    await expect(signupForm).toBeDefined();
    emailInput = await page.waitForSelector('input[name="email"]');
    usernameInput = await page.waitForSelector('input[name="username"]');
    passwordInput = await page.waitForSelector('input[name="password"]');
    confirmPasswordInput = await page.waitForSelector(
      'input[name="confirmPassword"]'
    );
    submitButton = await page.waitForSelector('button[type="submit"]');
  });

  test("password must be confirmed", async ({ page }) => {
    emailInput.fill("email@email.com");
    usernameInput.fill("username");
    passwordInput.fill("password");

    await submitButton.click();

    const confirmPasswordLocator = page.locator(
      'input[name="confirmPassword"]'
    );
    await expect(confirmPasswordLocator).toHaveAttribute(
      "aria-invalid",
      "true"
    );

    confirmPasswordInput.fill("passwordNotMatching");

    await submitButton.click();
    await expect(confirmPasswordLocator).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("password must be at least 8 characters", async ({ page }) => {
    await emailInput.fill("email@email.com");
    await usernameInput.fill("username");
    await passwordInput.fill("1234567");
    await confirmPasswordInput.fill("1234567");

    await submitButton.click();

    const confirmPasswordLocator = page.locator(
      'input[name="confirmPassword"]'
    );
    await expect(confirmPasswordLocator).toHaveAttribute(
      "aria-invalid",
      "true"
    );

    await passwordInput.fill("12345678");
    await confirmPasswordInput.fill("12345678");

    await submitButton.click();
    await expect(confirmPasswordLocator).not.toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("valid email must be input", async ({ page }) => {
    emailInput.fill("fakeemail");

    const emailInputLocator = page.locator('input[name="email"]');
    await submitButton.click();
    await expect(emailInputLocator).toHaveAttribute("aria-invalid", "true");
  });

  test("user successfuly created", async ({ page }) => {
    await page.route("**/users/create", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "User created successfully",
        }),
      });
    });

    await emailInput.fill("fakeemail@amailprovider.com");
    await usernameInput.fill("username");
    await passwordInput.fill("password1234");
    await confirmPasswordInput.fill("password1234");

    submitButton.click();
    const button = page.locator('button[aria-label="logoutButton"]');
    await expect(button).toBeVisible();
  });

  test("user creation failed", async ({ page }) => {
    await page.route("**/users/create", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
      });
    });

    await emailInput.fill("fakeemail@amailprovider.com");
    await usernameInput.fill("username");
    await passwordInput.fill("password1234");
    await confirmPasswordInput.fill("password1234");

    await submitButton.click();
    const errorBar = page.locator('div[aria-label="errorBar"]');
    const emailInputLocator = page.locator('input[name="email"]');
    const sumbitButtonLocator = page.locator('button[type="submit"]');

    expect(errorBar).toBeVisible();
    expect(emailInputLocator).toBeVisible();
    expect(sumbitButtonLocator).toBeVisible();
  });
});
