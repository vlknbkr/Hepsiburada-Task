import { APIRequestContext } from '@playwright/test';
import { HttpClient } from '../client';

export class SwaggerService {
    private readonly client: HttpClient;

    constructor(request: APIRequestContext) {
        this.client = new HttpClient(request);
    }

    async generateClient(url: string, body: { swaggerUrl: string }): Promise<any> {
        return this.client.post(url + 'gen/clients/javascript', body);
    }

    async downloadGeneratedClient(link: string): Promise<any> {
        return this.client.get(link);
    }
}
