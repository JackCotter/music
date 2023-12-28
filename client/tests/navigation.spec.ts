import { test, expect } from '@playwright/test';

test('has header buttons', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button[name="signup"]');
  const signupButton = await page.$('button[name="signup"]');
  await expect (signupButton).toBeDefined();

  await page.waitForSelector('button[name="login"]');
  const loginButton = await page.$('button[name="login"]');
  await expect (loginButton).toBeDefined();
});