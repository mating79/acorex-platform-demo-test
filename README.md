# ACoreX Platform demo (npm consumer)

Standalone Angular client copied from the platform workspace `apps/demo`, but every `@acorex-platform/*` library comes from **npm `latest`** instead of `libs/`.

There is no backend in this repo. Point `.env` at any running ACoreX Platform API (local `demo-api`, Demis, AU, FI, …).

## Setup

```bash
cd D:\projects\acorex-platform-demo-npm
cp .env.example .env
npm install
npm start
```

UI: [http://localhost:4800](http://localhost:4800)

Default API origin is `http://localhost:5500`. Seeded login on a local demo-api is `super-root` / `123`.

## Change the backend URL

Edit `.env`:

```
API_ORIGIN=http://localhost:5500
API_BASE_PATH=/api
```

Then run `npm start` again (`prestart` rewrites `proxy.conf.json`).

- **Recommended (local / cookie auth):** keep `API_BASE_PATH=/api`. The dev server proxies `/api` and `/socket.io` to `API_ORIGIN`, so HttpOnly cookies stay first-party.
- **Absolute URL:** set `API_PUBLIC_BASE_URL=https://host/api`. The app calls that origin directly. The API must allow CORS with credentials for `http://localhost:4800` (`Access-Control-Allow-Origin` cannot be `*`).

Examples:

```
# Local Docker demo-api
API_ORIGIN=http://localhost:5500

# Another machine
API_ORIGIN=http://192.168.1.20:5500

# Hosted API + CORS (optional)
API_PUBLIC_BASE_URL=https://dev.acorexui.com/api
```

## What this app installs vs wires

- **Installed:** every published client package from the platform publish workflow (`framework-client`, `framework-shared`, `client-connectivity-api`, all `module-*-client` / `extension-*-client`, plus published gateways/domains those clients need).
- **Wired in `app.config.ts`:** the same modules as workspace `apps/demo` (demo parity). Extra packages are dependencies only so install/resolve can be checked.

## Connectivity

npm `latest` does **not** include `@acorex-platform/client-connectivity-api` yet. This app vendors that runtime under `src/lib/client-connectivity-api` and maps the same import path in `tsconfig.json`.

After the next platform release that publishes the package: add it to `package.json`, delete the local folder, and remove the `paths` entry.

`@acorex-platform/client-connectivity-host` is **not** on npm. This app therefore:

- Vendors runtime CQRS under `src/lib/client-connectivity-api`
- Provides `AXPFileStorageService` via `src/app/file-storage-api.service.ts` (same implementation the host would register)

Features that only exist behind unpublished gateways (host seed UI, some integration HTTP adapters) are still out of scope.

## Packages

`@acorex-platform/*` versions are `"latest"` in `package.json`. Re-run `npm install` after a platform release to pick up a new publish.

This app uses Angular `22.0.8` (same as the platform workspace). Current npm `latest` client packages still declare `@angular/*@^21` peers, so `.npmrc` sets `legacy-peer-deps=true`. After the next platform release that publishes Angular 22 peers, that flag can stay; it only ignores peer mismatches.

UI kit versions match the platform workspace: `@acorex/*@22.1.0-next.14`. Direct deps also include `@acorex` peers that pnpm would hoist in the platform workspace (`polytype`, `swiper`, `quill`, CodeMirror, Editor.js, `tw-animate`, …) so a plain npm install can compile.
