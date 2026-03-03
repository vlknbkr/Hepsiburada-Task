import { test, expect } from '../../src/ui/fixtures/Fixtures';
import { ProductDetailPage } from '../../src/ui/pages/ProductDetailPage';

test.describe('Senaryo 2 - Diğer Satıcıları Bul', () => {

    test('Ürün ara ve en ucuz satıcıya git', async ({ homePage, searchResultsPage, page }) => {

        await test.step('Ana sayfa açılıyor', async () => {
            await homePage.open();
        });

        await test.step('Arama modalı açılıyor', async () => {
            await expect.poll(async () => {
                return await homePage.openSearchAndCheckState();
            }, {
                message: 'Arama modalı açılamadı!',
                timeout: 5000,
                intervals: [500]
            }).toBeTruthy();
        });

        await test.step('Ürün aranıyor: "iphone"', async () => {
            await homePage.typeSearchQuery('iphone');
            await expect(page, 'Arama sonrası URL "iphone" içermiyor').toHaveURL(/iphone/i);
        });

        const { productInfo, newPage } = await test.step('Rastgele ürün seçildi', async () => {
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
                    s.price < min.price ? s : min);

                if (cheapest.price < mainProduct.finalPrice) {
                    console.log(`Daha ucuz satıcı bulundu: ${cheapest.merchantName} — ${cheapest.price} TL`);
                    await cheapest.goToProductBtn.click();
                }
            }
        });

        await test.step('Ürün sepete ekleniyor', async () => {
            await productDetailsPage.addToCart();
        });

        await test.step('Sepete ekleme modalı doğrulanıyor', async () => {
            await expect.poll(async () => {
                const data = await productDetailsPage.getAddToCartModalData();
                return data.isModalVisible;
            }, {
                message: 'Sepete ekle modalı zamanında görünmedi',
                intervals: [500, 1000],
                timeout: 10000
            }).toBe(true);

            const modalData = await productDetailsPage.getAddToCartModalData();
            expect(modalData.successMessage, 'Sepete ekleme başarı mesajı bulunamadı').toContain('Ürün sepetinizde');
            expect(modalData.productTitle, 'Modal içindeki ürün başlığı boş olmamalı').not.toBe('');
        });
    });
});