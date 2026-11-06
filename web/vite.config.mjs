import {defineConfig} from 'vite';
// Relative references allow the same prebuilt site at / or /mii-editor/.
export default defineConfig({base:'./',plugins:[{name:'exclude-development-link',apply:'build',transformIndexHtml(html){return html.replace(/<p id="development-tools"[^>]*>[\s\S]*?<\/p>/,'');}}]});
