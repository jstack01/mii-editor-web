#!/bin/sh
mii_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
exec /bin/sh "$mii_dir/launcher.sh" "$@"
