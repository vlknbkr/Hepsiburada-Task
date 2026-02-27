import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class HomePage extends BasePage {
    readonly searchBox: Locator;
    readonly searchInput: Locator;
    readonly fcConsent;
    readonly hbConsent;

    constructor(page: Page) {
        super(page);
        this.searchBox = page.locator('.initialComponent-hk7c_9tvgJ8ELzRuGJwC');
        this.searchInput = page.getByRole('searchbox', { name: 'Site içinde ara' })
        this.fcConsent = page.locator('button.fc-cta-consent');
        this.hbConsent = page.getByRole('button', { name: 'Kabul et' });
    }

    async open() {
        await this.page.goto('https://www.hepsiburada.com');
        await this.waitForPageLoad();
        await this.handleCookieConsent()
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        await this.searchBox.waitFor({ state: 'visible' });
    }

    async search(searchText: string) {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            await this.searchBox.click();
            await this.page.waitForTimeout(1000);
            try {
                await this.searchInput.waitFor({ state: 'visible', timeout: 3000 });
                break; 
            } catch {
                console.log(`[DEBUG] searchInput not visible after click (attempt ${attempt}/${maxRetries})`);
                if (attempt === maxRetries) {
                    throw new Error('Search input did not become visible after ' + maxRetries + ' attempts');
                }
            }
        }

        await this.searchInput.fill(searchText);
        await this.searchInput.press('Enter');
    }

    private async handleCookieConsent() {
        await Promise.allSettled([
            this.acceptCookieConsent(this.hbConsent),
            this.acceptCookieConsent(this.fcConsent)
        ]);

    }
}
