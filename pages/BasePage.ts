import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * The login flow redirects to Auth0's hosted page (auth.<domain>). If a
   * cached session expired, any `page.goto()` inside the app bounces back
   * here. Every authenticated page should check this instead of silently
   * timing out on a locator that will never appear.
   */
  async assertNotRedirectedToLogin() {
    await expect(
      this.page,
      'Redirected to the login page -- the cached session has likely expired. Re-run "npm run auth:setup".'
    ).not.toHaveURL(/auth\./);
  }
}
