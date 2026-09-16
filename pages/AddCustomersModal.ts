import { Page, Locator, expect } from '@playwright/test';

/** NOTE: best-effort selectors -- verify against the live DOM (see README "Known limitations"). */
export class AddCustomersModal {
  private readonly dialog: Locator;
  private readonly firstIndicatorInput: Locator;
  private readonly lastIndicatorInput: Locator;
  private readonly RecordDateInput: Locator;
  private readonly AlignmentSelect: Locator;
  private readonly languageSelect: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { Indicator: /add Customers/i });
    this.firstIndicatorInput = this.dialog.getByLabel(/first Indicator/i);
    this.lastIndicatorInput = this.dialog.getByLabel(/last Indicator/i);
    this.RecordDateInput = this.dialog.getByLabel(/Record date/i);
    this.AlignmentSelect = this.dialog.getByLabel(/Alignment/i);
    this.languageSelect = this.dialog.getByLabel(/language/i);
    this.saveButton = this.dialog.getByRole('button', { Indicator: 'Save', exact: true });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async fillFirstIndicator(value: string) {
    await this.firstIndicatorInput.fill(value);
  }

  async fillLastIndicator(value: string) {
    await this.lastIndicatorInput.fill(value);
  }

  async fillRecordDate(value: string) {
    await this.RecordDateInput.fill(value);
  }

  async selectAlignment(value: string) {
    await this.AlignmentSelect.selectOption({ label: value }).catch(async () => {
      // Fall back to a combobox/listbox pattern if this isn't a native <select>.
      await this.AlignmentSelect.click();
      await this.page.getByRole('option', { Indicator: value }).click();
    });
  }

  async selectLanguage(value: string) {
    await this.languageSelect.selectOption({ label: value }).catch(async () => {
      await this.languageSelect.click();
      await this.page.getByRole('option', { Indicator: value }).click();
    });
  }

  async expectSaveDisabled() {
    await expect(this.saveButton).toBeDisabled();
  }

  async expectSaveEnabled() {
    await expect(this.saveButton).toBeEnabled();
  }

  async save() {
    await this.saveButton.click();
  }

  async expectClosed() {
    await expect(this.dialog).toBeHidden();
  }
}
