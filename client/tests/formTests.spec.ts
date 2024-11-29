import { test, expect, ElementHandle  } from '@playwright/test';
// import '@testing-library/jest-dom/extend-expect'

test.describe('Signup form', () => {

  let emailInput: ElementHandle<SVGElement | HTMLElement>;
  let usernameInput: ElementHandle<SVGElement | HTMLElement>;
  let passwordInput: ElementHandle<SVGElement | HTMLElement>;
  let confirmPasswordInput: ElementHandle<SVGElement | HTMLElement>;
  let submitButton: ElementHandle<SVGElement | HTMLElement>;

  test.beforeEach(async ({ page }) => {
    await page.route('**/users/create', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'User created successfully' }),
      });
    });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('button[name="signup"]');
    await page.click('button[name="signup"]');
    await page.waitForSelector('form[name="signup"]');
    const signupForm = await page.$('form[name="signup"]');
    await expect(signupForm).toBeDefined();
    emailInput = await page.waitForSelector('input[name="email"]');
    usernameInput = await page.waitForSelector('input[name="username"]');
    passwordInput = await page.waitForSelector('input[name="password"]');
    confirmPasswordInput = await page.waitForSelector('input[name="confirmPassword"]');
    submitButton = await page.waitForSelector('button[type="submit"]');
  });

  test('password must be confirmed', async ({ page }) => {
    emailInput.fill('email@email.com');
    usernameInput.fill('username');
    passwordInput.fill('password');
    
    await submitButton.click();
    
    const confirmPasswordLocator = page.locator('input[name="confirmPassword"]');
    await expect(confirmPasswordLocator).toHaveAttribute('aria-invalid', 'true');

    confirmPasswordInput.fill('passwordNotMatching');

    await submitButton.click();
    await expect(confirmPasswordLocator).toHaveAttribute('aria-invalid', 'true');
  });

  test('valid email must be input', async ({ page}) => {
    emailInput.fill('fakeemail');

    const emailInputLocator = page.locator('input[name="email"]')
    await submitButton.click();
    await expect(emailInputLocator).toHaveAttribute('aria-invalid', 'true');
  });
});