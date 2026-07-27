export type EnvName = 'dev' | 'test';

export interface EnvironmentConfig {
  name: EnvName;
  baseURL: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

function buildEnvironments(): Record<EnvName, EnvironmentConfig> {
  return {
    dev: { name: 'dev', baseURL: requireEnv('DEV_BASE_URL') },
    test: { name: 'test', baseURL: requireEnv('TEST_BASE_URL') },
  };
}

/** Which environment to run against, selected via TEST_ENV (defaults to "dev"). */
export function getCurrentEnvName(): EnvName {
  const envName = (process.env.TEST_ENV || 'dev') as EnvName;
  if (envName !== 'dev' && envName !== 'test') {
    throw new Error(`Unknown TEST_ENV "${envName}". Valid values: dev, test.`);
  }
  return envName;
}

export function getEnvironment(envName: EnvName = getCurrentEnvName()): EnvironmentConfig {
  return buildEnvironments()[envName];
}
