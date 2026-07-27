import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { DevicesPage } from '../pages/DevicesPage';
import { PatientsPage } from '../pages/PatientsPage';
import { OperatingManualPage } from '../pages/OperatingManualPage';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  devicesPage: DevicesPage;
  patientsPage: PatientsPage;
  operatingManualPage: OperatingManualPage;
  /**
   * Wraps a block of actions as a named `test.step` (shown in the HTML
   * report) and attaches a full-page screenshot taken right after the step
   * runs -- the "snippet" requested for the stepwise report.
   */
  step: <T>(title: string, action: () => Promise<T>) => Promise<T>;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  devicesPage: async ({ page }, use) => {
    await use(new DevicesPage(page));
  },
  patientsPage: async ({ page }, use) => {
    await use(new PatientsPage(page));
  },
  operatingManualPage: async ({ page }, use) => {
    await use(new OperatingManualPage(page));
  },
  step: async ({ page }, use, testInfo) => {
    await use(async (title, action) => {
      return test.step(title, async () => {
        const result = await action();
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach(title, { body: screenshot, contentType: 'image/png' });
        return result;
      });
    });
  },
});

export { expect };
