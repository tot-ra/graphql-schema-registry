FROM node:14-alpine as builder-client
ARG env=production
ENV npm_config_cache=/tmp/.npm
RUN mkdir -p /tmp/.npm /app \
    && chown nobody:nobody /tmp/.npm /app
WORKDIR /app
USER nobody

ADD package.json package-lock.json ./
RUN npm install
ADD webpack.config.cjs babel.config.cjs ./
ADD client ./client
RUN npm run build-frontend


FROM node:14-alpine as builder-app
ARG env=production
ENV npm_config_cache=/tmp/.npm
RUN mkdir -p /app && chown nobody:nobody /app
RUN mkdir -p /.npm && chown nobody:nobody /.npm
WORKDIR /app
USER nobody

ADD src ./src
ADD package.json package-lock.json tsconfig.json ./
RUN npm install
RUN npm run build-backend

FROM node:14-alpine
ARG env=production
ENV NODE_ENV=${env}
RUN mkdir -p /app && chown nobody:nobody /app
RUN mkdir -p /.npm && chown nobody:nobody /.npm

USER nobody
WORKDIR /app
COPY . /app

COPY --from=builder-client /app/dist /app/dist
COPY --from=builder-app /app/app /app/app
#ADD package.json package-lock.json ./
#COPY ./migrations /app/migrations
#COPY ./container-health.js /app/container-health.js
#COPY ./knexfile.js /app/knexfile.js

# install  production dependencies only
RUN npm install

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 CMD [ "node", "container-health.js" ]
EXPOSE 3000

CMD ["node", "app/schema-registry.js"]
