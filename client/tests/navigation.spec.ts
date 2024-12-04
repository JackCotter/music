import { test, expect } from "@playwright/test";

test("has header buttons", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector('button[name="signup"]');
  const signupButton = page.locator('button[name="signup"]');
  await expect(signupButton).toBeVisible();

  await page.waitForSelector('button[name="login"]');
  const loginButton = page.locator('button[name="login"]');
  await expect(loginButton).toBeVisible();
});

test("can navigate to signup page", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector('button[name="signup"]');
  await page.click('button[name="signup"]');
  const signupForm = page.locator('form[name="signup"]');
  await expect(signupForm).toBeVisible();
});

test("can open login modal", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector('button[name="login"]');
  await page.click('button[name="login"]');
  const loginForm = page.locator('form[name="login"]');
  await expect(loginForm).toBeVisible();
});

test("can navigate to new project page if logged in", async ({ page }) => {
  page.route("**/users/loggedIn", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "myUsername",
    });
  });
  await page.goto("http://localhost:3000");
  const button = await page.waitForSelector(
    'button[aria-label="newProjectButton"]'
  );
  button.click();
  const newProjectForm = page.locator('form[name="newProjectForm"]');
  await expect(newProjectForm).toBeVisible();
});

test("can navigate to username page if logged in", async ({ page }) => {
  page.route("**/users/loggedIn", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "myUsername",
    });
  });
  page.route("**/users/get?username=myUsername", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        username: "myUsername",
        description: "Welcome to my profile!",
      }),
    });
  });
  await page.goto("http://localhost:3000");
  const button = await page.waitForSelector(
    'button[aria-label="profileButton"]'
  );
  button.click();
  const description = page.locator("text=Welcome to my profile");
  const username = page.locator("text='myUsername'");
  await description.waitFor({ state: "visible" });
  await expect(description).toBeVisible();
  await expect(username).toBeVisible();
});

// test('can navigate back to main page', async ({ page }) => {
//   await page.goto('http://localhost:3000');
//   await page.waitForSelector('button[name="signup"]');
//   await page.click('button[name="signup"]');
//   await page.waitForSelector('form[name="signup"]');
//   await page.waitForSelector('a:has-text("Track Track er")');
//   await page.click('text="Track Track er"');
//   await page.waitForSelector('button[name="login"]');

//   const text = await page.$eval('body', (element) => element.textContent);
//   expect(text).toContain('Find a project to contribute to!');
// });
