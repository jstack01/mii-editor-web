FROM mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e
RUN npm install -g pnpm@11.25.0 --ignore-scripts
WORKDIR /work
COPY web/package.json web/pnpm-lock.yaml ./web/
RUN cd web && pnpm install --frozen-lockfile --ignore-scripts
COPY web ./web
COPY LICENSE.md NOTICES.md ./
COPY LICENSES/Vite-LICENSE.md ./LICENSES/Vite-LICENSE.md
COPY optional-tools/phase7a/fixtures/records.json ./optional-tools/phase7a/fixtures/records.json
RUN cd web && pnpm build && chmod -R a+rwX /work
USER pwuser
WORKDIR /work/web
ENV MII_BROWSER_ENGINE=firefox
CMD ["node","scripts/qa-browser-suite.mjs"]
