import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AddCustomerModal } from './AddCustomerModal';

/** NOTE: best-effort selectors -- verify against the live DOM (see README "Known limitations"). */
export class CustomersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly CustomerRows: Locator = this.page.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
  private readonly addButton: Locator = this.page.getByRole('button', { name: /add/i });

  async goto() {
    await this.page.goto('/Customers');
    await this.assertNotRedirectedToLogin();
  }

  async expectListEmpty() {
    await expect(this.CustomerRows).toHaveCount(0);
  }

  async openAddCustomerModal(): Promise<AddCustomerModal> {
    await this.addButton.click();
    const modal = new AddCustomerModal(this.page);
    await modal.expectVisible();
    return modal;
  }

  async expectCustomerListed(firstName: string, lastName: string) {
    await expect(this.page.getByRole('row', { name: new RegExp(`${firstName}.*${lastName}`, 'i') })).toBeVisible();
  }

  async expectSuccessToast() {
    await expect(this.page.getByRole('status').or(this.page.getByText(/success/i))).toBeVisible();
  }
}
