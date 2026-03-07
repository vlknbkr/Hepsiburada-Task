import { expect, Locator } from "@playwright/test";
import { AddToCartModalData } from "../types/AddToCartModal";
import { OtherSellerInfo } from "../types/OtherSellerInfo";
import { ReviewSortOption } from "../types/ReviewSortOption";
import { parseTRY } from "../utils/ParsePrice";
import { ProductDetailPage } from "../pages/ProductDetailPage";

const DEBUG = '[AddToChartFLow]';


export class AddToCartFlow {
    constructor(private productDetailsPage: ProductDetailPage) { }

    async getAddToCartModalData(): Promise<AddToCartModalData> {
        const isVisible = await this.productDetailsPage.isAddToCartModalVisible();

        if (!isVisible) {
            return { isModalVisible: false, successMessage: '', productTitle: '' };
        }

        const successMessage = await this.productDetailsPage.getSuccessMessageText();
        const productTitle = await this.productDetailsPage.getModalProductTitleText();

        return { isModalVisible: true, successMessage, productTitle };
    }

    async goToReviews() {
        console.log(`${DEBUG} goToReviews → Değerlendirmeler tabına geçiş deneniyor...`);

        try {
            await expect.poll(async () => {
                await this.productDetailsPage.clickReviewsTab();

                const isActive = await this.productDetailsPage.isReviewTabActive();
                if (isActive) {
                    return true;
                }

                console.log(`${DEBUG} goToReviews → Panel henüz yüklenmedi, tekrar denenecek...`);
                return false;
            }, {
                message: 'Değerlendirme tabı 10 saniye içinde aktifleşmedi.',
                intervals: [1000, 2000],
                timeout: 10000
            }).toBeTruthy();

            console.log(`${DEBUG} goToReviews → Başarıyla geçiş yapıldı.`);

        } catch (error) {
            throw new Error(`[ProductDetailPage] Değerlendirmeler tabına geçiş yapılamadı.`);
        }
    }

    async selectSortOption(option: ReviewSortOption) {
        console.log(`${DEBUG} selectSortOption → Başlatılıyor: "${option}"`);

        await expect.poll(async () => {
            const currentLabel = await this.productDetailsPage.getSortReviewBtnAfterSortText();
            const isMenuVisible = await this.productDetailsPage.isSortMenuVisible();

            if (!isMenuVisible && !currentLabel.includes(option)) {
                console.log(`${DEBUG} Menü açılıyor...`);
                await this.productDetailsPage.clickSortReviewsBtn();
            }

            try {
                await this.productDetailsPage.waitForSortMenuVisible();

                await this.productDetailsPage.clickSortOption(option);

                const updatedLabel = await this.productDetailsPage.getSortReviewBtnAfterSortText();
                const menuHidden = await this.productDetailsPage.isSortMenuHidden();

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

    async getOtherSellers(): Promise<OtherSellerInfo[] | null> {
        if (!await this.productDetailsPage.isOtherSellersSectionExist()) return null;

        const items = await this.productDetailsPage.getOtherSeller();
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

    async clickReviewThumb(index: number, type: 'up' | 'down'): Promise<Locator> {
        const card = this.productDetailsPage.getReviewCard(index);
        console.log("review card index " + card);

        const btn = type === 'up'
            ? this.productDetailsPage.thumpsUpBtn(index)
            : this.productDetailsPage.thumpsDownBtn(index);

        await btn.waitFor({ state: 'visible' });
        await btn.scrollIntoViewIfNeeded();

        await btn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
            console.log(`${DEBUG} clickReviewThumb → Element visible olmadı, yine de deneyeceğiz.`);
        });

        await expect.poll(async () => {
            try {
                await btn.click({ force: true, timeout: 2000 });
            } catch (e) {
                await btn.dispatchEvent('click');
            }

            return await card.getByText('Teşekkür Ederiz.').isVisible();
        }, {
            message: 'Oy verme işlemi başarısız oldu (Teşekkür mesajı görülmedi)',
            intervals: [1000, 2000],
            timeout: 10000
        }).toBe(true);

        return card;
    }

    async addToCart(): Promise<AddToCartModalData> {
        console.log(`${DEBUG} addToCart → İşlem başlatılıyor...`);
        await this.productDetailsPage.waitForAddToCartBtnVisible();

        await expect.poll(async () => {
            const isModalVisible = await this.productDetailsPage.isAddToCartModalVisible();

            if (!isModalVisible) {
                console.log(`${DEBUG} Modal kapalı, butona tıklanıyor...`);
                await this.productDetailsPage.clickAddToCartBtn();
            }

            try {
                await this.productDetailsPage.waitForAddToCartModal();
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
}