FROM node:25-alpine

WORKDIR /app

# Install dependencies for build
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.29.2
RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["node", "app/schema-registry.js"]
