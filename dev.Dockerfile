FROM node:14-alpine

USER nobody

# ensure all directories exist
WORKDIR /app

EXPOSE 3000

CMD ["node", "schema-registry.js"]
