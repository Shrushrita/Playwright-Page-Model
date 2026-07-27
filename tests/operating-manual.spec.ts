import { test } from '../fixtures/test-base';

/**
 * Test Case 3: Operating manual / Help navigation and search.
 * "Log in..." is satisfied by the cached, pre-authenticated session (see
 * README "Authentication") rather than driving the login form.
 */
test.describe('Test Case 3: Operating manual (Help)', () => {
  test('clinic user can browse and search the operating manual', async ({
    homePage,
    operatingManualPage,
    step,
  }) => {
    await step('Navigate to the web portal (via cached session)', async () => {
      await homePage.goto();
    });

    await step('Click Help: manual opens with "Publication Information" focused', async () => {
      await homePage.openHelp();
      await operatingManualPage.expectSectionFocused('Publication Information');
    });

    await step('Click "System Description": "Getting Started" is focused', async () => {
      await operatingManualPage.clickSidePanelSection('System Description');
      await operatingManualPage.expectSectionFocused('Getting Started');
    });

    await step('Click "Instructions for Use": that section is focused', async () => {
      await operatingManualPage.clickSidePanelSection('Instructions for Use');
      await operatingManualPage.expectSectionFocused('Instructions for Use');
    });

    await step('Search by page title "FAQ": "FAQ" section is listed', async () => {
      await operatingManualPage.search('FAQ');
      await operatingManualPage.expectResultsContain('FAQ');
    });

    await step('Search by tag "controller": matching sections are listed', async () => {
      await operatingManualPage.search('controller');
      await operatingManualPage.expectResultsContain('controller');
    });

    await step('Search by description "add comment": matching sections are listed', async () => {
      await operatingManualPage.search('add comment');
      await operatingManualPage.expectResultsContain('add comment');
    });
  });
});
