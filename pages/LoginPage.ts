import { Page, Locator } from '@playwright/test';

/**
 * Auth0-hosted Universal Login page (auth.retinalogik.ca). Field selectors
 * below were confirmed against the live dev portal. The form also renders a
 * required image CAPTCHA ("captcha" field) that regenerates on every load --
 * there is no reliable, non-evasive way to complete it headlessly, which is
 * why this page object only fills the two credential fields. See
 * tests/setup/auth.setup.ts and the README "Authentication" section for how
 * login is actually completed (once, manually) and reused by every test.
 */
export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly continueButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  }

  async goto(baseURL: string) {
    await this.page.goto(baseURL);
  }

  /** Fills credentials only. Submitting still requires a human to solve the CAPTCHA. */
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async isDisplayed() {
    return this.emailInput.isVisible();
  }

  getContinueButton() {
    return this.continueButton;
  }
}
