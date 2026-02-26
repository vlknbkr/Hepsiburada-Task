import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class HomePage extends BasePage {
    readonly searchInput;

    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator('[data-test-id="search-bar-input"]');
    }

    async open() {
        await this.page.goto('https://www.hepsiburada.com');
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        await this.searchInput.waitFor({ state: 'visible' });
    }

    async search(text: string) {
        await this.searchInput.fill(text);
        await this.searchInput.press('Enter');
    }

}
