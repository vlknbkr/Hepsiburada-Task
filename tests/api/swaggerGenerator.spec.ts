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

        await test.step('GET: Oluşturulan client indirildi', async () => {
            const downloadLink = postResponseBody.link;
            const getResponse = await swaggerService.downloadGeneratedClient(downloadLink);
            expect(getResponse).toBeDefined();
            console.log(getResponse)
        });
    });
});
