import { test, expect } from '@playwright/test';
import { describe } from 'node:test';
// import '@testing-library/jest-dom/extend-expect'


describe('Signup form', () => {
test('password must be confirmed', async ({ page }) => {
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
  const emailInput = await page.waitForSelector('input[name="email"]');
  emailInput.fill('email@email.com');
  const usernameInput = await page.waitForSelector('input[name="username"]');
  usernameInput.fill('username');
  const passwordInput = await page.waitForSelector('input[name="password"]');
  passwordInput.fill('password');
  
  const submitButton = await page.waitForSelector('button[type="submit"]');
  await submitButton.click();
  
  const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
  await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');

  confirmPasswordInput.fill('passwordNotMatching');

  await submitButton.click();
  await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
});
});