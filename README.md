# Playwright Page Model Based Test Review

Playwright automation for the our web portal (dev/test environments), built around the Page Object Model, config-driven environments/roles, and a stepwise HTML report with screenshots per step.

## Table of contents

- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Authentication (read this first)](#authentication-read-this-first)
- [Running tests](#running-tests)
- [Viewing the stepwise report](#viewing-the-stepwise-report)
- [Switching environments and roles](#switching-environments-and-roles)
- [Test cases covered](#test-cases-covered)
- [Known limitations](#known-limitations)
- [Extending the framework](#extending-the-framework)

## Architecture

```text
+-----------------------------------------------------------------------+
|  tests/*.spec.ts                                                       |
|  One file per test case. Reads like the test case steps: each step    |
|  is a step(title, fn) call -> shows as a step in the HTML report       |
|  with a screenshot attached.                                          |
+-------------------------------+---------------------------------------+
                                 | uses
+-------------------------------v---------------------------------------+
|  fixtures/test-base.ts                                                 |
|  Extends Playwright's `test` with:                                     |
|   - one fixture per Page Object (homePage, ImagesPage, ...)           |
|   - a `step()` fixture: test.step() + auto screenshot attachment       |
+-------------------------------+---------------------------------------+
                                 | drives
+-------------------------------v---------------------------------------+
|  pages/*.ts  (Page Object Model)                                       |
|  One class per screen/component. Specs never touch selectors           |
|  directly -- only page objects do. Keeps locator changes isolated      |
|  from test logic.                                                     |
+-------------------------------+---------------------------------------+
                                 | reads
+-------------------------------v---------------------------------------+
|  config/*.ts                                                           |
|   - environments.ts:  TEST_ENV=dev|test -> base URL                    |
|   - credentials.ts:   role -> {email, password} from .env              |
|   - storage-state.ts: env+role -> cached authenticated session path    |
+-------------------------------+---------------------------------------+
                                 | configured by
+-------------------------------v---------------------------------------+
|  playwright.config.ts            -- normal test runs (chromium/ff/wk)  |
|  playwright.auth.setup.config.ts -- one-off, headed, manual login      |
|  global-setup.ts                 -- fails fast if no cached session    |
|  tests/setup/auth.setup.ts       -- the actual manual login script     |
+-------------------------------------------------------------------------+
```

Design principles:

- **Page Object Model** -- all locators live in `pages/`, never inline in specs. If the UI changes, you fix one page object, not every test that touches that screen.
- **Config-driven, not hardcoded** -- base URL and credentials are resolved from `.env` at runtime via `config/`, so the same spec runs against dev or test, and against different user roles, without editing test code.
- **Session reuse instead of scripted login** -- see [Authentication](#authentication-read-this-first). This is the one deliberate deviation from "automate every step exactly as written," and it's driven by a real constraint (a CAPTCHA), not a shortcut.
- **Stepwise, visual reporting** -- every logical step in a test case is wrapped in `step(...)`, which shows up as a labelled step in Playwright's HTML report with a screenshot attached, so a reviewer can see what happened at each point without re-running the suite.

## Project structure

```text
config/
  environments.ts       Base URL per environment (TEST_ENV=dev|test)
  credentials.ts        Credentials per role, read from .env
  storage-state.ts       Path to the cached authenticated session per env+role
fixtures/
  test-base.ts           Custom `test`/`expect` with page-object fixtures + step()
pages/
  BasePage.ts            Shared behaviour (detect being bounced back to login)
  LoginPage.ts            Auth0 hosted login page (fills credentials only)
  HomePage.ts             Home page: device warning, countdown, nav
  ImagesPage.ts          Images list + per-device download path configuration
  TestSessionsPage.ts         TestSessions list + "Add" entry point
  AddPatientModal.ts      Add Patient modal fields and Save button
  OperatingManualPage.ts  Help / operating manual panel, side nav, search
test-data/
  TestSessions.ts             Static test data for patient creation
tests/
  setup/
    auth.setup.ts         One-off, manual, headed login -- see below
  device-configuration.spec.ts   Test Case 1 (web-automatable parts)
  patient-management.spec.ts     Test Case 2
  operating-manual.spec.ts       Test Case 3
playwright.config.ts             Main config used by `npm test`
playwright.auth.setup.config.ts  Isolated config used only by `npm run auth:setup`
global-setup.ts                  Guards against running tests with no cached session
.env.example                     Template for required environment variables
.env                              Your real values (gitignored, never commit this)
```

## Prerequisites

- Node.js (LTS)
- Access to the RetinaLogik dev and/or test portals with a user scoped to the `ImageSession_Admin_Test` clinic

## Setup

```bash
npm install
npx playwright install --with-deps   # first time only, installs browsers
cp .env.example .env                  # then fill in the values below
```

Fill in `.env`:

```dotenv
TEST_ENV=dev
DEV_BASE_URL=https://dev.quickconfig.girate.com
TEST_BASE_URL=https://test.quickconfig.girate.com
ADMIN_USER_EMAIL=<your test account email>
ADMIN_USER_PASSWORD=<your test account password>
```

`.env` is gitignored -- it never gets committed. Never paste real credentials into commit messages, PR descriptions, or issues either.

## Authentication (read this first)

The login page is Auth's hosted Universal Login, and it renders a **required image CAPTCHA** that regenerates on every page load. There is no reliable way to solve that headlessly without building a CAPTCHA-bypass -- which this framework deliberately does not do, since that would be circumventing a security control rather than testing the product.

Instead, login is done **once, manually, per environment**, and the resulting session is cached and reused by every automated test:

```bash
npm run auth:setup
```

This opens a real (headed) Chrome window with your credentials already filled in. When it pauses:

1. Read the CAPTCHA code shown in the browser window.
2. Type it into the CAPTCHA field.
3. Click **Continue**.
4. Click **Resume (▶)** in the Playwright Inspector toolbar that opened alongside it.

The script then saves your authenticated session to `playwright/.auth/<env>-<role>.json` (gitignored). Every test in `tests/` reuses that file via `storageState` -- they never touch the login form.

**When to re-run `npm run auth:setup`:** whenever a test fails with an error like `Redirected to the login page -- the cached session has likely expired`. Sessions expire; this is expected and not a bug.

**To authenticate against the test environment** instead of dev:

```bash
# PowerShell
$env:TEST_ENV="test"; npm run auth:setup
# bash
TEST_ENV=test npm run auth:setup
```

## Running tests

```bash
npm test                 # all specs, all browsers (chromium/firefox/webkit)
npm run test:chromium    # just chromium (fastest for local iteration)
npm run test:headed      # see the browser while it runs
npm run test:ui          # Playwright's interactive UI mode
npm run test:debug       # step through with the Inspector
npm run report           # open the last HTML report
```

Tests run against whatever `TEST_ENV` currently resolves to (default `dev`, see below), using the
cached session for that environment produced by `npm run auth:setup`.

## Viewing the stepwise report

`npm run report` opens Playwright's HTML report. Each test is broken into the same named steps used in `tests/*.spec.ts` (one per row of the original test case), and every step has a full-page screenshot attached -- click a step to expand it and see its screenshot inline, no re-run needed. On failure, a trace and video are also attached (see `playwright.config.ts`) for deeper debugging.

## Switching environments and roles

Environment is selected via `TEST_ENV`:

```bash
# PowerShell
$env:TEST_ENV="test"; npm test
# bash
TEST_ENV=test npm test
```

Valid values: `dev`, `test` (see `config/environments.ts`).

Roles are defined in `config/credentials.ts` as a lookup from a role name to a pair of `.env` keys. Only `clinicUser` exists today. To add another role (e.g. a clinic admin):

1. Add `CLINIC_ADMIN_EMAIL` / `CLINIC_ADMIN_PASSWORD` to `.env.example` and your `.env`.
2. Add `'clinicAdmin'` to the `Role` union and `ROLE_ENV_KEYS` in `config/credentials.ts`.
3. Run `npm run auth:setup` for that role (you'll need to parameterize the role in `tests/setup/auth.setup.ts`, currently hardcoded to `AdminUser`) to produce its own cached session file.
4. Point `storageState` at that role's file (in `playwright.config.ts`, or per-test via `test.use({ storageState: ... })`) for specs that need it.

## Test cases covered

| File | Test case | Notes |
| --- | --- | --- |
| `tests/device-configuration.spec.ts` | TC1: Device configuration warning, Images page, download path setup, home page countdown | EMR agent tray-icon steps are **not automated** -- see [Known limitations](#known-limitations) |
| `tests/patient-management.spec.ts` | TC2: Add Patient modal, field-by-field Save-button enablement, save + toast + list | |
| `tests/operating-manual.spec.ts` | TC3: Help / operating manual navigation and search (by title, tag, description) | |

Every "Log in with a user account..." step in the original test cases is represented in code as
landing on an already-authenticated page (via the cached session), with an assertion that we
were *not* bounced back to the login page -- see [Authentication](#authentication-read-this-first).

## Known limitations

**1. Login CAPTCHA.** Covered above -- handled via a one-time manual session capture, not scripted.

**2. EMR desktop agent (Test Case 1).** Closing the EMR agent window, the system tray icon it leaves behind, and double-clicking that tray icon are native Windows/desktop interactions.
Playwright automates browser pages (and Electron apps specifically, via a dedicated API) -- it has no way to drive an arbitrary application's system tray. These steps are marked with
`test.fixme(...)` in `device-configuration.spec.ts` with the manual verification steps written out in a comment, rather than faked as passing.

If full coverage of this flow is required, the options are:

- If the EMR agent is itself an Electron app, Playwright's Electron API (`_electron.launch(...)`) can drive its window (not its tray icon) -- would need the app's executable path.
- Otherwise, a Windows UI-automation tool (e.g. WinAppDriver, or a PowerShell/AutoIt script) run alongside Playwright, orchestrated from the same test.

**3. Device "set download path" (Test Case 1).** The test case says double-clicking a device lets you "set the path to your preferred download location." `pages/ImagesPage.ts` implements this assuming it's a standard web file input (Playwright intercepts it via the `filechooser` event). If the real app instead opens a native OS folder-picker dialog outside the browser, Playwright cannot drive it, and `setDownloadPath()` will throw a clear error saying so rather than hanging or silently passing -- treat that step as manual if you hit that error.

**4. Locators are best-effort, not verified against the live DOM.** The CAPTCHA also blocks scripted reconnaissance of the app past the login page, so `HomePage`, `ImagesPage`, `TestSessionsPage`, `AddPatientModal`, and `OperatingManualPage` use resilient, role/label-based locators inferred from the test case wording -- they have **not** been confirmed against the actual rendered pages. Before trusting a real test run:

1. Run `npm run auth:setup` once to get a valid session.
2. Use Playwright's codegen against that session to inspect real selectors and adjust the page    objects if needed:

   ```bash
   npx playwright codegen --load-storage=playwright/.auth/dev-AdminUser.json https://dev.quickconfig.girate.com
   ```

3. Run the target spec and fix any locator that doesn't match (`npm run test:debug` is the fastest way to step through and see exactly where a locator misses).

`LoginPage.ts` is the one exception -- its selectors (`#username`, `#password`, the "Continue" button) were confirmed directly against the live dev login page.

## Extending the framework

- **New page/screen:** add a class to `pages/`, add a fixture for it in `fixtures/test-base.ts`.
- **New test case:** add a spec under `tests/`, wrap each logical step in `step('...', async () =>  { ... })` so it shows up in the HTML report with a screenshot.
- **New environment:** add it to `EnvName` and the environments map in `config/environments.ts`,  plus its base URL to `.env.example`/`.env`.
- **New role:** see [Switching environments and roles](#switching-environments-and-roles).
- **CI:** `.github/workflows/playwright.yml` currently runs `npx playwright test` on every push/PR.
  Because auth requires a human to solve a CAPTCHA, CI needs a pre-generated storage state file supplied as a secret (e.g. decode a `PLAYWRIGHT_AUTH_STATE` repo secret into `playwright/.auth/dev-clinicUser.json` in a step before running tests) rather than running `auth:setup` itself.
