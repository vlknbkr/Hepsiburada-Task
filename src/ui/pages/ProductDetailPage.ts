import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";
import { ReviewSortOption } from "../types/ReviewSortOption";

export class ProductDetailPage extends BasePage {
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly productDetailsTab: Locator;
    readonly detailsTabReviews: Locator;
    readonly sortDropdownTrigger: Locator;
    readonly allReviewCards: Locator;
    readonly reviewCardsWithThumbs: Locator;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.locator('[data-test-id="title"]');
        this.productPrice = page.locator('[data-test-id="default-price"] > div:first-child span');
        this.productDetailsTab = page.getByRole('tablist');
        this.detailsTabReviews = this.productDetailsTab.getByRole('tab', { name: /Değerlendirmeler/i });
        this.sortDropdownTrigger = page
            .getByText('Sırala', { exact: true })
            .locator('xpath=following-sibling::div')
            .first();
        this.allReviewCards = page.locator('.paginationContentHolder > div');
        this.reviewCardsWithThumbs = this.allReviewCards.filter({
            has: page.locator('.thumbsUp')
        });
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        // ürün sayfasının yüklenmesini bekle
    }

    async getProductInfo(): Promise<ProductInfo> {
        return {
            title: await this.productTitle.innerText(),
            finalPrice: parseTRY(await this.productPrice.innerText()),
            href: new URL(this.page.url()).pathname
        };
    }

    async goToReviews() {
        await this.detailsTabReviews.click();
    }

    async selectSortOption(option: ReviewSortOption) {
        await this.sortDropdownTrigger.click();
        await this.page.getByText(option, { exact: true }).click();
    }

    async hasReviews(): Promise<boolean> {
        return await this.reviewCardsWithThumbs.count() > 0;
    }

    async clickRandomThumb(): Promise<Locator> {
        const count = await this.reviewCardsWithThumbs.count();
        const randomIndex = Math.floor(Math.random() * count);
        const card = this.reviewCardsWithThumbs.nth(randomIndex);

        const isUp = Math.random() > 0.5;
        if (isUp) {
            await card.locator('.thumbsUp').click();
            console.log(`👍 ThumbsUp clicked on review #${randomIndex}`);
        } else {
            await card.locator('.thumbsDown').click();
            console.log(`👎 ThumbsDown clicked on review #${randomIndex}`);
        }

        return card;
    }
}

/**
 * sayfanın yüklenmesini doğrula
 * ürün detaylarını al ve seçilen ürün ile karşılaştır
 * Değerlendirme tabına git
 * Sıralama dropdown'ını aç
 * En yeni değerlendirme seç
 * gelen değerlendirmeleri al
 * içlerinden birinin thumpsUp/thumpsDown butonuna tıkla 
 * teşekkür ederiz mesajını doğrula
 * Eğer ürünün hiç bir değerlendirmesi yoksa bekle
 */