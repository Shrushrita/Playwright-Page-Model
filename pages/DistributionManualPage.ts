import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** NOTE: best-effort selectors -- verify against the live DOM (see README "Known limitations"). */
export class DistributionManualPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly searchBox: Locator = this.page.getByPlaceholder(/search/i).or(
    this.page.getByRole('searchbox')
  );
  private readonly resultsList: Locator = this.page.getByRole('list', { name: /search results/i }).or(
    this.page.getByTestId('Distribution-manual-search-results')
  );

  private sidePanelSection(name: string): Locator {
    return this.page.getByRole('button', { name, exact: false }).or(this.page.getByText(name, { exact: true }));
  }

  private focusedSection(): Locator {
    return this.page.locator('[aria-current="true"], [data-state="focused"], .is-active, .active').first();
  }

  async expectSectionFocused(sectionName: string) {
    await expect(this.focusedSection()).toContainText(sectionName);
  }

  async clickSidePanelSection(name: string) {
    await this.sidePanelSection(name).click();
  }

  async search(term: string) {
    await this.searchBox.fill(term);
  }

  async expectResultsContain(text: string) {
    await expect(this.resultsList).toContainText(text);
  }
}
