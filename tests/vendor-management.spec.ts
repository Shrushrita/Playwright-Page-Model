import { test } from '../fixtures/test-base';
import { testvendor } from '../test-data/vendors';

/**
 * Test Case 2: vendor creation in the Clinic Portal.
 * "Log in..." is satisfied by the cached, pre-authenticated session (see
 * README "Authentication") rather than driving the login form.
 */
test.describe('Test Case 2: vendor management', () => {
  test('clinic user can add a new vendor', async ({ homePage, vendorsPage, step }) => {
    await step('Navigate to the web portal (via cached session)', async () => {
      await homePage.goto();
    });

    await step('Go to the vendors page: list is empty', async () => {
      await vendorsPage.goto();
      await vendorsPage.expectListEmpty();
    });

    let modal!: Awaited<ReturnType<typeof vendorsPage.openAddvendorModal>>;
    await step('Click "Add" to open the Add vendor modal: Save is disabled', async () => {
      modal = await vendorsPage.openAddvendorModal();
      await modal.expectSaveDisabled();
    });

    await step(`Enter First Name "${testvendor.firstName}": Save still disabled`, async () => {
      await modal.fillFirstName(testvendor.firstName);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Last Name "${testvendor.lastName}": Save still disabled`, async () => {
      await modal.fillLastName(testvendor.lastName);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Birth Date "${testvendor.birthDate}": Save still disabled`, async () => {
      await modal.fillBirthDate(testvendor.birthDate);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Sex "${testvendor.sex}": Save becomes enabled`, async () => {
      await modal.selectSex(testvendor.sex);
      await modal.expectSaveEnabled();
    });

    await step(`Enter Language "${testvendor.language}": Save still enabled`, async () => {
      await modal.selectLanguage(testvendor.language);
      await modal.expectSaveEnabled();
    });

    await step('Press Save: modal closes, success toast appears, vendor is listed', async () => {
      await modal.save();
      await modal.expectClosed();
      await vendorsPage.expectSuccessToast();
      await vendorsPage.expectvendorListed(testvendor.firstName, testvendor.lastName);
    });
  });
});
