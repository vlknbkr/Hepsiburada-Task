import { Locator, Page } from "@playwright/test";
import type { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";

export class ProductCard {

    constructor(
        private readonly page: Page,
        public readonly root: Locator,
        public readonly index: number
    ) { }

    get productLink() { return this.root.locator('a[href*="-p-"]').first(); }
    get titleLink() { return this.root.locator('h2 a').first(); }
    get finalPrice() { return this.root.locator('[data-test-id^="final-price-"]').first(); }


    async getInfo(): Promise<ProductInfo> {
        await this.productLink.waitFor({ state: 'visible' });
        const title = (await this.titleLink.innerText()).trim();
        const href = await this.productLink.getAttribute("href");
        const finalPrice = (await this.finalPrice.innerText()).trim();

        return {
            title,
            href: href ?? "",
            finalPrice: parseTRY(finalPrice),
        };
    }

    async click(): Promise<Page> {
        const [newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.productLink.click(),
        ]);
        return newPage;
    }

}