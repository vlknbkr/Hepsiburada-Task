import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";
import { ReviewSortOption } from "../types/ReviewSortOption";
import { OtherSellerInfo } from "../types/OtherSellerInfo";

/**
 * section=> aria-label= 'Apple iPhone 17 256 GB Beyaz Ürün Bilgileri'
 *  
 * section=> data-test-id='tab'
 *           => role=tablist
 *                 => role=tab, aria-controls='Description'
 *                 => role=tab, aria-controls='Reviews'
 *                  => role=tabpanel, id=Description
 *                  => role=tabpanel, id=Reviews
 */


export class ProductDetailPage extends BasePage {

    // 1. Product Info Section (Ürün Bilgisi- isim, fiyat vb)
    readonly productInfoSection: Locator;
    readonly productTitle: Locator;
    readonly productPrice: Locator;
    readonly addToCartBtn: Locator;

    // 2. Product Details Section (Ürün Detayları- Ürün açıklaması, değerlendirme vb)
    readonly productDetailsSection: Locator;
    readonly tabList: Locator;

    // 2.1 individual tabs of tablist
    readonly descriptionTabBtn: Locator;
    readonly reviewsTabBtn: Locator;
    readonly sortReviewsBtn: Locator;
    readonly sortMenu: Locator;

    // 2.2 panels of the main container
    readonly descriptionPanel: Locator;
    readonly reviewsPanel: Locator;


    readonly allReviewCards: Locator;
    readonly reviewCardsWithThumbs: Locator;
    readonly otherSellersSection: Locator;
    readonly otherSellersList: Locator;
    readonly otherSellerItems: Locator;

    readonly addToCartModal: Locator;
    readonly modalHeader: Locator;
    readonly successMessage: Locator;
    readonly modalProductTitle: Locator;

    constructor(page: Page) {
        super(page);
        // 1. Product Info Section
        this.productInfoSection = page.locator('.X7UOpIDPCas7K8jG8_5Y');
        this.productTitle = this.productInfoSection.locator('[data-test-id="title"]');
        this.productPrice = this.productInfoSection.locator('[data-test-id="price"]');
        this.addToCartBtn = this.page.locator('[data-test-id="addToCart"]')

        // 2. Product Details Section
        this.productDetailsSection = page.locator("section[data-test-id='tab']");
        this.tabList = this.productDetailsSection.locator("[role='tablist']");

        this.descriptionTabBtn = this.tabList.locator("[role='tab'][aria-controls='Description']");
        this.reviewsTabBtn = this.tabList.locator("[role='tab'][aria-controls='Reviews']");
        this.descriptionPanel = this.productDetailsSection.locator("[role='tabpanel']#Description");

        this.reviewsPanel = this.productDetailsSection.locator("[role='tabpanel']#Reviews");
        this.sortReviewsBtn = this.reviewsPanel.locator('[class*="hermes-Sort-module-Zwr_VRf_"]');
        this.sortMenu = this.reviewsPanel.locator('[class*="hermes-Sort-module-AUMlb9J2ho"]');


        this.allReviewCards = page.locator('[class*="hermes-ReviewCard-module-dY_oa"]');
        this.reviewCardsWithThumbs = this.allReviewCards.filter({
            has: page.locator('.thumbsUp')
        });

        this.otherSellersSection = page.locator('[data-test-id="other-merchants"]').first();
        this.otherSellersList = this.otherSellersSection.locator('[data-test-id="other-merchants"]');
        this.otherSellerItems = page.locator('[data-test-id="other-merchants"] [data-test-id="other-merchants"] > div');

        this.addToCartModal = page.locator("[class*='checkoutui-Modal-IAYMPfH']");
        this.modalHeader = this.addToCartModal.locator("[class*='checkoutui-ProductOnBasketHeader']");
        this.successMessage = this.modalHeader.locator("span:has-text('Ürün sepetinizde')");
        this.modalProductTitle = this.modalHeader.locator("h6");
    }

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
        return await this.otherSellersSection.isVisible()
    }

    async getOtherSellers(): Promise<OtherSellerInfo[] | null> {
        const isVisible = await this.isOtherSellersSectionVisible();
        if (!isVisible) {
            console.log('Diğer Satıcılar" section is not visible.');
            return null;
        }

        const sellerCount = await this.otherSellerItems.count();
        console.log(`🏪 [DEBUG] Found ${sellerCount} other seller(s)`);

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
            console.log(`  [${i}] ${merchantName}: ${price} TL`);
        }

        return sellers;
    }

    async addToCart() {
        await this.addToCartBtn.click()
    }

    async getAddToCartModalData() {
        // We check visibility at the moment this is called
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
