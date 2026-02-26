import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductDetailPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        // ürün sayfasının yüklenmesini bekle
    }

}