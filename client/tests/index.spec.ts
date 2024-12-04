import { test, expect } from "@playwright/test";

test.describe("index sunny day tests", () => {
  const PROJECT1_NAME = "Proj1 abcd";
  const PROJECT1_DESCRIPTION =
    "A classic description of a project for test purposes";
  const PROJECT1_USERNAME = "TESTman429";
  const PROJECT1_LOOKINGFOR = ["Drums", "Saxophone", "Violin"];
  const PROJECT1_LOOKINGFORSTRICT = false;
  const PROJECT2_NAME = "PROJ2 its a good project!";
  const PROJECT3_NAME = "prj3";
  test.beforeEach(async ({ page }) => {
    page.route(/^.*\/projects\/list(?!.*(q=|instruments=)).*$/, (route) => {
      console.log(route.request.toString());
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            description: PROJECT1_DESCRIPTION,
            lookingfor: PROJECT1_LOOKINGFOR,
            lookingforstrict: PROJECT1_LOOKINGFORSTRICT,
            projectid: 1,
            projectname: PROJECT1_NAME,
            username: PROJECT1_USERNAME,
          },
          {
            description: "Project 2",
            lookingfor: ["Violin"],
            lookingforstrict: false,
            projectid: 2,
            projectname: PROJECT2_NAME,
            username: "jacktest",
          },
          {
            description: "Proj 2",
            lookingfor: ["Drums", "Saxophone", "Violin"],
            lookingforstrict: true,
            projectid: 3,
            projectname: PROJECT3_NAME,
            username: "jacktest2",
          },
        ]),
      });
    });
    page.route("**/projects/pagecount*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(1),
      });
    });
    page.route("**/tracks/list?*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            accepted: false,
            blobData: "Tjdslkndsldknsdlsdknnnn",
            description: "asdfansdfkasdflkasndfk",
            instrumentType: "Guitar",
            title: "Backing track",
            trackId: 36,
          },
          {
            accepted: false,
            description: "",
            blobData: "Tjdslkndsldknsdlsdknnnn",

            instrumentType: "Guitar",
            title: "Lead",
            trackId: 37,
          },
          {
            accepted: false,
            description: "",
            blobData: "Tjdslkndsldknsdlsdknnnn",
            instrumentType: "Drums",
            title: "Good timing",
            trackId: 38,
          },
        ]),
      });
    });
  });

  test("index page loads and projects are visible", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    const project1Name = page.locator(`text=${PROJECT1_NAME}`);
    const project1Description = page.locator(`text=${PROJECT1_DESCRIPTION}`);
    const project1Username = page.locator(`text=${PROJECT1_USERNAME}`);
    const project2Name = page.locator(`text=${PROJECT2_NAME}`);
    const project3Name = page.locator(`text=${PROJECT3_NAME}`);
    await project1Name.waitFor({ state: "visible" });
    await project1Description.waitFor({ state: "visible" });
    await project1Username.waitFor({ state: "visible" });
    await project2Name.waitFor({ state: "visible" });
    await project3Name.waitFor({ state: "visible" });
    await expect(project1Name).toBeVisible();
    await expect(project1Description).toBeVisible();
    await expect(project1Username).toBeVisible();
    await expect(project2Name).toBeVisible();
    await expect(project3Name).toBeVisible();
  });

  test("projects are searchable", async ({ page }) => {
    page.route(/^.*\/projects\/list(?=.*q=).*$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            description: "Go crazy!",
            lookingfor: ["Drums", "Saxophone", "Violin"],
            lookingforstrict: false,
            projectid: 1,
            projectname: PROJECT1_NAME,
            username: "jacktest",
          },
        ]),
      });
    });
    await page.goto("http://localhost:3000/");

    const searchBar = await page.getByLabel("Search");
    await searchBar.fill(PROJECT1_NAME);
    await page.waitForResponse("**/projects/list*");

    const projectCardLocator = await page.locator(
      "div[aria-label=projectCard]"
    );
    const project1Locator = await page.locator(`text=${PROJECT1_NAME}`);
    const projectCardCount = await projectCardLocator.count();

    await expect(projectCardCount).toBe(1);
    await expect(project1Locator).toBeVisible();
  });

  test("projects are filterable", async ({ page }) => {
    page.route(/^.*\/projects\/list(?=.*instruments=).*$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            description: "Go crazy!",
            lookingfor: ["Drums", "Saxophone", "Violin"],
            lookingforstrict: false,
            projectid: 1,
            projectname: PROJECT1_NAME,
            username: "jacktest",
          },
        ]),
      });
    });
    await page.goto("http://localhost:3000/");

    await page.locator("#instrumentTypeSelectId").click();
    await page.locator('li[role="option"]:nth-child(1)').click();

    const projectCardLocator = await page.locator(
      "div[aria-label=projectCard]"
    );
    const project1Locator = await page.locator(`text=${PROJECT1_NAME}`);
    const projectCardCount = await projectCardLocator.count();

    await expect(projectCardCount).toBe(1);
    await expect(project1Locator).toBeVisible();
  });

  test("pagination causes project refresh", async ({ page }) => {
    page.route(/^.*\/projects\/list(?=.*page=1).*$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          new Array(12).fill(0).map((_, index) => {
            return {
              description: "Project" + index.toString(),
              lookingfor: ["Drums", "Saxophone", "Violin"],
              lookingforstrict: false,
              projectid: index,
              projectname: PROJECT1_NAME,
              username: "jacktest",
            };
          })
        ),
      });
    });
    page.route(/^.*\/projects\/list(?=.*page=2).*$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            description: "DESCRIPTION",
            lookingfor: ["Drums", "Saxophone", "Violin"],
            lookingforstrict: false,
            projectid: 2,
            projectname: PROJECT2_NAME,
            username: "jacktest2",
          },
        ]),
      });
    });
    page.route("**/projects/pagecount*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(2),
      });
    });

    await page.goto("http://localhost:3000/");
    await page.waitForResponse("**/projects/list*");

    const page2Button = await page.getByLabel("Go to page");
    await page2Button.click();

    const projectCardLocator = await page.locator(
      "div[aria-label=projectCard]"
    );
    const project2Locator = await page.locator(`text=${PROJECT2_NAME}`);
    const projectCardCount = await projectCardLocator.count();

    await expect(projectCardCount).toBe(1);
    await expect(project2Locator).toBeVisible();
  });
});

test.describe("index rainy day tests", () => {
  test("error retrieving project list", async ({ page }) => {
    page.route(/^.*\/projects\/list.*$/, (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
      });
    });
    page.goto("http://localhost:3000/");
    const errorBarLocator = await page.locator("div[aria-label=errorBar]");
    await expect(errorBarLocator).toBeVisible();
  });
});
