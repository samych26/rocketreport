import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { RocketReport, RocketReportError } from './index';

const server = setupServer(
  http.get('http://localhost:8000/api/builds', () => {
    return HttpResponse.json([{ id: 1, name: 'Test Build' }]);
  }),
  http.post('http://localhost:8000/api/builds', async ({ request }) => {
    const body = await request.json() as any;
    if (!body.name) {
      return new HttpResponse(JSON.stringify({ message: 'Name is required' }), { status: 400 });
    }
    return HttpResponse.json({ id: 2, ...body });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RocketReport SDK', () => {
  const sdk = new RocketReport('test-api-key');

  it('should list builds', async () => {
    const builds = await sdk.listBuilds();
    expect(builds).toHaveLength(1);
    expect(builds[0].name).toBe('Test Build');
  });

  it('should create a build', async () => {
    const build = await sdk.createBuild({
      name: 'New Build',
      api_source_id: 1,
      endpoint: '/data',
      code: 'NB-01'
    });
    expect(build.id).toBe(2);
    expect(build.name).toBe('New Build');
  });

  it('should throw RocketReportError on API error', async () => {
    try {
      await sdk.createBuild({ name: '' } as any);
    } catch (error) {
      expect(error).toBeInstanceOf(RocketReportError);
      if (error instanceof RocketReportError) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Name is required');
      }
    }
  });
});
