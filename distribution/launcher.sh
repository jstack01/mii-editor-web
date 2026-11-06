#!/bin/sh
# Find an existing interpreter only. Never invoke Apple's developer-tools stub.
set -u
mii_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mii_os=$(uname -s)
mii_python=''
mii_try_python() {
    [ -n "$1" ] && [ -x "$1" ] || return 1
    mii_resolved=$1
    mii_links=0
    while [ -L "$mii_resolved" ] && [ "$mii_links" -lt 20 ]; do
        mii_link=$(readlink "$mii_resolved") || return 1
        case "$mii_link" in /*) mii_resolved=$mii_link ;; *) mii_resolved=$(dirname "$mii_resolved")/$mii_link ;; esac
        mii_parent=$(CDPATH= cd -- "$(dirname -- "$mii_resolved")" && pwd -P) || return 1
        mii_resolved=$mii_parent/$(basename "$mii_resolved")
        mii_links=$((mii_links + 1))
    done
    case "$mii_os:$mii_resolved" in Darwin:/usr/bin/python3|Darwin:/usr/bin/python3.*) return 1 ;; esac
    "$1" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3,9) else 1)' >/dev/null 2>&1 || return 1
    mii_python=$1
    return 0
}
if [ -n "${MII_PYTHON:-}" ]; then
    mii_try_python "$MII_PYTHON" || :
else
    mii_ifs=$IFS
    IFS=:
    set -f
    for mii_path in $PATH; do
        [ -n "$mii_path" ] || continue
        if mii_try_python "$mii_path/python3"; then break; fi
    done
    set +f
    IFS=$mii_ifs
    if [ -z "$mii_python" ]; then
        for mii_path in /opt/homebrew/bin/python3 /usr/local/bin/python3 /Library/Frameworks/Python.framework/Versions/Current/bin/python3; do
            if mii_try_python "$mii_path"; then break; fi
        done
    fi
    if [ -z "$mii_python" ] && [ "$mii_os" = Darwin ]; then
        # Query only; never run xcode-select --install or Apple's Python shim.
        mii_developer=$(/usr/bin/xcode-select -p 2>/dev/null) || mii_developer=''
        if [ -n "$mii_developer" ]; then
            mii_try_python "$mii_developer/Library/Frameworks/Python3.framework/Versions/Current/bin/python3" || :
            if [ -z "$mii_python" ]; then mii_try_python "$mii_developer/usr/bin/python3" || :; fi
        fi
    fi
fi
if [ -z "$mii_python" ]; then
    printf '\nMii Editor needs an existing Python 3.9 or newer installation.\n'
    printf 'Nothing was installed or changed. Apple developer-tools installers were not opened.\n'
    printf 'Optional installation instructions: https://www.python.org/downloads/\n'
    printf 'See START-HERE.md, then run this launcher again.\n'
    if [ -t 0 ] && [ "${MII_NO_PAUSE:-0}" != 1 ]; then
        printf '\nPress Enter to close. '; read -r mii_unused || :
    fi
    exit 1
fi
# Replace the wrapper with the foreground server: no detached child server.
MII_LAUNCHER=1
export MII_LAUNCHER
exec "$mii_python" "$mii_dir/serve.py" "$@"
