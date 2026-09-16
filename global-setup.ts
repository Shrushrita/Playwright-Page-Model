import fs from 'fs';
import { getCurrentEnvName } from './config/environments';
import { getStorageStatePath } from './config/storage-state';
import type { Role } from './config/credentials';

/**
 * Login is gated behind a CAPTCHA on the hosted Auth0 login page, so it
 * can't be driven headlessly on every run. Instead, `npm run auth:setup`
 * is run once (headed) by a human who solves the CAPTCHA, and the resulting
 * session is cached to disk and reused by every test. This just fails fast
 * with a clear message if that cached session is missing.
 */
export default async function globalSetup() {
  const envName = getCurrentEnvName();
  const role: Role = 'VendorUser';
  const storagePath = getStorageStatePath(envName, role);

  if (!fs.existsSync(storagePath)) {
    throw new Error(
      `\n\nNo saved login session found for env "${envName}", role "${role}".\n` +
        `Expected it at: ${storagePath}\n\n` +
        `Run "npm run auth:setup" first (it opens a real browser window so you can solve the CAPTCHA once),\n` +
        `then re-run your tests.\n`
    );
  }
}
