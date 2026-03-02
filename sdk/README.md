# rocketreport-sdk

Official JavaScript/TypeScript SDK for the [RocketReport](https://github.com/your-org/rocketreport) API.

Generate HTML, PDF, XLSX and TXT reports from any data source — directly from your code.

## Installation

```bash
npm install rocketreport-sdk
# or
yarn add rocketreport-sdk
```

## Quick start

```ts
import { RocketReport } from 'rocketreport-sdk';

const rr = new RocketReport({
  apiUrl: 'https://your-rocketreport-instance.com',
  token: 'your-bearer-token',
});

// List all builds
const builds = await rr.builds.list();

// Generate a report
const result = await rr.builds.generate(builds[0].id);
console.log(result.download_url);
```

## Authentication

```ts
const rr = new RocketReport({ apiUrl: 'https://...' });

// Login (sets token automatically)
const { token } = await rr.auth.login({ email: 'user@example.com', password: '...' });

// Or set token manually (e.g. loaded from localStorage)
rr.auth.setToken(token);
```

## API

### `rr.auth`

| Method | Description |
|--------|-------------|
| `login(payload)` | Login and set token |
| `register(payload)` | Create account and set token |
| `logout()` | Invalidate session |
| `setToken(token)` | Set token manually |

### `rr.templates`

| Method | Description |
|--------|-------------|
| `list()` | List all templates |
| `create(payload)` | Create a template |
| `update(id, payload)` | Update a template |
| `delete(id)` | Delete a template |

### `rr.apiSources`

| Method | Description |
|--------|-------------|
| `list()` | List all API sources |
| `create(payload)` | Add a new API source |
| `update(id, payload)` | Update an API source |
| `delete(id)` | Remove an API source |
| `test(id)` | Test connectivity |

### `rr.builds`

| Method | Description |
|--------|-------------|
| `list()` | List all builds |
| `create(payload)` | Create a build |
| `update(id, payload)` | Update a build |
| `delete(id)` | Delete a build |
| `previewData(params)` | Preview raw API data |
| `runCode(code, data, lang)` | Run transformation code |
| `generate(id, params?)` | Generate a report |

### `rr.generations`

| Method | Description |
|--------|-------------|
| `list(buildId)` | List generations for a build |
| `generate(buildId)` | Trigger a generation |
| `download(buildId, genId)` | Download result as Blob |

## Token auto-refresh

The SDK automatically refreshes the token on `401` responses and retries the request. You can react to token changes:

```ts
const rr = new RocketReport({
  apiUrl: '...',
  token: storedToken,
  onTokenRefresh: (newToken) => localStorage.setItem('token', newToken),
});
```

## License

MIT
