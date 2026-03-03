import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export class HttpClient {
  constructor(private readonly request: APIRequestContext) { }

  async get(path: string): Promise<any> {
    const response = await this.request.get(path);
    await this.assertOk(response, 'GET', path);
    return response;
  }

  async post(path: string, body: unknown): Promise<any> {
    const response = await this.request.post(path, { data: body });
    await this.assertOk(response, 'POST', path);
    return await response.json();
  }

  private async assertOk(response: APIResponse, method: string, path: string) {
    expect(response.ok(), `${method} ${path} failed: ${response.status()} ${response.statusText()}\n${await response.text()}`)
      .toBeTruthy();
  }
}