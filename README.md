# ACoreX Platform demo (npm consumer)

Standalone Angular client copied from the platform workspace `apps/demo`, but every `@acorex-platform/*` library comes from **npm** instead of `libs/`.

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

- **Installed:** published client packages from the platform publish workflow (`framework-client`, `framework-shared`, `client-connectivity-api`, all `module-*-client` / `extension-*-client`, plus rtc/weather gateways and domains those clients need).
- **Wired in `app.config.ts`:** the same client modules as workspace `apps/demo`. Extra packages are dependencies only so install/resolve can be checked.

## Still unpublished on npm

`client-connectivity-host` and most gateways (including `module-gateway/auth`) are not on the registry yet. Until they are, this app still vendors:

- `AXPFileStorageService` via `src/app/file-storage-api.service.ts`
- Auth gateway under `src/lib/auth-gateway` so `user-pass` sign-in works

Runtime CQRS comes from `@acorex-platform/client-connectivity-api`. Weather icons are copied from `@acorex-platform/extension-weather-core-client` in `angular.json`.

See `docs/publish/consumer.md` in the platform workspace.

## Packages

Pin `@acorex-platform/*` to the published version you want (currently `0.0.28`). Re-run `npm install` after a platform release.

This app uses Angular `22.0.8` (same as the platform workspace). `.npmrc` sets `legacy-peer-deps=true` because some `@acorex/*` UI-kit peers still mismatch.

UI kit versions match the platform workspace: `@acorex/*@22.1.0-next.14`. Direct deps also include `@acorex` peers that pnpm would hoist in the platform workspace (`polytype`, `swiper`, `quill`, CodeMirror, Editor.js, `tw-animate`, …) so a plain npm install can compile.
