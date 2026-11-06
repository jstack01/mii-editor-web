# Phase 7A analysis tools

These are **optional developer/lab tools**, not part of the website, Docker image or release ZIPs. They do not provide a live Wii/Dolphin importer. No existing database, NAND, game save, console ownership or record ID is modified.

`database_probe.py inspect COPY/RFL_DB.dat` reads a database without writing it. It checks the reviewed database length, headers, header checksum, 100 record slots and duplicate persistent eight-byte IDs. This is deliberately not an exhaustive Nintendo database, texture or ownership validator.

`build-reference` invokes an external, independently implemented Java container builder. It accepts only a **new output directory**, writes a **new synthetic database**, verifies the exact input records and compares the external CRC with Python's standard library. Never install this synthetic database over an existing database: it has an empty Parade and no existing avatars/textures.

Requirements: existing Python 3.9+ and Java JDK (`java`, `javac`) for the optional reference experiment. Nothing is installed automatically. The ordinary editor requires neither JDK nor this tool.

```sh
python3 optional-tools/phase7a/database_probe.py build-reference \
  --mii /path/to/exported.mii \
  --work-dir /path/to/NEW-empty-lab-directory \
  --fetch-reference
python3 optional-tools/phase7a/database_probe.py inspect /path/to/NEW-empty-lab-directory/RFL_DB.dat
```

The output directory **must not exist**; its parent must exist. `--fetch-reference` explicitly permits downloading only `Util.java` from Alex9303/Mii-Database-Editor commit `ae6a5372b302f5036f82c21db6a050cff1c486b4`, SHA-256 `3b9f7f00a43d9c94ad4d66e8853aeec210bc798cf4c948d7ad41f16a509470af`. Alternatively pass `--reference /path/to/Util.java` for an offline, hash-checked run. The external source is not redistributed, linked into the editor or relicensed by this project. We execute its data functions only, not its GUI or online avatar-preview downloader. The bridge writes with Java `CREATE_NEW` as a second overwrite safeguard.

To reproduce the test matrix, from `web/` run:

```sh
MII_PHASE7_RECORDS=/tmp/phase7-records.json pnpm exec vitest run test-support/phase7a.integration.test.ts
```

Then supply `--records /tmp/phase7-records.json` instead of `--mii`. That labelled set intentionally includes invalid and duplicate-ID negatives: **it is not an export-ready collection**. Filter the JSON to the intended cases before creating each isolated container. The primary positive test used both defaults, eight randomized records and the three repaired `FAIL-*` records (13 total). Historical or negative records are never silently repaired by this analysis tool.

Run safeguards with `python3 -m unittest discover -s scripts -p test_phase7a.py -v`. See [the verification report](../../web/PHASE7_VERIFICATION.md) and [safe manual guide](../../docs/WII_DOLPHIN_TESTING.md) before using Dolphin. Do not commit downloaded reference source, copied emulator resources, real databases, NAND contents or keys.
