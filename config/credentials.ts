/**
 * Roles map to credential sets in .env. Add a new role by adding an entry
 * here, in .env.example, and in your local .env.
 */
export type Role = 'clinicUser';

export interface Credentials {
  email: string;
  password: string;
}

const ROLE_ENV_KEYS: Record<Role, { email: string; password: string }> = {
  clinicUser: { email: 'CLINIC_USER_EMAIL', password: 'CLINIC_USER_PASSWORD' },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

export function getCredentials(role: Role = 'clinicUser'): Credentials {
  const keys = ROLE_ENV_KEYS[role];
  if (!keys) {
    throw new Error(`Unknown role "${role}". Known roles: ${Object.keys(ROLE_ENV_KEYS).join(', ')}`);
  }
  return {
    email: requireEnv(keys.email),
    password: requireEnv(keys.password),
  };
}
