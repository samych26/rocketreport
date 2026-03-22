# RocketReport SDK

The official JavaScript & TypeScript SDK for the RocketReport API. It provides a simple and strongly-typed way to interact with your RocketReport backend from any Node.js or browser environment.

## Installation

You can install the package using `npm`, `yarn`, or `pnpm`:

```bash
npm install rocketreport
# or
yarn add rocketreport
# or
pnpm add rocketreport
```

## Getting Started

To use the SDK, you must first initialize the `RocketReport` client with your API Key. Be sure to keep your API key secure.

```typescript
import { RocketReport } from 'rocketreport';

// Initialize the client
// Provide the base URL of your API if it differs from the default (http://localhost:8000)
const client = new RocketReport('YOUR_API_KEY_HERE', 'https://api.rocketreport.me');
```

## Available Methods

### 1. Connecting an API Source
Connect an external API data source to RocketReport.

```typescript
const source = await client.createApiSource({
  name: 'My Custom API',
  url_base: 'https://api.example.com/data',
  auth_type: 'bearer',
  auth_token: 'YOUR_EXTERNAL_TOKEN'
});
```

### 2. Creating a Build (Document)
A Build is a document definition linked to a data source.

```typescript
const build = await client.createBuild({
  name: 'Monthly Invoice Report',
  api_source_id: source.id,
  endpoint: '/invoices/123',
  code: 'INV-123',
  method: 'GET'
});
```

### 3. Adding a Template
Attach an HTML/Handlebars template to your Build.

```typescript
const template = await client.createTemplate(build.id, {
  content: '<h1>Invoice</h1><p>Date: {{date}}</p>',
  output_format: 'pdf',
  description: 'Main invoice layout'
});
```

### 4. Generating a Report
Triggers the generation of the document using the API source data and the template. You can pass dynamic parameters.

```typescript
const reportUrl = await client.generate(build.id, {
  month: 'March',
  year: 2026
});

console.log('Report generated at:', reportUrl);
```

### 5. Fetching Builds
Retrieve a list of all builds or a specific one.

```typescript
// List all your builds
const allBuilds = await client.listBuilds();

// Get details for a specific build
const singleBuild = await client.getBuild(1);
```

## Error Handling

The SDK provides a custom `RocketReportError` class for easy error catching.

```typescript
import { RocketReport, RocketReportError } from 'rocketreport';

try {
  await client.getBuild(999);
} catch (error) {
  if (error instanceof RocketReportError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Types and Interfaces

The SDK is written in TypeScript and exports several helpful interfaces for typing your data:
- `ApiSourceData`
- `BuildData`
- `TemplateData`

## License

MIT
