import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {string} fileName
 * @returns {Record<string, string>}
 */
function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName);
  if (!fs.existsSync(envPath)) {
    return {};
  }

  /** @type {Record<string, string>} */
  const parsed = {};
  const text = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

function readAppVersion() {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
}

const env = {
  ...loadEnvFile('.env.example'),
  ...loadEnvFile('.env'),
};

const apiOrigin = (env.API_ORIGIN || 'http://localhost:5500').replace(/\/$/, '');
const apiBasePath = env.API_BASE_PATH || '/api';
const publicBaseUrl = (env.API_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const baseUrl = publicBaseUrl || apiBasePath;
const useHttps = apiOrigin.startsWith('https://');

const proxy = {
  '/api': {
    target: apiOrigin,
    secure: useHttps,
    changeOrigin: true,
    logLevel: 'warn',
  },
  '/socket.io': {
    target: apiOrigin,
    secure: useHttps,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
  },
};

const proxyPath = path.join(projectRoot, 'proxy.conf.json');
fs.writeFileSync(proxyPath, `${JSON.stringify(proxy, null, 2)}\n`);

const environmentSource = `import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  baseUrl: ${JSON.stringify(baseUrl)},
  appVersion: ${JSON.stringify(readAppVersion())},
};
`;

const environmentPath = path.join(projectRoot, 'src', 'environments', 'environment.ts');
fs.writeFileSync(environmentPath, environmentSource);

console.log(`Wrote ${path.relative(projectRoot, proxyPath)} -> ${apiOrigin}`);
console.log(`Wrote ${path.relative(projectRoot, environmentPath)} baseUrl=${baseUrl}`);
