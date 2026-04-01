import { test, expect } from "@playwright/test";

async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#password", "stemscore2026");
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
}

async function freshJudge(page: import("@playwright/test").Page, name: string) {
  await page.goto("/score/fair2026");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/score/fair2026");
  await page.waitForSelector("#judgeName", { timeout: 10000 });
  await page.fill("#judgeName", name);
  await page.click('button:has-text("Start Scoring")');
  await page.waitForSelector(`text=Hi, ${name}`, { timeout: 10000 });
}

// ═══════════════════════════════════════════════════════
// 1. HOME PAGE
// ═══════════════════════════════════════════════════════
test.describe("Home Page", () => {
  test("renders landing page with logo and get started button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/ }).first()).toBeVisible();
  });

  test("get started button navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.locator("a[href='/admin/login']").first().click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

// ═══════════════════════════════════════════════════════
// 2. ADMIN LOGIN
// ═══════════════════════════════════════════════════════
test.describe("Admin Login", () => {
  test("shows login form with password field and back nav", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("text=Home")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("back nav navigates to home page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.click("text=Home");
    await expect(page).toHaveURL("/");
  });

  test("rejects wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#password", "wrongpassword");
    await page.click('button:has-text("Sign In")');
    await expect(page.locator("text=Wrong password")).toBeVisible();
  });

  test("accepts correct password and redirects to dashboard", async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator("text=Events")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 3. ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════
test.describe("Admin Dashboard", () => {
  test("shows dashboard with log out and new event button", async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator("text=Log out")).toBeVisible();
    await expect(page.locator("text=+ New Event")).toBeVisible();
  });

  test("shows seeded event", async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator("text=Spring Science Fair 2026")).toBeVisible();
  });

  test("log out redirects to login", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Log out");
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  });

  test("clicking event navigates to event page", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 4. EVENT MANAGEMENT
// ═══════════════════════════════════════════════════════
test.describe("Event Management", () => {
  test("shows event details with stats", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
    await expect(page.locator("text=judges")).toBeVisible();
    await expect(page.locator("text=scores")).toBeVisible();
  });

  test("shows Print QR Sheet and Leaderboard buttons", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
    await expect(page.getByRole("link", { name: "Print QR Sheet" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Leaderboard/ })).toBeVisible();
  });

  test("shows add participant form with inputs", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="projectTitle"]')).toBeVisible();
  });

  test("shows existing participants including I AM A WEIRDO", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
    await expect(page.locator("text=I AM A WEIRDO")).toBeVisible();
  });

  test("back to events via header works", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 10000 });
    await page.click("text=Events");
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 5. QR SHEET
// ═══════════════════════════════════════════════════════
test.describe("QR Sheet", () => {
  test("shows QR code page with scan instructions", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 15000 });
    await page.click("text=Print QR Sheet");
    await page.waitForURL(/\/qr/, { timeout: 15000 });
    await expect(page.getByLabel("Scan to start judging")).toBeVisible();
  });

  test("shows Print and Copy Link buttons", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 15000 });
    await page.click("text=Print QR Sheet");
    await page.waitForURL(/\/qr/, { timeout: 15000 });
    await expect(page.getByRole("button", { name: "Print QR Code" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Link" })).toBeVisible();
  });

  test("back to event via header works", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Spring Science Fair 2026");
    await page.waitForURL(/\/admin\/event\//, { timeout: 15000 });
    await page.click("text=Print QR Sheet");
    await page.waitForURL(/\/qr/, { timeout: 15000 });
    await page.click("text=Event");
    await page.waitForURL(/\/admin\/event\/(?!.*qr)/, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 6. JUDGE FLOW - QR LANDING
// ═══════════════════════════════════════════════════════
test.describe("Judge Flow - Landing", () => {
  test("shows welcome screen with name input and start button", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await expect(page.locator("text=Welcome, Judge!")).toBeVisible();
    await expect(page.locator("#judgeName")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Scoring →" })).toBeVisible();
  });

  test("shows Close button in header", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await expect(page.locator("text=Close")).toBeVisible();
  });

  test("Close opens exit dialog", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.click("text=Close");
    await expect(page.locator("text=Leave scoring?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("Cancel closes the exit dialog", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.click("text=Close");
    await page.click('button:has-text("Cancel")');
    await expect(page.locator("text=Leave scoring?")).not.toBeVisible();
  });

  test("invalid token shows error page", async ({ page }) => {
    await page.goto("/score/invalidtoken123");
    await expect(page.locator("text=Event not found")).toBeVisible();
  });

  test("no account needed message is shown", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await expect(page.locator("text=No account needed")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 7. JUDGE FLOW - PARTICIPANT LIST
// ═══════════════════════════════════════════════════════
test.describe("Judge Flow - Participant List", () => {
  test("shows greeting, progress, and participants", async ({ page }) => {
    await freshJudge(page, "TestJudge1");
    await expect(page.locator("text=Hi, TestJudge1")).toBeVisible();
    await expect(page.locator("text=Team Rocket")).toBeVisible();
    await expect(page.locator("text=I AM A WEIRDO")).toBeVisible();
  });

  test("shows Back button in header", async ({ page }) => {
    await freshJudge(page, "TestJudge2");
    await expect(page.locator("text=Back")).toBeVisible();
  });

  test("Back button returns to name entry screen", async ({ page }) => {
    await freshJudge(page, "TestJudge3");
    await page.click("text=Back");
    await expect(page.locator("#judgeName")).toBeVisible();
    await expect(page.locator("text=Welcome, Judge!")).toBeVisible();
  });

  test("shows Score badges for unscored participants", async ({ page }) => {
    await freshJudge(page, "TestJudge4");
    const badges = page.locator("span:has-text('Score')").filter({ hasNotText: "scored" });
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows hint text", async ({ page }) => {
    await freshJudge(page, "TestJudge5");
    await expect(page.locator("text=Tap a participant to score them")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 8. JUDGE FLOW - SCORE FORM
// ═══════════════════════════════════════════════════════
test.describe("Judge Flow - Score Form", () => {
  test("tapping participant opens bottom sheet with score form", async ({ page }) => {
    await freshJudge(page, "ScoreFormTest1");
    await page.click("text=Team Rocket");
    await expect(page.locator("text=Creativity / Innovation")).toBeVisible();
    await expect(page.locator("text=Scientific Method")).toBeVisible();
    await expect(page.locator("text=Presentation")).toBeVisible();
    await expect(page.locator("text=Impact / Relevance")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Score" })).toBeVisible();
  });

  test("shows tappable 1-10 buttons for each category", async ({ page }) => {
    await freshJudge(page, "ScoreFormTest2");
    await page.click("text=Team Rocket");
    await expect(page.locator('button[aria-label="Creativity / Innovation: 1 out of 10"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Creativity / Innovation: 10 out of 10"]')).toBeVisible();
  });

  test("tapping score button updates value display", async ({ page }) => {
    await freshJudge(page, "ScoreFormTest3");
    await page.click("text=Team Rocket");
    await page.click('button[aria-label="Creativity / Innovation: 9 out of 10"]');
    await expect(page.locator("text=9/10").first()).toBeVisible();
  });

  test("shows feedback textarea with character counter", async ({ page }) => {
    await freshJudge(page, "ScoreFormTest4");
    await page.click("text=Team Rocket");
    await expect(page.locator("#feedback")).toBeVisible();
    await expect(page.locator("text=0/500")).toBeVisible();
  });

  test("shows total score (default 20/40)", async ({ page }) => {
    await freshJudge(page, "ScoreFormTest5");
    await page.click("text=Team Rocket");
    await expect(page.getByText("20", { exact: true })).toBeVisible();
    await expect(page.locator("text=/\\/40/")).toBeVisible();
  });

  test("full score submission flow works end-to-end", async ({ page }) => {
    await freshJudge(page, "E2ESubmitter");
    await page.click("text=Astro Bots");
    await page.click('button[aria-label="Creativity / Innovation: 8 out of 10"]');
    await page.click('button[aria-label="Scientific Method: 7 out of 10"]');
    await page.click('button[aria-label="Presentation: 9 out of 10"]');
    await page.click('button[aria-label="Impact / Relevance: 8 out of 10"]');
    await page.fill("#feedback", "Tested by Playwright!");
    await page.click("text=Submit Score");
    await expect(page.locator("text=Score submitted!")).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Done").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 9. LEADERBOARD
// ═══════════════════════════════════════════════════════
test.describe("Leaderboard", () => {
  test("shows leaderboard with title", async ({ page }) => {
    await page.goto("/event/event-1/leaderboard");
    await expect(page.locator("text=🏆")).toBeVisible();
  });

  test("shows back to event in header", async ({ page }) => {
    await page.goto("/event/event-1/leaderboard");
    await expect(page.locator("text=Event")).toBeVisible();
  });

  test("shows medal icons for top 3", async ({ page }) => {
    await page.goto("/event/event-1/leaderboard");
    await page.waitForSelector("text=🥇", { timeout: 10000 });
    await expect(page.locator("text=🥇")).toBeVisible();
    await expect(page.locator("text=🥈")).toBeVisible();
    await expect(page.locator("text=🥉")).toBeVisible();
  });

  test("shows ranked participants with scores", async ({ page }) => {
    await page.goto("/event/event-1/leaderboard");
    await page.waitForSelector("text=🥇", { timeout: 10000 });
    await expect(page.locator("text=Team Rocket")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 10. SCORE CARD
// ═══════════════════════════════════════════════════════
test.describe("Score Card", () => {
  test("shows participant name, project, and category scores", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    await expect(page.locator("text=Code Wizards")).toBeVisible();
    await expect(page.locator("text=AI Plant Doctor")).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Creativity$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Method$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Presentation$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Impact$/ })).toBeVisible();
  });

  test("shows total score out of 40", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    await expect(page.locator("text=/\\/40/")).toBeVisible();
  });

  test("shows judge feedback section", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    await expect(page.locator("text=Judge Feedback")).toBeVisible();
    await expect(page.locator("text=Dr. Martinez")).toBeVisible();
  });

  test("shows event name and date footer", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    await expect(page.locator("text=2026-04-15")).toBeVisible();
  });

  test("invalid participant returns 404", async ({ page }) => {
    const response = await page.goto("/card/event-1/nonexistent");
    expect(response?.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════
// 11. CREATE EVENT
// ═══════════════════════════════════════════════════════
test.describe("Create Event", () => {
  test("New Event button shows create form", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=+ New Event");
    await page.waitForURL(/\/admin\/event\/new/, { timeout: 10000 });
    await expect(page.locator("text=New Event")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#date")).toBeVisible();
  });

  test("back to events via header works", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/event/new");
    await page.click("text=Events");
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 12. AUTH GUARD
// ═══════════════════════════════════════════════════════
test.describe("Auth Guard", () => {
  test("unauthenticated dashboard access redirects to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated event page redirects to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/event/event-1");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("judge page works without auth", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/score/fair2026");
    await expect(page.locator("text=STEMScore")).toBeVisible();
  });

  test("leaderboard works without auth", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/event/event-1/leaderboard");
    await expect(page.locator("text=🏆")).toBeVisible();
  });

  test("score card works without auth", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/card/event-1/p3");
    await expect(page.locator("text=Code Wizards")).toBeVisible();
  });
});
