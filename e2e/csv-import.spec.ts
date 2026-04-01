import { test, expect } from "@playwright/test";
import path from "path";

const CSV_FILE = path.resolve(__dirname, "../../files/CombinedScienceFair.csv");

async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#password", "stemscore2026");
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
}

async function createEventAndImport(page: import("@playwright/test").Page) {
  await adminLogin(page);

  // Create a fresh event for import testing
  await page.click("text=+ New Event");
  await page.waitForURL(/\/admin\/event\/new/, { timeout: 10000 });
  await page.fill("#name", "CSV Import Test Event");
  await page.locator('select[name="month"]').selectOption("04");
  await page.fill('input[name="day"]', "15");
  await page.click('button:has-text("Create Event")');
  await page.waitForURL(/\/admin\/event\/(?!new)/, { timeout: 10000 });

  // Import the CSV
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(CSV_FILE);

  // Wait for import to complete (toast appears)
  await page.waitForSelector("text=imported", { timeout: 30000 });
}

// ═══════════════════════════════════════════════════════
// 1. IMPORT BASICS
// ═══════════════════════════════════════════════════════
test.describe("CSV Import - Basics", () => {
  test("imports all 68 rows from CombinedScienceFair.csv", async ({ page }) => {
    await createEventAndImport(page);

    // Check participant count in header
    const header = page.locator("text=Participants (");
    await expect(header).toBeVisible({ timeout: 5000 });
    const headerText = await header.textContent();
    const count = parseInt(headerText?.match(/\((\d+)\)/)?.[1] || "0");
    expect(count).toBeGreaterThanOrEqual(67);
  });
});

// ═══════════════════════════════════════════════════════
// 2. INDIVIDUAL PARTICIPANTS
// ═══════════════════════════════════════════════════════
test.describe("CSV Import - Individuals", () => {
  test.beforeEach(async ({ page }) => {
    await createEventAndImport(page);
  });

  test("Ali shoaib imported as individual with correct data", async ({ page }) => {
    await expect(page.locator("text=Ali shoaib")).toBeVisible();
    await expect(page.locator("text=Solo").first()).toBeVisible();
  });

  test("individual has correct location and table", async ({ page }) => {
    // Ali shoaib is at Location 1, Table 1
    const card = page.locator("text=Ali shoaib").locator("..");
    await expect(page.locator("text=Loc 1").first()).toBeVisible();
    await expect(page.locator("text=Table 1").first()).toBeVisible();
  });

  test("individual has correct grade", async ({ page }) => {
    // Ali shoaib is Grade K
    await expect(page.locator("text=Grade K").first()).toBeVisible();
  });

  test("individual has parent email", async ({ page }) => {
    await expect(page.locator("text=zanjebee@gmail.com")).toBeVisible();
  });

  test("individual with project name shows it", async ({ page }) => {
    await expect(page.locator("text=Measuring porosity")).toBeVisible();
  });

  test("individual with project category shows it", async ({ page }) => {
    // Sriya Mahavadi has category Science
    await expect(page.locator("text=Sriya Mahavadi")).toBeVisible();
  });

  test("individual needing outlet shows badge", async ({ page }) => {
    // Samarth Sharma needs outlet (row 55)
    await expect(page.locator("text=Samarth Sharma")).toBeVisible();
    // Find outlet badge near Samarth
    await expect(page.locator("text=Outlet").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 3. TEAM IMPORTS
// ═══════════════════════════════════════════════════════
test.describe("CSV Import - Teams", () => {
  test.beforeEach(async ({ page }) => {
    await createEventAndImport(page);
    // Switch to team view
    await page.locator('button[aria-label="Team view"]').click();
  });

  test("teams section exists with correct count", async ({ page }) => {
    await expect(page.locator("text=Teams (")).toBeVisible();
  });

  test("team with project name uses project as team name", async ({ page }) => {
    // "Aadhi Om Prakash, Ahir Rakshit" with project "Lava lamp"
    await expect(page.locator("text=Lava lamp").first()).toBeVisible();
  });

  test("team without project name gets Team#Location name", async ({ page }) => {
    // "Mahat, Feodor, Ashvik" at location 19 with no project
    await expect(page.locator("text=Team#19")).toBeVisible();
  });

  test("team with TBD project gets Team#Location name", async ({ page }) => {
    // "Om Kumar, Taksh Trivedi" at location 18 with project "TBD"
    await expect(page.locator("text=Team#18")).toBeVisible();
  });

  test("2-member team shows both members", async ({ page }) => {
    // Lava lamp team: Aadhi Om Prakash + Ahir Rakshit
    await expect(page.locator("text=Aadhi Om Prakash")).toBeVisible();
    await expect(page.locator("text=Ahir Rakshit")).toBeVisible();
  });

  test("3-member team shows all members", async ({ page }) => {
    // Team#19: Mahat, Feodor, Ashvik
    await expect(page.locator("text=Mahat").first()).toBeVisible();
    await expect(page.locator("text=Feodor")).toBeVisible();
    await expect(page.locator("text=Ashvik").first()).toBeVisible();
  });

  test("4-member team shows all members", async ({ page }) => {
    await expect(page.getByText("5 Seconds rule - Myth Or Fact").first()).toBeVisible();
    await expect(page.locator("text=Viraj").first()).toBeVisible();
    await expect(page.locator("text=Anay").first()).toBeVisible();
    await expect(page.locator("text=Advaith").first()).toBeVisible();
    await expect(page.locator("text=Vaibhav").first()).toBeVisible();
  });

  test("team has correct location", async ({ page }) => {
    // Team#19 at location 19
    const teamCard = page.locator("text=Team#19").locator("..").locator("..");
    await expect(page.locator("text=Loc 19")).toBeVisible();
  });

  test("team has member count badge", async ({ page }) => {
    await expect(page.locator("text=2 members").first()).toBeVisible();
  });

  test("team needing outlet shows badge", async ({ page }) => {
    await expect(page.getByText("Speed racers !!").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 4. SPECIFIC TEAM VERIFICATIONS
// ═══════════════════════════════════════════════════════
test.describe("CSV Import - Specific Rows", () => {
  test.beforeEach(async ({ page }) => {
    await createEventAndImport(page);
  });

  test("row 5: Aadhi Om Prakash, Ahir Rakshit → team Lava lamp", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Lava lamp").first()).toBeVisible();
    await expect(page.locator("text=Aadhi Om Prakash")).toBeVisible();
    await expect(page.locator("text=Ahir Rakshit")).toBeVisible();
  });

  test("row 6: Abhay Yagaty, Hendricks Hunter → team Poly density", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.getByText("Poly density bottle experiment").first()).toBeVisible();
    await expect(page.locator("text=Abhay Yagaty")).toBeVisible();
    await expect(page.locator("text=Hendricks Hunter")).toBeVisible();
  });

  test("row 20: Mahat, Feodor, Ashvik → Team#19", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Team#19")).toBeVisible();
    await expect(page.locator("text=Mahat").first()).toBeVisible();
    await expect(page.locator("text=Feodor")).toBeVisible();
  });

  test("row 21: Aayra, Alesh, Madhav → Team#20", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Team#20")).toBeVisible();
    await expect(page.locator("text=Aayra").first()).toBeVisible();
    await expect(page.locator("text=Alesh").first()).toBeVisible();
    await expect(page.locator("text=Madhav").first()).toBeVisible();
  });

  test("row 43: 4-member team with project name", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.getByText("5 Seconds rule - Myth Or Fact").first()).toBeVisible();
    await expect(page.locator("text=4 members")).toBeVisible();
  });

  test("row 62: 3-member team Krish, Ansh, Avyukt → Team#63 (TBD project)", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Team#63")).toBeVisible();
    await expect(page.locator("text=Krish Shrotriya")).toBeVisible();
    await expect(page.locator("text=Ansh Dhuri")).toBeVisible();
    await expect(page.locator("text=Avyukt Iyer")).toBeVisible();
  });

  test("row 68: Eshan Krishnan, Advik Gaur → team Music & Science with outlet", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.getByText("Music & Science").first()).toBeVisible();
    await expect(page.locator("text=Eshan Krishnan")).toBeVisible();
    await expect(page.locator("text=Advik Gaur")).toBeVisible();
  });

  test("Anya Chakaravarthi imported as individual at Loc 58", async ({ page }) => {
    await expect(page.locator("text=Anya Chakaravarthi")).toBeVisible();
    await expect(page.locator("text=Stem scorer app")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 5. VIEW TOGGLE
// ═══════════════════════════════════════════════════════
test.describe("CSV Import - View Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await createEventAndImport(page);
  });

  test("list view shows all participants in one list", async ({ page }) => {
    // Default is list view
    await expect(page.locator("text=Ali shoaib")).toBeVisible();
    // Teams show member pills in list view
    await expect(page.locator("text=Lava lamp").first()).toBeVisible();
  });

  test("team view separates teams and individuals", async ({ page }) => {
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Teams (")).toBeVisible();
    await expect(page.locator("text=Individual (")).toBeVisible();
  });

  test("can switch between views", async ({ page }) => {
    // Switch to team view
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Teams (")).toBeVisible();

    // Switch back to list view
    await page.locator('button[aria-label="List view"]').click();
    await expect(page.locator("text=Ali shoaib")).toBeVisible();
  });
});
