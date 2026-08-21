# Local stand-in for unpublished `@acorex-platform/client-connectivity-api`

Copied from platform `libs/connectivity/runtime`. npm `latest` does not publish this package yet.

When the next platform release publishes `@acorex-platform/client-connectivity-api`:

1. Add `"@acorex-platform/client-connectivity-api": "latest"` to `package.json`
2. Remove `src/lib/client-connectivity-api`
3. Remove the `paths` entry from `tsconfig.json`
