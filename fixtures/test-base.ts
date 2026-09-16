import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ImageSessionPage } from '../pages/ImageSessionPage';
import { CustomersPage } from '../pages/CustomersPage';
import { AlignmentManualPage } from '../pages/AlignmentManualPage';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  vendorPage: vendorPage;
  CustomersPage: CustomersPage;
  AlignmentManualPage: AlignmentManualPage;
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
  vendorPage: async ({ page }, use) => {
    await use(new vendorPage(page));
  },
  CustomersPage: async ({ page }, use) => {
    await use(new CustomersPage(page));
  },
  AlignmentManualPage: async ({ page }, use) => {
    await use(new AlignmentManualPage(page));
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
