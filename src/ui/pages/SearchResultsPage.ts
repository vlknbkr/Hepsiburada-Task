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
        console.log(`\n🔍 [DEBUG] Total products found on page: ${count}`);

        // Log all product titles for visibility
        console.log('📋 [DEBUG] Product list:');
        for (let i = 0; i < count; i++) {
            const card = new ProductCard(this.page, this.productCardsRoot.nth(i), i);
            const info = await card.getInfo();
            console.log(`  [${i}] ${info.title} | ${info.finalPrice}`);
        }

        const randomIndex = Math.floor(Math.random() * count);
        console.log(`\n🎯 [DEBUG] Randomly selected index: ${randomIndex} / ${count - 1}`);

        const card = new ProductCard(this.page, this.productCardsRoot.nth(randomIndex), randomIndex);
        const productInfo = await card.getInfo();
        console.log(`✅ [DEBUG] Selected product: "${productInfo.title}" | Price: ${productInfo.finalPrice} | Href: ${productInfo.href}`);

        const newPage = await card.click();

        return { productInfo, newPage };
    }

}