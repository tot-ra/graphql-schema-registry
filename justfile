start:
	mkdir -p tmp
	rm -rf ./app
	bash -c "source $HOME/.nvm/nvm.sh && nvm install 25 && nvm use && npm install -g pnpm@10.29.2 && pnpm install && pnpm run build"
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.gratheon.yml rm -sf gql-schema-registry gql-schema-registry-db || true
	COMPOSE_PROJECT_NAME=graphql-schema-registry docker compose -f docker-compose.base.yml -f docker-compose.dev.yml rm -sf gql-schema-registry gql-schema-registry-worker gql-schema-registry-db gql-schema-registry-redis gql-schema-registry-kafka gql-schema-registry-zookeeper || true
	COMPOSE_PROJECT_NAME=graphql-schema-registry docker compose -f docker-compose.gratheon.yml rm -sf gql-schema-registry gql-schema-registry-db || true
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.gratheon.yml up --build

stop:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.gratheon.yml down

run:
	ENV_ID=dev pnpm run dev

# Run all tests (unit + integration)
test:
	pnpm test

# Run only unit tests
test-unit:
	pnpm run test:unit

# Run integration tests (API, e2e, cross-channel - no credentials required)
test-integration:
	pnpm run test:integration

# Run manual channel tests (email, SMS, Telegram - requires credentials)
test-manual:
	pnpm run test:manual

# Run tests in Docker
test-docker:
	pnpm run test:docker
