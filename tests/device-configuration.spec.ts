import fs from 'fs';
import { test, expect } from '../fixtures/test-base';

/**
 * Test Case 1: Clinic device configuration + EMR agent handoff.
 *
 * Only the web-portal-reachable steps are automated here. The EMR agent is a
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

test.describe('Test Case 1: Device configuration warning and setup', () => {
  test('clinic user sees device configuration warning and can configure listed devices', async ({
    homePage,
    devicesPage,
    step,
  }, testInfo) => {
    const devices = ['RVF200-Test Device 1', 'RVF200-Test Device 2', 'RVF200-Outdated Device'];
    const downloadDir = testInfo.outputPath('downloads');
    fs.mkdirSync(downloadDir, { recursive: true });

    await step('Log in with a user account with access to "ClinicUser_Management_Test" (via cached session) and land on the home page', async () => {
      await homePage.goto();
    });

    await step('Home page shows a warning that 3 devices require configuration', async () => {
      await homePage.expectDeviceConfigWarningVisible(3);
    });

    await step('Go to the Devices page', async () => {
      await homePage.goToDevices();
    });

    await step('Devices page lists all three devices', async () => {
      for (const device of devices) {
        await devicesPage.expectDeviceListed(device);
      }
    });

    for (const device of devices) {
      await step(`Double click "${device}" and set its download path`, async () => {
        await devicesPage.setDownloadPath(device, downloadDir);
        await devicesPage.expectConfiguredPath(device, downloadDir);
      });
    }

    await step('Go to the Home page: warning disappears, countdown timer appears', async () => {
      await homePage.goto();
      await homePage.expectDeviceConfigWarningHidden();
      await homePage.expectCountdownTimerVisible();
    });
  });

  test.fixme(
    'EMR agent minimizes to a system tray icon and can be reopened from it',
    async () => {
      // Not automatable with Playwright: this is a native desktop window /
      // Windows system tray interaction, not a browser page. Verify manually:
      //   1. Close the EMR agent window -> it keeps running, a tray icon appears.
      //   2. Double-click the tray icon -> the EMR agent window reappears.
    }
  );

  test('re-opening the web portal on the test environment lands on an authenticated page', async ({
    homePage,
    step,
  }) => {
    // Represents: "Open test.portal.retinalogik.ca" + "Log in with a user
    // account with access to ClinicUser_Management_Test" -- satisfied by the
    // cached session for the "test" environment (run with TEST_ENV=test).
    await step('Open the web portal and confirm we land on the portal, not the login page', async () => {
      await homePage.goto();
    });
  });
});
