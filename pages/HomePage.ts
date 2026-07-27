import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * NOTE: selectors in this file are best-effort, derived from the test case
 * wording -- they have NOT been verified against the live DOM (the CAPTCHA on
 * login blocks scripted reconnaissance; see README "Known limitations").
 * Before relying on this suite, run `npm run auth:setup` once, then refine
 * these locators with `npx playwright codegen --load-storage=<storageState> <url>`.
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly deviceConfigWarning: Locator = this.page.getByText(
    /devices? that require configuration/i
  );

  private readonly countdownTimer: Locator = this.page.getByTestId('home-countdown-timer').or(
    this.page.getByText(/\b\d{1,2}\s*(s|sec|seconds)?\b.*countdown/i)
  );

  private readonly devicesNavLink: Locator = this.page.getByRole('link', { name: 'Devices', exact: false });
  private readonly patientsNavLink: Locator = this.page.getByRole('link', { name: 'Patients', exact: false });
  private readonly helpButton: Locator = this.page.getByRole('button', { name: 'Help', exact: false }).or(
    this.page.getByRole('link', { name: 'Help', exact: false })
  );

  async goto() {
    await this.page.goto('/');
    await this.assertNotRedirectedToLogin();
  }

  async expectDeviceConfigWarningVisible(deviceCount?: number) {
    await expect(this.deviceConfigWarning).toBeVisible();
    if (deviceCount !== undefined) {
      await expect(this.deviceConfigWarning).toContainText(String(deviceCount));
    }
  }

  async expectDeviceConfigWarningHidden() {
    await expect(this.deviceConfigWarning).toBeHidden();
  }

  async expectCountdownTimerVisible() {
    await expect(this.countdownTimer).toBeVisible();
  }

  async goToDevices() {
    await this.devicesNavLink.click();
  }

  async goToPatients() {
    await this.patientsNavLink.click();
  }

  async openHelp() {
    await this.helpButton.click();
  }
}
