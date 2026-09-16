import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * NOTE: best-effort selectors -- verify against the live DOM before trusting
 * this suite (see README "Known limitations"). In particular, "set the path"
 * in the test case may mean either:
 *  (a) a web <input type="file" webkitdirectory> that opens a Playwright-
 *      interceptable file chooser (handled below via page.on('filechooser')), or
 *  (b) a native OS folder-picker dialog outside the browser, which Playwright
 *      cannot drive at all.
 * If (b), this step is not automatable and must be flagged manual, same as
 * the EMR agent tray-icon steps in Test Case 1.
 */
export class ImageSessionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private row(ImageSessionName: string): Locator {
    return this.page.getByRole('row', { name: ImageSessionName }).or(
      this.page.getByText(ImageSessionName, { exact: true }).locator('xpath=ancestor::*[self::tr or contains(@class, "ImageSession")][1]')
    );
  }

  async goto() {
    await this.page.goto('/ImageSessions');
    await this.assertNotRedirectedToLogin();
  }

  async expectImageSessionListed(ImageSessionName: string) {
    await expect(this.row(ImageSessionName)).toBeVisible();
  }

  /**
   * Double-clicks a ImageSession row and, if a web file chooser appears, sets it
   * to `downloadPath`. Throws a descriptive error if no file chooser opens
   * within the timeout, so a native-dialog mismatch fails loudly instead of
   * silently passing.
   */
  async setDownloadPath(ImageSessionName: string, downloadPath: string) {
    const fileChooserPromise = this.page
      .waitForEvent('filechooser', { timeout: 5000 })
      .catch(() => null);

    await this.row(ImageSessionName).dblclick();

    const chooser = await fileChooserPromise;
    if (!chooser) {
      throw new Error(
        `No web file chooser appeared after double-clicking "${ImageSessionName}". ` +
          `This likely opens a native OS folder picker, which Playwright cannot drive -- ` +
          `treat this step as manual (see README "Known limitations").`
      );
    }
    await chooser.setFiles(downloadPath);
  }

  async expectConfiguredPath(ImageSessionName: string, downloadPath: string) {
    await expect(this.row(ImageSessionName)).toContainText(downloadPath);
  }
}
