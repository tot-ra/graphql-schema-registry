FROM node:14-alpine as builder-client
ARG env=production
ENV npm_config_cache=/tmp/.npm
RUN mkdir -p /tmp/.npm /app \
    && chown nobody:nobody /tmp/.npm /app
WORKDIR /app
USER nobody

ADD package.json package-lock.json ./
RUN npm install
ADD webpack.config.js babel.config.js ./
ADD client ./client
RUN npx webpack-cli --env=${env} --mode=${env}


FROM node:14-alpine as builder-app
ARG env=production
ENV npm_config_cache=/tmp/.npm
ENV NODE_ENV=${env}
RUN mkdir -p /app && chown nobody:nobody /app
COPY --from=builder-client /tmp/.npm /tmp/.npm
WORKDIR /app
USER nobody
ADD package.json package-lock.json ./
RUN npm install

FROM node:14-alpine
ARG env=production
ENV NODE_ENV=${env}
RUN mkdir -p /app && chown nobody:nobody /app
USER nobody
WORKDIR /app
COPY . /app
COPY --from=builder-client /app/dist /app/dist
COPY --from=builder-app /app/node_modules /app/node_modules

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 CMD [ "node", "container-health.js" ]
EXPOSE 3000

CMD ["node", "schema-registry.js"]
