import { Locator, Page } from "@playwright/test";

export class BasePage {
    constructor(protected page: Page) { }


    async navigate(path: string) {
        await this.page.goto(path);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
    }

    async acceptCookieConsent(locator: Locator) {
        try {
            await locator.waitFor({ state: 'visible', timeout: 7000 });
            await locator.click();
        } catch {
            console.log('Cookie consent bulunamadı');
        }
    }
}