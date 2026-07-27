import { test } from '../fixtures/test-base';
import { testPatient } from '../test-data/patients';

/**
 * Test Case 2: Patient creation in the Clinic Portal.
 * "Log in..." is satisfied by the cached, pre-authenticated session (see
 * README "Authentication") rather than driving the login form.
 */
test.describe('Test Case 2: Patient management', () => {
  test('clinic user can add a new patient', async ({ homePage, patientsPage, step }) => {
    await step('Navigate to the web portal (via cached session)', async () => {
      await homePage.goto();
    });

    await step('Go to the Patients page: list is empty', async () => {
      await patientsPage.goto();
      await patientsPage.expectListEmpty();
    });

    let modal!: Awaited<ReturnType<typeof patientsPage.openAddPatientModal>>;
    await step('Click "Add" to open the Add Patient modal: Save is disabled', async () => {
      modal = await patientsPage.openAddPatientModal();
      await modal.expectSaveDisabled();
    });

    await step(`Enter First Name "${testPatient.firstName}": Save still disabled`, async () => {
      await modal.fillFirstName(testPatient.firstName);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Last Name "${testPatient.lastName}": Save still disabled`, async () => {
      await modal.fillLastName(testPatient.lastName);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Birth Date "${testPatient.birthDate}": Save still disabled`, async () => {
      await modal.fillBirthDate(testPatient.birthDate);
      await modal.expectSaveDisabled();
    });

    await step(`Enter Sex "${testPatient.sex}": Save becomes enabled`, async () => {
      await modal.selectSex(testPatient.sex);
      await modal.expectSaveEnabled();
    });

    await step(`Enter Language "${testPatient.language}": Save still enabled`, async () => {
      await modal.selectLanguage(testPatient.language);
      await modal.expectSaveEnabled();
    });

    await step('Press Save: modal closes, success toast appears, patient is listed', async () => {
      await modal.save();
      await modal.expectClosed();
      await patientsPage.expectSuccessToast();
      await patientsPage.expectPatientListed(testPatient.firstName, testPatient.lastName);
    });
  });
});
