#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if command -v node >/dev/null 2>&1; then
  node_bin="$(command -v node)"
else
  node_bin="${HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$node_bin" ]; then
  echo 'Node.js 22.12+ is required (Node 24 recommended). Install Node, then run this script again.' >&2
  exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo 'Dependencies are missing. Run pnpm install --frozen-lockfile (or npm install) in web/.' >&2
  exit 1
fi
"$node_bin" scripts/generate-character-assets.mjs
exec "$node_bin" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort "$@"
