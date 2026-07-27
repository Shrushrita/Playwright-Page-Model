import path from 'path';
import type { EnvName } from './environments';
import type { Role } from './credentials';

/**
 * Where the authenticated session (cookies/localStorage) for a given
 * environment + role is cached on disk. Produced by `npm run auth:setup`.
 */
export function getStorageStatePath(envName: EnvName, role: Role): string {
  return path.join(__dirname, '..', 'playwright', '.auth', `${envName}-${role}.json`);
}
