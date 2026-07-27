import { Page, Locator, expect } from '@playwright/test';

/** NOTE: best-effort selectors -- verify against the live DOM (see README "Known limitations"). */
export class AddPatientModal {
  private readonly dialog: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly birthDateInput: Locator;
  private readonly sexSelect: Locator;
  private readonly languageSelect: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /add patient/i });
    this.firstNameInput = this.dialog.getByLabel(/first name/i);
    this.lastNameInput = this.dialog.getByLabel(/last name/i);
    this.birthDateInput = this.dialog.getByLabel(/birth date/i);
    this.sexSelect = this.dialog.getByLabel(/sex/i);
    this.languageSelect = this.dialog.getByLabel(/language/i);
    this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async fillFirstName(value: string) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value: string) {
    await this.lastNameInput.fill(value);
  }

  async fillBirthDate(value: string) {
    await this.birthDateInput.fill(value);
  }

  async selectSex(value: string) {
    await this.sexSelect.selectOption({ label: value }).catch(async () => {
      // Fall back to a combobox/listbox pattern if this isn't a native <select>.
      await this.sexSelect.click();
      await this.page.getByRole('option', { name: value }).click();
    });
  }

  async selectLanguage(value: string) {
    await this.languageSelect.selectOption({ label: value }).catch(async () => {
      await this.languageSelect.click();
      await this.page.getByRole('option', { name: value }).click();
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
