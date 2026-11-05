// A production-mode regression fixture only; never part of the shipped dist/.
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({build:{outDir:'test-results/diagnostics-dist',rollupOptions:{input:fileURLToPath(new URL('../diagnostics.html',import.meta.url))}}});
