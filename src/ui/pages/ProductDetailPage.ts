import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductInfo } from "../types/ProductInfo";
import { parseTRY } from "../utils/ParsePrice";
import { ReviewSortOption } from "../types/ReviewSortOption";
import { OtherSellerInfo } from "../types/OtherSellerInfo";
import { AddToCartModalData } from "../types/AddToCartModal";

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

        console.log(`${DEBUG} getProductInfo → başlık: "${title}", fiyat: "${priceText}" → ${finalPrice}, href: "${href}"`);

        return { title, finalPrice, href };
    }

    async goToReviews() {
        console.log(`${DEBUG} goToReviews → Değerlendirmeler tabına geçiş deneniyor...`);

        try {
            await this.page.waitForTimeout(2000);

            await expect.poll(async () => {
                const isSelected = await this.reviewsTabBtn.getAttribute('aria-selected');

                await this.reviewsTabBtn.click({ force: true });
                try {
                    await this.reviewsPanel.waitFor({ state: 'visible', timeout: 2000 });
                    return true; 
                } catch (e) {
                    console.log(`${DEBUG} goToReviews → Panel henüz yüklenmedi, tekrar denenecek...`);
                    return false; 
                }
            }, {
                message: 'Değerlendirme tabı 10 saniye içinde aktifleşmedi.',
                intervals: [1000, 2000],
                timeout: 10000
            }).toBeTruthy();

            console.log(`${DEBUG} goToReviews → Başarıyla geçiş yapıldı.`);
            await this.allReviewCards.first().waitFor({ state: 'visible', timeout: 5000 });

        } catch (error) {
            console.error(`${DEBUG} goToReviews → KRİTİK HATA: Tab değiştirilemedi!`, error);
            throw new Error(`[ProductDetailPage] Değerlendirmeler tabına geçiş yapılamadı.`);
        }
    }

    async selectSortOption(option: ReviewSortOption) {
        console.log(`${DEBUG} selectSortOption → Başlatılıyor: "${option}"`);

        await expect.poll(async () => {
            const currentLabel = await this.sortReviewBTtnAfterSort.innerText();
            const isMenuVisible = await this.sortMenu.isVisible();

            if (!isMenuVisible && !currentLabel.includes(option)) {
                console.log(`${DEBUG} Menü açılıyor...`);
                await this.sortReviewsBtn.click({ force: true });
            }

            try {
                await this.sortMenu.waitFor({ state: 'visible', timeout: 2000 });

                await this.sortMenu.getByText(option, { exact: true }).click({ force: true });

                const updatedLabel = await this.sortReviewBTtnAfterSort.innerText();
                const menuHidden = await this.sortMenu.isHidden();

                return menuHidden && updatedLabel.includes(option);
            } catch (e) {
                console.log(`${DEBUG} Menü etkileşimi tamamlanamadı, tekrar deneniyor...`);
                return false;
            }
        }, {
            message: `Sıralama seçeneği "${option}" 15 saniye içinde uygulanamadı.`,
            intervals: [1000, 2000],
            timeout: 15000
        }).toBeTruthy();

        console.log(`${DEBUG} selectSortOption → "${option}" başarıyla seçildi.`);
    }

    async hasReviews(): Promise<boolean> {
        const count = await this.reviewCardsWithThumbs.count();
        console.log(`${DEBUG} hasReviews → thumbsUp içeren kart sayısı: ${count}`);
        return count > 0;
    }

    async clickReviewThumb(index: number, type: 'up' | 'down'): Promise<Locator> {

        const card = this.reviewCardsWithThumbs.nth(index);
        const selector = type === 'up' ? '.thumbsUp' : '.thumbsDown';
        const btn = card.locator(selector);

        await expect.poll(async () => {
            await btn.click({ force: true });
            return await card.getByText('Teşekkür Ederiz.').isVisible();
        }, {
            message: 'Oy verme işlemi başarısız oldu',
            intervals: [1000, 2000],
            timeout: 10000
        }).toBe(true);

        return card;
    }

    async getReviewThumbCount(): Promise<number> {
        return await this.reviewCardsWithThumbs.count();
    }

    async isOtherSellersSectionVisible() {
        const visible = await this.otherSellersSection.isVisible();
        console.log(`${DEBUG} isOtherSellersSectionVisible → ${visible}`);
        return visible;
    }

    async getOtherSellers(): Promise<OtherSellerInfo[] | null> {
        if (!await this.isOtherSellersSectionVisible()) return null;

        const items = await this.otherSellerItems.all();
        const sellers: OtherSellerInfo[] = [];

        for (const [i, sellerItem] of items.entries()) {
            const merchantName = await sellerItem.locator('[data-test-id="merchant-name"]').innerText();
            const priceText = await sellerItem.locator('[data-test-id="price-current-price"]').innerText();

            sellers.push({
                merchantName: merchantName.trim(),
                price: parseTRY(priceText),
                goToProductBtn: sellerItem.getByRole('button', { name: /Ürüne git/i })
            });
            console.log(`${DEBUG} getOtherSellers → [${i}] ${merchantName}: ${priceText}`);
        }
        return sellers;
    }

    async addToCart(): Promise<AddToCartModalData> {
        console.log(`${DEBUG} addToCart → İşlem başlatılıyor...`);
        await this.addToCartBtn.waitFor({ state: "visible" });

        await expect.poll(async () => {
            const isModalVisible = await this.addToCartModal.isVisible();

            if (!isModalVisible) {
                console.log(`${DEBUG} Modal kapalı, butona tıklanıyor...`);
                await this.addToCartBtn.click({ force: true });
            }

            try {
                await this.addToCartModal.waitFor({ state: 'visible', timeout: 3000 });
                return true;
            } catch (e) {
                console.log(`${DEBUG} Modal henüz gelmedi, poll tekrar deneyecek...`);
                return false;
            }
        }, {
            message: 'Sepete ekleme modalı 15 saniye içinde yüklenmedi',
            intervals: [2000],
            timeout: 15000
        }).toBeTruthy();

        return await this.getAddToCartModalData();
    }

    async getAddToCartModalData(): Promise<AddToCartModalData> {
        const isVisible = await this.addToCartModal.isVisible();

        if (!isVisible) {
            return { isModalVisible: false, successMessage: '', productTitle: '' };
        }

        const successMessage = (await this.successMessage.innerText()).trim();
        const productTitle = (await this.modalProductTitle.innerText()).trim();

        return { isModalVisible: true, successMessage, productTitle };
    }
}
