import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";
import { ReviewSortOption } from "../types/ReviewSortOption";
import { OtherSellerInfo } from "../types/OtherSellerInfo";

export class ProductDetailPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // ── Ürün Bilgisi
    get productInfoSection() { return this.page.locator('.X7UOpIDPCas7K8jG8_5Y'); }
    get productTitle() { return this.productInfoSection.locator('[data-test-id="title"]'); }
    get productPrice() { return this.productInfoSection.locator('[data-test-id="price"]'); }
    get addToCartBtn() { return this.page.locator('[data-test-id="addToCart"]'); }

    // ── Ürün Detayı
    get productDetailsSection() { return this.page.locator("section[data-test-id='tab']"); }
    get tabList() { return this.productDetailsSection.locator("[role='tablist']"); }
    get descriptionPanel() { return this.productDetailsSection.locator("[role='tabpanel']#Description"); }

    // ── Tab butonları
    get descriptionTabBtn() { return this.tabList.locator("[role='tab'][aria-controls='Description']"); }
    get reviewsTabBtn() { return this.tabList.locator("[role='tab'][aria-controls='Reviews']"); }

    // ── Değerlendirme Tabı 
    get reviewsPanel() { return this.productDetailsSection.locator("[role='tabpanel']#Reviews"); }
    get sortReviewsBtn() { return this.reviewsPanel.locator('[class*="hermes-Sort-module-Zwr_VRf_"]'); }
    get sortMenu() { return this.reviewsPanel.locator('[class*="hermes-Sort-module-AUMlb9J2ho"]'); }
    get allReviewCards() { return this.page.locator('[class*="hermes-ReviewCard-module-dY_oa"]'); }
    get reviewCardsWithThumbs() { return this.allReviewCards.filter({ has: this.page.locator('.thumbsUp') }); }
    get sortReviewBTtnAfterSort() { return this.page.locator('[class*="hermes-Sort-module-Zwr_VRf_"]'); }
    
    // ── Diğer Satıcılar
    get otherSellersSection() { return this.page.locator('[data-test-id="other-merchants"]').first(); }
    get otherSellersList() { return this.otherSellersSection.locator('[data-test-id="other-merchants"]'); }
    get otherSellerItems() { return this.page.locator('[data-test-id="other-merchants"] [data-test-id="other-merchants"] > div'); }

    // ── Sepete Ekle Modal
    get addToCartModal() { return this.page.locator("[class*='checkoutui-Modal-IAYMPfH']"); }
    get modalHeader() { return this.addToCartModal.locator("[class*='checkoutui-ProductOnBasketHeader']"); }
    get successMessage() { return this.modalHeader.locator("span:has-text('Ürün sepetinizde')"); }
    get modalProductTitle() { return this.modalHeader.locator("h6"); }

    async waitForPageLoad() {
        await this.page.waitForTimeout(1000);

        await super.waitForPageLoad();

        await this.productInfoSection.waitFor({ state: 'visible', timeout: 15000 });

        await this.page.waitForLoadState('load');

        await this.descriptionPanel.waitFor({ state: 'visible', timeout: 15000 });

        await this.page.waitForTimeout(200);
    }

    async getProductInfo(): Promise<ProductInfo> {
        return {
            title: await this.productTitle.innerText(),
            finalPrice: parseTRY(await this.productPrice.innerText()),
            href: new URL(this.page.url()).pathname
        };
    }

    async goToReviews() {
        const isSelected = await this.reviewsTabBtn.getAttribute('aria-selected');
        if (isSelected === 'true') return;

        await this.reviewsTabBtn.click();

        await this.reviewsPanel.waitFor({ state: 'visible' });
    }

    async selectSortOption(option: ReviewSortOption) {
        await this.goToReviews();

        await this.sortReviewsBtn.click();

        await this.sortMenu.waitFor({ state: 'visible' });
        await this.sortMenu.getByText(option, { exact: true }).click();
        await this.sortMenu.waitFor({ state: 'hidden' });
    }

    async hasReviews(): Promise<boolean> {
        return await this.reviewCardsWithThumbs.count() > 0;
    }

    async clickRandomThumb(): Promise<Locator> {
        const count = await this.reviewCardsWithThumbs.count();
        if (count === 0) throw new Error('Yorum bulunan degerlendirma bulunamadi!');

        const randomIndex = Math.floor(Math.random() * count);
        const card = this.reviewCardsWithThumbs.nth(randomIndex);

        const isUp = Math.random() > 0.5;
        if (isUp) {
            await card.locator('.thumbsUp').click();
        } else {
            await card.locator('.thumbsDown').click();
        }
        return card;
    }

    async isOtherSellersSectionVisible() {
        return await this.otherSellersSection.isVisible();
    }

    async getOtherSellers(): Promise<OtherSellerInfo[] | null> {
        const isVisible = await this.isOtherSellersSectionVisible();
        if (!isVisible) {
            console.log('Diğer Satıcılar" section is not visible.');
            return null;
        }

        const sellerCount = await this.otherSellerItems.count();

        const sellers: OtherSellerInfo[] = [];

        for (let i = 0; i < sellerCount; i++) {
            const sellerItem = this.otherSellerItems.nth(i);

            const merchantName = await sellerItem.locator('[data-test-id="merchant-name"]').innerText();
            const priceText = await sellerItem.locator('[data-test-id="price-current-price"]').innerText();
            const price = parseTRY(priceText);
            const productBtn = sellerItem.getByRole('button', { name: /Ürüne git/i });

            sellers.push({
                merchantName: merchantName,
                price: price,
                goToProductBtn: productBtn
            });
        }

        return sellers;
    }

    async addToCart() {
        await this.addToCartBtn.click()
    }

    async getAddToCartModalData() {
        const isVisible = await this.addToCartModal.isVisible();

        if (!isVisible) {
            return { isModalVisible: false, successMessage: '', productTitle: '' };
        }

        return {
            isModalVisible: true,
            successMessage: (await this.successMessage.innerText()).trim(),
            productTitle: (await this.modalProductTitle.innerText()).trim()
        };
    }
}
