import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AddPatientModal } from './AddPatientModal';

/** NOTE: best-effort selectors -- verify against the live DOM (see README "Known limitations"). */
export class PatientsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly patientRows: Locator = this.page.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
  private readonly addButton: Locator = this.page.getByRole('button', { name: /add/i });

  async goto() {
    await this.page.goto('/patients');
    await this.assertNotRedirectedToLogin();
  }

  async expectListEmpty() {
    await expect(this.patientRows).toHaveCount(0);
  }

  async openAddPatientModal(): Promise<AddPatientModal> {
    await this.addButton.click();
    const modal = new AddPatientModal(this.page);
    await modal.expectVisible();
    return modal;
  }

  async expectPatientListed(firstName: string, lastName: string) {
    await expect(this.page.getByRole('row', { name: new RegExp(`${firstName}.*${lastName}`, 'i') })).toBeVisible();
  }

  async expectSuccessToast() {
    await expect(this.page.getByRole('status').or(this.page.getByText(/success/i))).toBeVisible();
  }
}
