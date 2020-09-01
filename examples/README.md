## Example

## Usage

- Start graphql-schema-registry. Wait until DB & UI work
- Start gateway_service (not dockerized)

```
cd gateway_service && npm install && node index.js
```

- (In separate terminals) Start federated services:

```
cd federated_service_a && npm install && node index.js
```

![](https://app.lucidchart.com/publicSegments/view/d7d424de-e45a-4a0f-902d-e9030d06b07f/image.png)
