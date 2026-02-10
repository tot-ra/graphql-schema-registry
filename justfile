start:
	mkdir -p tmp
	rm -rf ./app
	bash -c "source $HOME/.nvm/nvm.sh && nvm install 22 && nvm use && npm i && npm run build"
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.gratheon.yml up --build

stop:
	COMPOSE_PROJECT_NAME=gratheon docker compose -f docker-compose.gratheon.yml down

run:
	ENV_ID=dev npm run dev

# Run all tests (unit + integration)
test:
	npm test

# Run only unit tests
test-unit:
	npm run test:unit

# Run integration tests (API, e2e, cross-channel - no credentials required)
test-integration:
	npm run test:integration

# Run manual channel tests (email, SMS, Telegram - requires credentials)
test-manual:
	npm run test:manual

# Run tests in Docker
test-docker:
	npm run test:docker
