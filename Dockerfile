FROM node:14-alpine

# setup env for consul to be able to track state of service
ENV SERVICE_DESC="Schema registry" \
	SERVICE_5850_IGNORE=true

USER nobody

# ensure all directories exist
WORKDIR /app

EXPOSE 3000

CMD ["node", "schema-registry.js"]