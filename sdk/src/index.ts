import { createHttpClient } from './client';
import { createAuthModule } from './auth';
import { createTemplatesModule } from './templates';
import { createApiSourcesModule } from './apiSources';
import { createBuildsModule } from './builds';
import { createGenerationsModule } from './generations';
import type { RocketReportConfig } from './types';

export class RocketReport {
  public readonly auth: ReturnType<typeof createAuthModule>;
  public readonly templates: ReturnType<typeof createTemplatesModule>;
  public readonly apiSources: ReturnType<typeof createApiSourcesModule>;
  public readonly builds: ReturnType<typeof createBuildsModule>;
  public readonly generations: ReturnType<typeof createGenerationsModule>;

  constructor(private config: RocketReportConfig) {
    const http = createHttpClient(config);
    this.auth = createAuthModule(http, config);
    this.templates = createTemplatesModule(http);
    this.apiSources = createApiSourcesModule(http);
    this.builds = createBuildsModule(http);
    this.generations = createGenerationsModule(http);
  }
}

export * from './types';
