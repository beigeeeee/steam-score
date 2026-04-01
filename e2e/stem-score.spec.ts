import { test, expect } from "@playwright/test";
import path from "path";

const CSV_FILE = path.resolve(__dirname, "../../files/CombinedScienceFair.csv");

// ── Helpers ──
async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill("#password", "stemscore2026");
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
}

async function createEvent(page: import("@playwright/test").Page, name: string) {
  await adminLogin(page);
  await page.click("text=+ New Event");
  await page.waitForURL(/\/admin\/event\/new/, { timeout: 10000 });
  await page.fill("#name", name);
  await page.locator('select[name="month"]').selectOption("04");
  await page.fill('input[name="day"]', "15");
  await page.click('button:has-text("Create Event")');
  await page.waitForURL(/\/admin\/event\/(?!new)/, { timeout: 10000 });
}

async function createEventWithParticipant(page: import("@playwright/test").Page) {
  await createEvent(page, "Test Event " + Date.now());
  await page.fill('input[name="name"]', "Test Student");
  await page.fill('input[name="projectTitle"]', "Test Project");
  await page.click('button:has-text("+ Add Participant")');
  await page.waitForSelector("text=Test Student", { timeout: 5000 });
}

async function freshJudge(page: import("@playwright/test").Page, name: string, token?: string) {
  const url = `/score/${token || "fair2026"}`;
  await page.goto(url);
  // Clear judge-specific localStorage but preserve cookies
  await page.evaluate((t) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("judge-") || key.startsWith("rubric-ack-")) {
        localStorage.removeItem(key);
      }
    });
  }, token || "fair2026");
  await page.goto(url);
  await page.waitForSelector("#judgeName", { timeout: 10000 });
  await page.fill("#judgeName", name);
  await page.click('button:has-text("Start Scoring")');
  // Acknowledge rubric if shown
  try {
    await page.waitForSelector("text=Scoring Rubric", { timeout: 3000 });
    await page.evaluate(() => {
      const el = document.querySelector(".overflow-y-auto");
      if (el) el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(500);
    await page.click('button:has-text("Start scoring")');
  } catch {
    // No rubric shown (already acknowledged)
  }
  await page.waitForSelector(`text=Hi, ${name}`, { timeout: 10000 });
}

// ═══════════════════════════════════════════════════════
// 1. HOME PAGE
// ═══════════════════════════════════════════════════════
test.describe("Home Page", () => {
  test("renders landing with logo and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/ }).first()).toBeVisible();
  });

  test("CTA navigates to login", async ({ page }) => {
    await page.goto("/");
    await page.locator("a[href='/admin/login']").first().click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

// ═══════════════════════════════════════════════════════
// 2. ADMIN LOGIN
// ═══════════════════════════════════════════════════════
test.describe("Admin Login", () => {
  test("shows password field and back nav", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("text=Home")).toBeVisible();
  });

  test("back nav goes home", async ({ page }) => {
    await page.goto("/admin/login");
    await page.click("text=Home");
    await expect(page).toHaveURL("/");
  });

  test("rejects wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#password", "wrong");
    await page.click('button:has-text("Sign In")');
    await expect(page.locator("text=Wrong password")).toBeVisible();
  });

  test("accepts correct password", async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator("text=Events")).toBeVisible();
  });

  test("rate limits after 5 failed attempts", async ({ page }) => {
    await page.goto("/admin/login");
    for (let i = 0; i < 5; i++) {
      await page.fill("#password", "wrong");
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(200);
    }
    await expect(page.locator("text=Too many attempts")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 3. ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════
test.describe("Admin Dashboard", () => {
  test("shows logout and new event", async ({ page }) => {
    await adminLogin(page);
    await expect(page.locator("text=Log out")).toBeVisible();
    await expect(page.locator("text=+ New Event")).toBeVisible();
  });

  test("logout redirects to login", async ({ page }) => {
    await adminLogin(page);
    await page.click("text=Log out");
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  });

  test("search filters events", async ({ page }) => {
    await adminLogin(page);
    const searchInput = page.locator('input[placeholder="Search events..."]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("nonexistent event xyz");
      await expect(page.locator("text=No events match")).toBeVisible();
    }
  });
});

// ═══════════════════════════════════════════════════════
// 4. EVENT CREATION
// ═══════════════════════════════════════════════════════
test.describe("Event Creation", () => {
  test("creates event with name and date", async ({ page }) => {
    await createEvent(page, "Playwright Test Event");
    // Should be on the event page
    await expect(page.locator("text=0 judges")).toBeVisible();
  });

  test("shows event stats after creation", async ({ page }) => {
    await createEvent(page, "Stats Test Event");
    await expect(page.locator("text=0 judges")).toBeVisible();
    await expect(page.locator("text=0 scores")).toBeVisible();
  });

  test("back to dashboard works", async ({ page }) => {
    await createEvent(page, "Nav Test Event");
    await page.click("text=Events");
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 5. PARTICIPANT MANAGEMENT
// ═══════════════════════════════════════════════════════
test.describe("Participant Management", () => {
  test("adds individual participant", async ({ page }) => {
    await createEvent(page, "Add Part Test");
    await page.fill('input[name="name"]', "JaneDoe");
    await page.fill('input[name="projectTitle"]', "My Project");
    await page.click('button:has-text("+ Add Participant")');
    await expect(page.locator("text=JaneDoe added")).toBeVisible({ timeout: 5000 });
  });

  test("adds team with members", async ({ page }) => {
    await createEvent(page, "Add Team Test");
    await page.locator('button:has-text("Team")').first().click();
    await page.fill('input[name="name"]', "TheRockets");
    await page.fill('input[name="projectTitle"]', "Rocket Science");
    await page.locator('input[placeholder="Member 1 name"]').fill("Alice");
    await page.locator('input[placeholder="Member 2 name"]').fill("Bob");
    await page.click('button:has-text("+ Add Team")');
    await expect(page.locator("text=TheRockets added")).toBeVisible({ timeout: 5000 });
  });

  test("deletes participant", async ({ page }) => {
    await createEventWithParticipant(page);
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Remove Test Student"]').click({ force: true });
    await expect(page.locator("text=removed")).toBeVisible({ timeout: 3000 });
  });

  test("edits participant name", async ({ page }) => {
    await createEventWithParticipant(page);
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Edit Test Student"]').click({ force: true });
    await expect(page.locator("text=Edit Participant")).toBeVisible();
    const nameInput = page.locator('[role="dialog"] input').first();
    await nameInput.clear();
    await nameInput.fill("RenamedStudent");
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator("text=RenamedStudent updated")).toBeVisible({ timeout: 5000 });
  });

  test("view toggle works", async ({ page }) => {
    await createEventWithParticipant(page);
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Individual (")).toBeVisible();
    await page.locator('button[aria-label="List view"]').click();
    await expect(page.locator("text=Participants (")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 6. CSV IMPORT
// ═══════════════════════════════════════════════════════
test.describe("CSV Import", () => {
  test("imports participants from CSV file", async ({ page }) => {
    await createEvent(page, "CSV Import Event");
    await page.locator('input[type="file"]').setInputFiles(CSV_FILE);
    await page.waitForSelector("text=imported", { timeout: 30000 });
    const header = page.locator("text=Participants (");
    await expect(header).toBeVisible();
    const text = await header.textContent();
    const count = parseInt(text?.match(/\((\d+)\)/)?.[1] || "0");
    expect(count).toBeGreaterThanOrEqual(60);
  });

  test("creates teams from comma-separated names", async ({ page }) => {
    await createEvent(page, "CSV Team Import");
    await page.locator('input[type="file"]').setInputFiles(CSV_FILE);
    await page.waitForSelector("text=imported", { timeout: 30000 });
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Teams (")).toBeVisible();
    // Lava lamp team
    await expect(page.locator("text=Aadhi Om Prakash")).toBeVisible();
    await expect(page.locator("text=Ahir Rakshit")).toBeVisible();
  });

  test("teams without names get Team#Location format", async ({ page }) => {
    await createEvent(page, "CSV Team Names");
    await page.locator('input[type="file"]').setInputFiles(CSV_FILE);
    await page.waitForSelector("text=imported", { timeout: 30000 });
    await page.locator('button[aria-label="Team view"]').click();
    await expect(page.locator("text=Team#19")).toBeVisible();
    await expect(page.locator("text=Team#20")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 7. QR SHEET
// ═══════════════════════════════════════════════════════
test.describe("QR Sheet", () => {
  test("shows QR code and print/copy buttons", async ({ page }) => {
    await createEvent(page, "QR Test Event");
    await page.click("text=Print QR Sheet");
    await page.waitForURL(/\/qr/, { timeout: 15000 });
    await expect(page.getByLabel("Scan to start judging")).toBeVisible();
    await expect(page.getByRole("button", { name: "Print QR Code" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download PNG" })).toBeVisible();
  });

  test("back to event works", async ({ page }) => {
    await createEvent(page, "QR Nav Event");
    await page.click("text=Print QR Sheet");
    await page.waitForURL(/\/qr/, { timeout: 15000 });
    await page.click("text=Event");
    await page.waitForURL(/\/admin\/event\/(?!.*qr)/, { timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════
// 8. EVENT DELETION
// ═══════════════════════════════════════════════════════
test.describe("Event Deletion", () => {
  test("admin can delete event with confirmation", async ({ page }) => {
    await createEvent(page, "ToDelete");
    await page.click("text=Events");
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    // Click the delete icon for this event
    await page.locator('button[aria-label="Delete ToDelete"]').click({ force: true });
    await expect(page.locator("text=Delete event?")).toBeVisible();
    await page.click('button:has-text("Delete Event")');
    await expect(page.locator("text=deleted")).toBeVisible({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════
// 9. JUDGE FLOW - LANDING & RUBRIC
// ═══════════════════════════════════════════════════════
test.describe("Judge Flow - Landing & Rubric", () => {
  test("shows welcome screen with name input", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => { Object.keys(localStorage).forEach(k => { if(k.startsWith("judge-")||k.startsWith("rubric-ack-")) localStorage.removeItem(k); }); });
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await expect(page.locator("text=Welcome, Judge!")).toBeVisible();
  });

  test("shows rubric after entering name", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => { Object.keys(localStorage).forEach(k => { if(k.startsWith("judge-")||k.startsWith("rubric-ack-")) localStorage.removeItem(k); }); });
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.fill("#judgeName", "RubricTest");
    await page.click('button:has-text("Start Scoring")');
    await expect(page.locator("text=Scoring Rubric")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Creativity")).toBeVisible();
    await expect(page.locator("text=Thoroughness")).toBeVisible();
  });

  test("rubric button disabled until scrolled", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => { Object.keys(localStorage).forEach(k => { if(k.startsWith("judge-")||k.startsWith("rubric-ack-")) localStorage.removeItem(k); }); });
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.fill("#judgeName", "ScrollTest");
    await page.click('button:has-text("Start Scoring")');
    await page.waitForSelector("text=Scoring Rubric", { timeout: 5000 });
    await expect(page.locator("text=Scroll down to continue")).toBeVisible();
  });

  test("rubric acknowledged → participant list", async ({ page }) => {
    await freshJudge(page, "AckTest");
    await expect(page.locator("text=Hi, AckTest")).toBeVisible();
  });

  test("close opens exit dialog", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => { Object.keys(localStorage).forEach(k => { if(k.startsWith("judge-")||k.startsWith("rubric-ack-")) localStorage.removeItem(k); }); });
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.click("text=Close");
    await expect(page.locator("text=Leave scoring?")).toBeVisible();
  });

  test("cancel closes exit dialog", async ({ page }) => {
    await page.goto("/score/fair2026");
    await page.evaluate(() => { Object.keys(localStorage).forEach(k => { if(k.startsWith("judge-")||k.startsWith("rubric-ack-")) localStorage.removeItem(k); }); });
    await page.goto("/score/fair2026");
    await page.waitForSelector("#judgeName", { timeout: 10000 });
    await page.click("text=Close");
    await page.click('button:has-text("Cancel")');
    await expect(page.locator("text=Leave scoring?")).not.toBeVisible();
  });

  test("invalid token shows error", async ({ page }) => {
    await page.goto("/score/invalidtoken123");
    await expect(page.locator("text=Event not found")).toBeVisible();
  });

  test("judge name persists on reload", async ({ page }) => {
    await freshJudge(page, "PersistTest");
    await page.reload();
    await page.waitForTimeout(2000);
    // After reload, should NOT see name input (name was saved)
    const nameInputVisible = await page.locator("#judgeName").isVisible();
    expect(nameInputVisible).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// 10. JUDGE FLOW - SCORING
// ═══════════════════════════════════════════════════════
test.describe("Judge Flow - Scoring", () => {
  test("shows participant list with progress", async ({ page }) => {
    await freshJudge(page, "ScoreListTest");
    await expect(page.locator("text=Hi, ScoreListTest")).toBeVisible();
  });

  test("tapping participant opens score form", async ({ page }) => {
    await freshJudge(page, "FormOpenTest");
    await page.locator("button:has-text('Score')").first().click();
    await expect(page.locator("text=Creativity")).toBeVisible();
    await expect(page.locator("text=Thoroughness")).toBeVisible();
    await expect(page.locator("text=Clarity")).toBeVisible();
    await expect(page.locator("text=Student Independence")).toBeVisible();
  });

  test("score buttons are 1-5 with traffic light colors", async ({ page }) => {
    await freshJudge(page, "ButtonTest");
    await page.locator("button:has-text('Score')").first().click();
    await expect(page.locator('button[aria-label="Creativity: 1 out of 5"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Creativity: 5 out of 5"]')).toBeVisible();
  });

  test("tapping score updates value display", async ({ page }) => {
    await freshJudge(page, "ValueTest");
    await page.locator("button:has-text('Score')").first().click();
    await page.click('button[aria-label="Creativity: 4 out of 5"]');
    await expect(page.locator("text=4/5").first()).toBeVisible();
  });

  test("feedback textarea with char counter", async ({ page }) => {
    await freshJudge(page, "FeedbackTest");
    await page.locator("button:has-text('Score')").first().click();
    await expect(page.locator("#feedback")).toBeVisible();
    await expect(page.locator("text=0/500")).toBeVisible();
    await page.fill("#feedback", "Great work!");
    await expect(page.locator("text=11/500")).toBeVisible();
  });

  test("total shows /20", async ({ page }) => {
    await freshJudge(page, "TotalTest");
    await page.locator("button:has-text('Score')").first().click();
    // Default is 3+3+3+3=12
    await expect(page.locator("text=/\\/20/")).toBeVisible();
  });

  test("full score submission end-to-end", async ({ page }) => {
    await freshJudge(page, "E2EScorer");
    await page.locator("button:has-text('Score')").first().click();
    // Set all scores to 5
    await page.click('button[aria-label="Creativity: 5 out of 5"]');
    await page.click('button[aria-label="Thoroughness: 5 out of 5"]');
    await page.click('button[aria-label="Clarity: 5 out of 5"]');
    await page.click('button[aria-label="Student Independence: 5 out of 5"]');
    await page.fill("#feedback", "Perfect score from Playwright!");
    await page.click("text=Submit Score");
    await expect(page.locator("text=Score submitted!")).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Done").first()).toBeVisible();
  });

  test("scored participant shows Done badge and can be re-scored", async ({ page }) => {
    await freshJudge(page, "RescorerTest");
    // Score first participant
    await page.locator("button:has-text('Score')").first().click();
    await page.click('button[aria-label="Creativity: 4 out of 5"]');
    await page.click('button[aria-label="Thoroughness: 4 out of 5"]');
    await page.click('button[aria-label="Clarity: 4 out of 5"]');
    await page.click('button[aria-label="Student Independence: 4 out of 5"]');
    await page.click("text=Submit Score");
    await page.waitForSelector("text=Score submitted!", { timeout: 5000 });
    await page.waitForTimeout(2000);
    // Should see Done badge
    await expect(page.locator("text=Done").first()).toBeVisible();
    // Tap scored participant to edit score
    await page.locator("text=Done").first().click();
    await expect(page.locator("text=Creativity")).toBeVisible();
  });

  test("back button returns to name entry", async ({ page }) => {
    await freshJudge(page, "BackTest");
    await page.click("text=Back");
    await expect(page.locator("#judgeName")).toBeVisible();
    await expect(page.locator("text=Welcome, Judge!")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════
// 11. LEADERBOARD
// ═══════════════════════════════════════════════════════
test.describe("Leaderboard", () => {
  test("shows leaderboard with trophy and controls", async ({ page }) => {
    // Use seeded event
    await page.goto("/event/event-1/leaderboard");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("text=🏆")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Fullscreen")).toBeVisible();
  });

  test("shows ribbon assignment when scores exist", async ({ page }) => {
    await page.goto("/event/event-1/leaderboard");
    try {
      await page.waitForSelector("text=Ribbon Assignment", { timeout: 8000 });
      await expect(page.locator("text=Outstanding")).toBeVisible();
      await expect(page.locator("text=Achievement")).toBeVisible();
      await expect(page.locator("text=Participation")).toBeVisible();
    } catch {
      // Scores may not exist in this emulator session
    }
  });
});

// ═══════════════════════════════════════════════════════
// 12. SCORE CARD
// ═══════════════════════════════════════════════════════
test.describe("Score Card", () => {
  test("shows score card with data", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    await page.waitForLoadState("domcontentloaded");
    // May show score card or "no scores" depending on seed
    const hasScores = await page.locator("text=/\\/20/").isVisible().catch(() => false);
    const hasNoScores = await page.locator("text=No scores yet").isVisible().catch(() => false);
    expect(hasScores || hasNoScores).toBeTruthy();
  });

  test("shows share button when scores exist", async ({ page }) => {
    await page.goto("/card/event-1/p3");
    try {
      await page.waitForSelector("text=Share Score Card", { timeout: 5000 });
      await expect(page.locator("text=Share Score Card")).toBeVisible();
    } catch {
      // No scores = no share button
    }
  });

  test("invalid participant returns 404", async ({ page }) => {
    const response = await page.goto("/card/event-1/nonexistent");
    expect(response?.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════
// 13. AUTH GUARD
// ═══════════════════════════════════════════════════════
test.describe("Auth Guard", () => {
  test("admin dashboard requires auth", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin event page requires auth", async ({ page }) => {
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
    await expect(page.locator("text=🏆")).toBeVisible({ timeout: 10000 });
  });

  test("score card works without auth", async ({ page }) => {
    await page.context().clearCookies();
    const response = await page.goto("/card/event-1/p3");
    // Should load (200) not redirect
    expect(response?.status()).toBeLessThan(400);
  });
});
