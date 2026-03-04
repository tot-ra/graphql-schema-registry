FROM node:22-alpine

WORKDIR /app

# Install dependencies for build
COPY package.json package-lock.json ./
RUN npm install

EXPOSE 3000

CMD ["node", "app/schema-registry.js"]
