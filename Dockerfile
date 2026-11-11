# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
# Digest pins refer to multi-platform indexes; update deliberately with tests.
FROM --platform=$BUILDPLATFORM docker.io/library/node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build
WORKDIR /app
RUN npm install --global pnpm@11.25.0 --ignore-scripts
COPY web/package.json web/pnpm-lock.yaml ./web/
RUN cd web && pnpm install --frozen-lockfile --ignore-scripts
COPY LICENSE LICENSE.md LICENSE-SCOPE.json NOTICES.md ASSET_RIGHTS.md THIRD_PARTY_NOTICES.md CONTAINER_SOURCES.md release-notices.json ./
COPY LICENSES/Vite-LICENSE.md ./LICENSES/Vite-LICENSE.md
COPY web/ ./web/
COPY docker/finalize-build.mjs ./docker/finalize-build.mjs
ARG VERSION=v1.0.0
ARG REVISION=unknown
ARG SOURCE_DATE_EPOCH=0
RUN cd web && pnpm build && node ../docker/finalize-build.mjs

FROM ghcr.io/nginx/nginx-unprivileged:1.30.6-alpine-slim@sha256:e333a5b95605942b5e495645ee54fab02b112081de6dbe45d2ead3ef38e03e31 AS runtime
USER root
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/* /docker-entrypoint.d /docker-entrypoint.sh
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY LICENSES/Nginx-Unprivileged-LICENSE.txt /usr/share/licenses/nginx-unprivileged/LICENSE
COPY LICENSES/container/ /usr/share/licenses/mii-editor-runtime/
COPY --from=build --chown=0:0 /app/web/dist/ /usr/share/nginx/html/
ARG VERSION=v1.0.0
ARG REVISION=unknown
ARG SOURCE_DATE_EPOCH=0
ARG BUILD_DATE=1970-01-01T00:00:00Z
LABEL maintainer="Unofficial, unmaintained project; see https://github.com/jstack01/mii-editor-web" \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.base.name="ghcr.io/nginx/nginx-unprivileged:1.30.6-alpine-slim" \
      org.opencontainers.image.base.digest="sha256:e333a5b95605942b5e495645ee54fab02b112081de6dbe45d2ead3ef38e03e31" \
      org.opencontainers.image.title="Mii Editor Web" \
      org.opencontainers.image.description="Unofficial AI-generated, unmaintained static Mii Editor. Historical graphic rights unresolved; see NOTICES.md." \
      org.opencontainers.image.source="https://github.com/jstack01/mii-editor-web" \
      org.opencontainers.image.url="https://github.com/jstack01/mii-editor-web" \
      org.opencontainers.image.documentation="https://github.com/jstack01/mii-editor-web/blob/main/docs/DOCKER.md" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION \
      org.opencontainers.image.licenses="MIT AND LicenseRef-Historical-Assets-Unresolved AND LicenseRef-Inherited-Code-Unresolved"
USER 101:101
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/"]
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
