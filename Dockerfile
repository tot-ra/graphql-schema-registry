# 1. BUILD FRONTEND source with webpack
FROM node:16-alpine as builder-frontend
ARG env=production
ENV npm_config_cache=/tmp/.npm
RUN mkdir -p /app && \
chown nobody:nobody /app
WORKDIR /app
USER nobody
COPY package.json package-lock.json ./
RUN npm install
COPY webpack.config.js babel.config.js tsconfig.json .eslintrc .editorconfig ./
COPY client ./client
RUN npm run build-frontend

# 2. BUILD BACKEND source from .ts, uses dev-dependencies
FROM node:16-alpine as builder-backend
ARG env=production
ENV npm_config_cache=/tmp/.npm
RUN mkdir -p /app && \
chown nobody:nobody /app
WORKDIR /app
USER nobody
COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build-backend

# 3. BUILD FINAL IMAGE
FROM node:16-alpine
ARG env=production
ENV NODE_ENV=${env}
RUN mkdir -p /app
WORKDIR /app
COPY --from=builder-frontend /app/dist /app/dist
COPY --from=builder-backend /app/app /app/app

# 3.1 copy only required files
COPY ./migrations /app/migrations
COPY ./container-health.js /app/container-health.js
COPY ./knexfile.js /app/knexfile.js
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

# 3.2 install production dependencies only. Cleanup cache after that
RUN mkdir -p /.npm \
&& npm ci \
&& rm -rf /.npm

USER nobody
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 CMD [ "node", "container-health.js" ]
EXPOSE 3000

CMD ["node", "app/schema-registry.js"]
