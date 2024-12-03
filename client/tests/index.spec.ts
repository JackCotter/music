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
    page.route(/^.*\/projects\/list(?!.*q=).*$/, (route) => {
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
    await page.goto("http://localhost:3000/");
  });

  test("index page loads and projects are visible", async ({ page }) => {
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

  test("index page loads and projects are searchable", async ({ page }) => {
    page.route("**/projects/list?page=1&q=*", (route) => {
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
});
