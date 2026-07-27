import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import { getCurrentEnvName, getEnvironment } from '../../config/environments';
import { getCredentials, type Role } from '../../config/credentials';
import { getStorageStatePath } from '../../config/storage-state';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Run this once per environment/role via `npm run auth:setup` (headed).
 * It fills in your credentials and then pauses so YOU can solve the
 * CAPTCHA and click Continue -- there is no automated way past it (see
 * README "Known limitations"). Once you resume, it saves the authenticated
 * session to disk so every other test can reuse it without logging in again.
 */
const envName = getCurrentEnvName();
const role: Role = 'clinicUser';

test(`auth setup: ${envName} / ${role}`, async ({ page }) => {
  test.setTimeout(5 * 60 * 1000); // generous window for a human to solve the CAPTCHA

  const { baseURL } = getEnvironment(envName);
  const { email, password } = getCredentials(role);
  const loginPage = new LoginPage(page);

  await loginPage.goto(baseURL);
  await loginPage.fillCredentials(email, password);

  console.log('\n================================================================');
  console.log(` A browser window is open at the login page for: ${baseURL}`);
  console.log(' Email/password are pre-filled. Enter the CAPTCHA code shown,');
  console.log(' click "Continue", then resume this script from the Playwright');
  console.log(' Inspector toolbar (the ▶ Resume button).');
  console.log('================================================================\n');

  await page.pause();

  await page.waitForURL((url) => !url.hostname.startsWith('auth.'), { timeout: 120_000 });

  const storagePath = getStorageStatePath(envName, role);
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  await page.context().storageState({ path: storagePath });

  console.log(`\nSaved authenticated session to: ${storagePath}\n`);
});
