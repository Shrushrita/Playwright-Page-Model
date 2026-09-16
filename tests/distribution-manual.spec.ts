import { test } from '../fixtures/test-base';

/**
 * Test Case 3: distribution manual / Help navigation and search.
 * "Log in..." is satisfied by the cached, pre-authenticated session (see
 * README "Authentication") rather than driving the login form.
 */
test.describe('Test Case 3: distribution manual (Help)', () => {
  test('clinic user can browse and search the distribution manual', async ({
    homePage,
    distributionManualPage,
    step,
  }) => {
    await step('Navigate to the web portal (via cached session)', async () => {
      await homePage.goto();
    });

    await step('Click Help: manual opens with "Publication Information" focused', async () => {
      await homePage.openHelp();
      await distributionManualPage.expectSectionFocused('Publication Information');
    });

    await step('Click "System Description": "Getting Started" is focused', async () => {
      await distributionManualPage.clickSidePanelSection('System Description');
      await distributionManualPage.expectSectionFocused('Getting Started');
    });

    await step('Click "Instructions for Use": that section is focused', async () => {
      await distributionManualPage.clickSidePanelSection('Instructions for Use');
      await distributionManualPage.expectSectionFocused('Instructions for Use');
    });

    await step('Search by page title "FAQ": "FAQ" section is listed', async () => {
      await distributionManualPage.search('FAQ');
      await distributionManualPage.expectResultsContain('FAQ');
    });

    await step('Search by tag "controller": matching sections are listed', async () => {
      await distributionManualPage.search('controller');
      await distributionManualPage.expectResultsContain('controller');
    });

    await step('Search by description "add note": matching sections are listed', async () => {
      await distributionManualPage.search('add note');
      await distributionManualPage.expectResultsContain('add note');
    });
  });
});
