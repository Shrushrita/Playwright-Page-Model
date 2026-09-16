import fs from 'fs';
import { test, expect } from '../fixtures/test-base';

/**
 * Test Case 1: Vendor imagesession configuration + DTP agent handoff.
 *
 * Only the web-portal-reachable steps are automated here. The DTP agent is a
 * native desktop app: closing its window, the system tray icon it leaves
 * behind, and double-clicking that tray icon are OS-level interactions
 * Playwright cannot drive (it automates browser pages, and Electron apps
 * specifically -- not an arbitrary Windows tray icon). Those steps are
 * documented as manual below rather than faked. See README "Known
 * limitations" for options if this needs full coverage later.
 *
 * "Log in with a user account..." steps are satisfied by the cached,
 * pre-authenticated session (see fixtures/test-base.ts + README
 * "Authentication") rather than driving the login form, because the login
 * page requires a human to solve a CAPTCHA.
 */

test.describe('Test Case 1: imagesession configuration warning and setup', () => {
  test('Vendor user sees imagesession configuration warning and can configure listed imagesessions', async ({
    homePage,
    imagesessionsPage,
    step,
  }, testInfo) => {
    const imagesessions = ['Sample-Test imagesession 1', 'Sample-Test imagesession 2', 'Sample-Outdated imagesession'];
    const downloadDir = testInfo.outputPath('downloads');
    fs.mkdirSync(downloadDir, { recursive: true });

    await step('Log in with a user account with access to "VendorUser_Management_Test" (via cached session) and land on the home page', async () => {
      await homePage.goto();
    });

    await step('Home page shows a warning that 3 imagesessions require configuration', async () => {
      await homePage.expectimagesessionConfigWarningVisible(3);
    });

    await step('Go to the imagesessions page', async () => {
      await homePage.goToimagesessions();
    });

    await step('imagesessions page lists all three imagesessions', async () => {
      for (const imagesession of imagesessions) {
        await imagesessionsPage.expectimagesessionListed(imagesession);
      }
    });

    for (const imagesession of imagesessions) {
      await step(`Double click "${imagesession}" and set its download path`, async () => {
        await imagesessionsPage.setDownloadPath(imagesession, downloadDir);
        await imagesessionsPage.expectConfiguredPath(imagesession, downloadDir);
      });
    }

    await step('Go to the Home page: warning disappears, countdown timer appears', async () => {
      await homePage.goto();
      await homePage.expectimagesessionConfigWarningHidden();
      await homePage.expectCountdownTimerVisible();
    });
  });

  test.fixme(
    'DTP agent minimizes to a system tray icon and can be reopened from it',
    async () => {
      // Not automatable with Playwright: this is a native desktop window /
      // Windows system tray interaction, not a browser page. Verify manually:
      //   1. Close the DTP agent window -> it keeps running, a tray icon appears.
      //   2. Double-click the tray icon -> the DTP agent window reappears.
    }
  );

  test('re-opening the web portal on the test environment lands on an authenticated page', async ({
    homePage,
    step,
  }) => {
    // Represents: "Open test.portal.Vendor.ca" + "Log in with a user
    // account with access to VendorUser_Management_Test" -- satisfied by the
    // cached session for the "test" environment (run with TEST_ENV=test).
    await step('Open the web portal and confirm we land on the portal, not the login page', async () => {
      await homePage.goto();
    });
  });
});
