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

test('can navigate to signup page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button[name="signup"]');
  await page.click('button[name="signup"]');
  await page.waitForSelector('form[name="signup"]');
  const signupForm = await page.$('form[name="signup"]');
  await expect (signupForm).toBeDefined();
});

test('can open login modal', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button[name="login"]');
  await page.click('button[name="login"]');
  await page.waitForSelector('form[name="login"]');
  const loginForm = await page.$('form[name="login"]');
  await expect (loginForm).toBeDefined();
});

test('can navigate back to main page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button[name="signup"]');
  await page.click('button[name="signup"]');
  await page.waitForSelector('form[name="signup"]');
  const link = await page.waitForSelector(`a:has-text("Track Track er")`);
  await link.click();
  await page.waitForSelector('button[name="login"]');
  // const loginButton = await page.$('button[name="login"]');
  // expect(loginButton).toBeDefined();

  const text = await page.$eval('body', (element) => element.textContent);
  expect(text).toContain('Find a project to contribute to!');
});
