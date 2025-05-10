## Examples

## Schema registry, federated gateway, two services (hard-coded URLs)

Directories in use

- gateway_service_hard_coded_urls
- federated_service_a
- federated_service_b

![](https://app.lucidchart.com/publicSegments/view/d7d424de-e45a-4a0f-902d-e9030d06b07f/image.png)

- Start graphql-schema-registry. Wait until DB & UI work at http://localhost:6001/

```
nvm use
npm install
npm run build
docker-compose up
```

- Start gateway_service (not dockerized)

```
cd gateway_service_hard_coded_urls && npm install && node index.js
```

- (In separate terminals) Start federated services

```
cd federated_service_a && npm install && node index.js
cd federated_service_b && npm install && node index.js
```

- Check graphql-schema-registry UI. It should contain now schema from both services
  http://localhost:6001/

- Open gateway's playground UI in the browser and try to make request to both services
  http://localhost:6100
  <img width="681" alt="Screenshot 2020-09-01 at 23 46 09" src="https://user-images.githubusercontent.com/445122/91904286-5a7f2200-ecad-11ea-9d63-43a96f96e886.png">

## Schema registry, federated gateway, two services (dynamic URLs)

Same as above, except that gateway takes URLs from schema-registry

Directories:

- **gateway_service_managed_federation**
- federated_service_a
- federated_service_b

## Schema registry, with Apollo Router for federation

Mostly same setup as above but instead of using the example gateway we'll be using [Apollo Router](https://www.apollographql.com/docs/router).

- Start graphql-schema-registry with apollo-router. Wait until DB & UI work at http://localhost:6001/

```
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml -f docker-compose.apollo.yml up
```

- The Apollo Router will not be available until we register our first service, so (in separate terminals) start federated services

```
cd federated_service_a && npm install && node index.js
cd federated_service_b && npm install && node index.js
```

- Check Apollo Router playground UI in the browser at http://localhost:4000/
