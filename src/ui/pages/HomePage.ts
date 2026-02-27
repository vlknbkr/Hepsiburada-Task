import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class HomePage extends BasePage {
    readonly searchBox;
    readonly overlaySearchInput;
    readonly fcConsent;
    readonly hbConsent;

    constructor(page: Page) {
        super(page);
        this.searchBox = page.getByRole('searchbox', { name: 'site içinde ara' });
        this.overlaySearchInput = page.locator('input.searchBarContent-UfviL0lUukyp5yKZTi4k');
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
        await this.searchBox.click({ force: true });
        await this.searchBox.fill(searchText);
        await this.searchBox.press('Enter');
    }

    private async handleCookieConsent() {
        await Promise.allSettled([
            this.acceptCookieConsent(this.hbConsent),
            this.acceptCookieConsent(this.fcConsent)
        ]);

    }
}
