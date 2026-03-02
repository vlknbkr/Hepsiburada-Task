import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class HomePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    get searchBoxTrigger() { return this.page.locator('#searchBoxOld'); }
    get searchModalActiveContainer() { return this.page.locator('.searchBarContent-Wl6hIIE3QjA9Nou6rD6j'); }
    get searchInput() { return this.page.locator('.searchBarContent-Wl6hIIE3QjA9Nou6rD6j [data-test-id="search-bar-input"]'); }
    get fcConsent() { return this.page.locator('button.fc-cta-consent'); }
    get hbConsent() { return this.page.getByRole('button', { name: 'Kabul et' }); }

    async open() {
        await this.navigate('');
        await this.waitForPageLoad();
        await this.handleCookieConsent();
        await this.waitForPageLoad();
    }

    async waitForPageLoad() {
        await this.page.waitForTimeout(1000);

        await super.waitForPageLoad();
        await this.searchBoxTrigger.waitFor({ state: 'visible', timeout: 15000 });
        await this.page.waitForLoadState('load');
        await this.page.waitForTimeout(200);
    }

    async typeSearchQuery(query: string) {
        await this.searchInput.fill(query);
        await this.page.keyboard.press('Enter');
    }


    async clickSearchBoxToTrigger() {
        await this.searchBoxTrigger.click();
    }

    async openSearchAndCheckState() {
        await this.searchBoxTrigger.click();
        await this.searchModalActiveContainer.waitFor({ state: 'visible' });

        return await this.searchModalActiveContainer.isVisible();
    }

    async handleCookieConsent() {
        await Promise.allSettled([
            this.acceptCookieConsent(this.hbConsent),
            this.acceptCookieConsent(this.fcConsent)
        ]);
    }
}
