import {defineConfig,configDefaults} from 'vitest/config';
import {readFileSync} from 'node:fs';
const legacy=JSON.parse(readFileSync(new URL('./scripts/legacy-tests.json',import.meta.url)));
export default defineConfig({test:{exclude:[...configDefaults.exclude,...(process.env.MII_LEGACY_TESTS==='1'?[]:legacy)]}});
