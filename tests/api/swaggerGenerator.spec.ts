import { expect } from '@playwright/test';
import { test } from '../../src/api/fixtures/fixtures';

test.describe('Swagger Generator API Tests', () => {
    test('client generation', async ({ swaggerService }) => {
        const url = process.env.BASE_URL_API!;
        let postResponseBody: any;

        await test.step('POST: Swagger client generation isteği gönderildi', async () => {
            postResponseBody = await swaggerService.generateClient(url, {
                swaggerUrl: 'https://petstore.swagger.io/v2/swagger.json'
            });
            console.log(postResponseBody)
            expect(postResponseBody.link).toBeDefined();
        });

        await test.step('GET: Oluşturulan client indirildi ve doğrulandı', async () => {
            const downloadLink = postResponseBody.link;
            const response = await swaggerService.downloadGeneratedClient(downloadLink);

            expect(response.status(), 'Download endpoint 200 dönmeli').toBe(200);

            const contentType = response.headers()['content-type'];
            expect(contentType, 'Content-Type zip veya octet-stream olmalı').toMatch(
                /application\/(zip|octet-stream)/
            );

            const body = await response.body();
            expect(body.byteLength, 'İndirilen dosya boş olmamalı').toBeGreaterThan(0);
        });
    });
});
