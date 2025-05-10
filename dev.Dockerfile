FROM node:22-alpine

USER nobody

# ensure all directories exist
WORKDIR /app

EXPOSE 3000

CMD ["node", "app/schema-registry.js"]
