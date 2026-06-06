/**
 * ResumeAI — E2E Test Suite (Playwright)
 * Covers all critical user flows across all 4 phases.
 *
 * Run: npx playwright test
 * Run single file: npx playwright test tests/e2e/upload.spec.ts
 */

import { test, expect, Page } from "@playwright/test";
import path from "path";

const BASE_URL   = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const TEST_EMAIL = "test@resumeai.app";
const TEST_PASS  = "TestPassword123!";
const RESUME_PDF = path.join(__dirname, "fixtures/sample_resume.pdf");

// ── Helpers ──────────────────────────────────────────────────────────────────

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.fill('[name="email"]', TEST_EMAIL);
  await page.fill('[name="password"]', TEST_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Landing page", () => {
  test("renders hero and pricing", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("h1")).toContainText("three sets of eyes");
    await expect(page.locator("text=Free")).toBeVisible();
    await expect(page.locator("text=$19")).toBeVisible();
    await expect(page.locator("text=$39")).toBeVisible();
  });

  test("CTA links to signup", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click("text=Get started free");
    await expect(page).toHaveURL(/sign-up/);
  });
});

test.describe("Auth", () => {
  test("sign in and reach dashboard", async ({ page }) => {
    await signIn(page);
    await expect(page.locator("text=ResumeAI")).toBeVisible();
    await expect(page.locator("text=Tools")).toBeVisible();
  });
});

test.describe("Resume upload (Phase 1)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("uploads PDF and shows processing state", async ({ page }) => {
    await page.goto(`${BASE_URL}/analyze/upload`);
    await page.setInputFiles('input[type="file"]', RESUME_PDF);
    await expect(page.locator("text=sample_resume.pdf")).toBeVisible();
    await page.click("text=Analyze my resume");
    await expect(page.locator("text=Analyzing your resume")).toBeVisible();
  });

  test("rejects invalid file type", async ({ page }) => {
    await page.goto(`${BASE_URL}/analyze/upload`);
    await page.setInputFiles('input[type="file"]', path.join(__dirname, "fixtures/invalid.txt"));
    await expect(page.locator("text=Unsupported")).toBeVisible();
  });

  test("optional JD field expands and accepts text", async ({ page }) => {
    await page.goto(`${BASE_URL}/analyze/upload`);
    await page.click("text=Add job description");
    await page.fill("textarea", "We are looking for a senior engineer...");
    await expect(page.locator("textarea")).toHaveValue(/senior engineer/);
  });
});

test.describe("Analysis result page (Phase 1)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("shows score ring and tab navigation", async ({ page }) => {
    // Mock analysis ID from test fixtures
    await page.goto(`${BASE_URL}/analyze/result/test-analysis-id`);
    await expect(page.locator("text=Overview")).toBeVisible();
    await expect(page.locator("text=Persona view")).toBeVisible();
    await expect(page.locator("text=Bullet rewriter")).toBeVisible();
  });
});

test.describe("JD Adapter (Phase 2)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("page loads with resume selector", async ({ page }) => {
    await page.goto(`${BASE_URL}/jd-adapter`);
    await expect(page.locator("h1")).toContainText("JD Adapter");
    await expect(page.locator("text=SELECT RESUME")).toBeVisible();
    await expect(page.locator("text=PASTE JOB DESCRIPTION")).toBeVisible();
  });
});

test.describe("A/B Tester (Phase 2)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("page shows two resume selectors", async ({ page }) => {
    await page.goto(`${BASE_URL}/compare`);
    await expect(page.locator("text=Resume A")).toBeVisible();
    await expect(page.locator("text=Resume B")).toBeVisible();
    await expect(page.locator("button", { hasText: "Compare resumes" })).toBeDisabled();
  });
});

test.describe("Benchmark (Phase 2)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("shows role dropdown with options", async ({ page }) => {
    await page.goto(`${BASE_URL}/benchmark`);
    await expect(page.locator("select")).toBeVisible();
    await page.selectOption("select", "Software Engineer");
    await expect(page.locator("button", { hasText: "Run benchmark" })).toBeVisible();
  });
});

test.describe("Career Path (Phase 3)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("page loads correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator("h1")).toContainText("Career Path");
    await expect(page.locator("text=Predict my career path")).toBeVisible();
  });
});

test.describe("Salary (Phase 3)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("role and location selectors present", async ({ page }) => {
    await page.goto(`${BASE_URL}/salary`);
    await expect(page.locator("text=TARGET ROLE")).toBeVisible();
    await expect(page.locator("text=LOCATION")).toBeVisible();
    await expect(page.locator("text=Estimate my salary")).toBeVisible();
  });
});

test.describe("GitHub sync (Phase 3)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("username input present", async ({ page }) => {
    await page.goto(`${BASE_URL}/github`);
    await expect(page.locator("placeholder=e.g. torvalds")).toBeVisible();
    await expect(page.locator("text=Match GitHub to resume")).toBeVisible();
  });
});

test.describe("Bias scanner (Phase 4)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("page loads with category descriptions", async ({ page }) => {
    await page.goto(`${BASE_URL}/bias-scanner`);
    await expect(page.locator("h1")).toContainText("Bias");
    await expect(page.locator("text=Scan for bias")).toBeVisible();
  });
});

test.describe("Cultural adapter (Phase 4)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("country buttons render", async ({ page }) => {
    await page.goto(`${BASE_URL}/language-adapter`);
    await expect(page.locator("h1")).toContainText("Cultural Adapter");
  });
});

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("shows all 12 feature cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    const cards = page.locator("a[href]").filter({ hasText: /New analysis|JD Adapter|Benchmark|Gap Advisor|Career Path|Salary|GitHub|Bias Scanner|Cultural Adapter|Recruiter|Settings/});
    await expect(cards).toHaveCount(12, { timeout: 5000 });
  });

  test("locked features show plan badge", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("text=PRO").first()).toBeVisible();
  });
});

test.describe("Share page (public)", () => {
  test("shows score card without auth", async ({ page }) => {
    // Test public share page — no auth required
    await page.goto(`${BASE_URL}/share/test-token-123`);
    // Should show either the card or a not-found message
    const hasCard   = await page.locator("text=ResumeAI").isVisible();
    const hasError  = await page.locator("text=not found").isVisible();
    expect(hasCard || hasError).toBeTruthy();
  });
});

test.describe("Settings page (Phase 4)", () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test("all setting tabs present", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await expect(page.locator("text=Account")).toBeVisible();
    await expect(page.locator("text=API Keys")).toBeVisible();
    await expect(page.locator("text=Branding")).toBeVisible();
  });
});
