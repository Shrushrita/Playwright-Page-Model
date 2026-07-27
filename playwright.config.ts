import dotenv from 'dotenv';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './config/environments';
import { getStorageStatePath } from './config/storage-state';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const environment = getEnvironment();

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Env selection: TEST_ENV=dev|test (default "dev"), see config/environments.ts.
 * Auth: tests reuse a cached, manually-authenticated session -- see
 * global-setup.ts and tests/setup/auth.setup.ts.
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/setup/**'],
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: environment.baseURL,
    storageState: getStorageStatePath(environment.name, 'clinicUser'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
