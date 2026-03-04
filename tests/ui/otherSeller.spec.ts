import { test, expect } from '../../src/ui/fixtures/Fixtures';
import { ProductDetailPage } from '../../src/ui/pages/ProductDetailPage';

test.describe('Senaryo 2 - Diğer Satıcıları Bul', () => {
    const searchTerm = 'iphone';

    test('Ürün ara ve en ucuz satıcıya git', async ({ homePage, searchResultsPage, page }) => {

        await test.step('Ana sayfa açılıyor', async () => {
            await homePage.open();
        });

        await test.step('Arama modalı açılıyor', async () => {
            await homePage.openSearchModal();
        });

        await test.step(`Ürün aranıyor: "${searchTerm}"`, async () => {
            await homePage.typeSearchQuery(searchTerm);
            await expect(page).toHaveURL(searchTerm);
        });

        const { productInfo, newPage } = await test.step('Rastgele ürün seçildi', async () => {
            await searchResultsPage.waitForPageLoad();
            return await searchResultsPage.clickRandomProduct();
        });

        const productDetailsPage = new ProductDetailPage(newPage);

        await test.step('Ürün detay sayfası yüklendi', async () => {
            await productDetailsPage.waitForPageLoad();
        });

        await test.step('Ürün bilgisi ve diğer satıcılar alınıyor', async () => {
            const mainProduct = await productDetailsPage.getProductInfo();
            const otherSellers = await productDetailsPage.getOtherSellers() || [];

            if (otherSellers.length > 0) {
                const cheapest = otherSellers.reduce((min, s) =>
                    (s.price ?? Infinity) < (min.price ?? Infinity) ? s : min);

                if (cheapest.price !== null && mainProduct.finalPrice !== null && cheapest.price < mainProduct.finalPrice) {
                    console.log(`Daha ucuz satıcı bulundu: ${cheapest.merchantName} — ${cheapest.price} TL`);
                    await cheapest.goToProductBtn.click();
                }
            }
        });

        await test.step('Ürünü sepete ekle ve modalı doğrula', async () => {
            const modalData = await productDetailsPage.addToCart();

            expect(modalData.successMessage).toContain('Ürün sepetinizde');
            expect(modalData.productTitle).not.toBe('');
        });
    });
});