import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";

const DEBUG = '[ProductDetailPage]';

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
    get reviewsPanel() { return this.productDetailsSection.locator("[role='tabpanel']#Reviews").first(); }
    get sortReviewsBtn() { return this.reviewsPanel.locator('[class*="hermes-Sort-module-Zwr_VRf_"]'); }
    get sortMenu() { return this.reviewsPanel.locator('[class*="hermes-Sort-module-AUMlb9J2ho"]'); }
    get allReviewCards() { return this.page.locator('[class*="hermes-ReviewCard-module-dY_oa"]'); }
    get sortReviewBtnAfterSort() { return this.page.locator('[class*="hermes-Sort-module-Zwr_VRf_"]'); }
    get reviewCardsWithThumbs() { return this.allReviewCards.filter({ has: this.page.locator('.thumbsUp') }); }
    get thumpsUpBtn() { return (index: number) => this.reviewCardsWithThumbs.nth(index).locator('.thumbsUp') }
    get thumpsDownBtn() { return (index: number) => this.reviewCardsWithThumbs.nth(index).locator('.thumbsDown') }


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
        console.log(`${DEBUG} waitForPageLoad → başlatılıyor, URL: ${this.page.url()}`);

        await this.page.waitForTimeout(1000);

        await super.waitForPageLoad();
        console.log(`${DEBUG} waitForPageLoad → super.waitForPageLoad tamamlandı`);

        await this.productInfoSection.waitFor({ state: 'visible', timeout: 15000 });
        console.log(`${DEBUG} waitForPageLoad → productInfoSection görünür`);

        await this.page.waitForLoadState('load');
        console.log(`${DEBUG} waitForPageLoad → loadState='load' tamamlandı`);

        await this.descriptionPanel.waitFor({ state: 'visible', timeout: 15000 });
        console.log(`${DEBUG} waitForPageLoad → descriptionPanel görünür`);

        await this.page.waitForTimeout(200);
        console.log(`${DEBUG} waitForPageLoad → tamamlandı`);
    }

    async getProductInfo(): Promise<ProductInfo> {
        const title = await this.productTitle.innerText();
        const priceText = await this.productPrice.innerText();
        const finalPrice = parseTRY(priceText);
        const href = new URL(this.page.url()).pathname;

        return { title, finalPrice, href };
    }

    async clickReviewsTab() {
        await this.reviewsTabBtn.click();
    }

    async isReviewTabActive() {
        return this.reviewsPanel.isVisible();
    }

    async clickAddToCartBtn() {
        await this.addToCartBtn.click();
    }

    async getReviewsWithThumbsCount(): Promise<number> {
        return await this.reviewCardsWithThumbs.count();
    }

    async clickThumpsUp(index: number) {
        await this.thumpsUpBtn(index).click();
    }

    async clickThumpsDown(index: number) {
        await this.thumpsDownBtn(index).click();
    }

    async isOtherSellersSectionExist() {
        return await this.otherSellersSection.isVisible();
    }

    async getOtherSeller(): Promise<Locator[]> {
        return await this.otherSellerItems.all();
    }

    async isAddToCartModalVisible(): Promise<boolean> {
        return await this.addToCartModal.isVisible();
    }

    async getSuccessMessageText(): Promise<string> {
        return (await this.successMessage.innerText()).trim();
    }

    async getModalProductTitleText(): Promise<string> {
        return (await this.modalProductTitle.innerText()).trim();
    }

    async getSortReviewBtnAfterSortText() {
        return await this.sortReviewBtnAfterSort.innerText();
    }

    async clickSortMenu() {
        await this.sortMenu.click();
    }

    async isSortMenuVisible() {
        return await this.sortMenu.isVisible();
    }

    async isSortMenuHidden() {
        return await this.sortMenu.isHidden();
    }

    async clickSortReviewsBtn() {
        await this.sortReviewsBtn.click({ force: true });
    }

    async clickSortOption(option: string) {
        await this.sortMenu.getByText(option, { exact: true }).click({ force: true });
    }

    async waitForSortMenuVisible() {
        await this.sortMenu.waitFor({ state: 'visible', timeout: 2000 });
    }

    getReviewCard(index: number): Locator {
        return this.reviewCardsWithThumbs.nth(index);
    }

    async waitForAddToCartModal() {
        await this.addToCartModal.waitFor({ state: 'visible', timeout: 3000 });
    }

    async waitForAddToCartBtnVisible() {
        await this.addToCartBtn.waitFor({ state: "visible" });
    }

}
