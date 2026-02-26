import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductCard } from "../components/ProductCard";
import { ProductInfo } from "../types/ProductInfo";

export class SearchResultsPage extends BasePage {
    readonly resultsRegion: Locator;
    readonly productCardsRoot: Locator;

    constructor(page: Page) {
        super(page);

        this.resultsRegion = page.locator('[role="region"][aria-label="Ürünler"]');
        this.productCardsRoot = this.resultsRegion
            .locator('article')
            .filter({ has: page.locator('a[href*="-p-"]') });
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        await this.productCardsRoot.first().waitFor({ state: 'visible' });
    }

    async getProductCard(index: number): Promise<ProductCard> {
        return new ProductCard(this.page, this.productCardsRoot.nth(index), index);
    }

    async clickRandomProduct(): Promise<{ productInfo: ProductInfo, newPage: Page }> {
        const count = await this.productCardsRoot.count();
        const randomIndex = Math.floor(Math.random() * count);

        const card = new ProductCard(this.page, this.productCardsRoot.nth(randomIndex), randomIndex);
        const productInfo = await card.getInfo();
        const newPage = await card.click();

        return { productInfo, newPage };
    }

}