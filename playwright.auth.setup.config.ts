import dotenv from 'dotenv';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Separate, minimal config used only by `npm run auth:setup`. Kept apart
 * from playwright.config.ts so the interactive, headed, CAPTCHA-solving
 * step never accidentally runs as part of a normal (or CI) test run.
 */
export default defineConfig({
  testDir: './tests/setup',
  testMatch: '**/*.setup.ts',
  timeout: 5 * 60 * 1000,
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    headless: false,
  },
});
