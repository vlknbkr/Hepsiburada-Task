import { test as base } from '@playwright/test';
import { SwaggerService } from '../services/swagger.service';


type ApiFixtures = {
    swaggerService: SwaggerService;
};

export const test = base.extend<ApiFixtures>({

    swaggerService: async ({ request }, use) => {
        await use(new SwaggerService(request));
    },
});

export { expect } from '@playwright/test';