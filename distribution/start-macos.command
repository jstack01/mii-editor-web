#!/bin/sh
# Old source-checkout entry point; release ZIPs use the documented D2 filename.
mii_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
exec /bin/sh "$mii_dir/Start Mii Editor.command" "$@"
