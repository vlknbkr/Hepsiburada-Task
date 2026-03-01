import { Locator, Page, expect } from "@playwright/test";
import type { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";

export class ProductCard {

    private readonly productLink: Locator;
    private readonly titleLink: Locator;
    private readonly finalPrice: Locator;

    constructor(
        private readonly page: Page,
        public readonly root: Locator,
        public readonly index: number
    ) {
        this.productLink = this.root.locator('a[href*="-p-"]').first();
        this.titleLink = this.root.locator('h2 a').first();
        this.finalPrice = this.root.locator('[data-test-id^="final-price-"]').first();
    }


    async getInfo(): Promise<ProductInfo> {
        await expect(this.productLink).toBeVisible();
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