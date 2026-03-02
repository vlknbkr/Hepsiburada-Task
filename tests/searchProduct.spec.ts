import { test, expect } from '../src/ui/fixtures/Fixtures';
import { ProductDetailPage } from '../src/ui/pages/ProductDetailPage';
import { ReviewSortOption } from '../src/ui/types/ReviewSortOption';

test.describe('Senaryo 1 - Ürün Arama ve Değerlendirme', () => {

    test('Ürün ara, rastgele bir ürün seç, doğrula ve değerlendirmelerle etkileşime gir', async ({ homePage, searchResultsPage, page }) => {

        await test.step('Ana sayfa açılıyor', async () => {
            await homePage.open();
        });

        await test.step('Arama modalı açılıyor', async () => {
            await expect.poll(async () => {
                return await homePage.openSearchAndCheckState();
            }, {
                message: 'Arama modal açılamadı!!!',
                timeout: 5000,
                intervals: [500]
            }).toBeTruthy();
        });

        await test.step('Ürün aranıyor: "iphone"', async () => {
            await homePage.typeSearchQuery('iphone');
            await expect(page, 'Arama sonrası URL "iphone" içermiyor').toHaveURL(/iphone/i);
        });

        await test.step('Arama sonuçları yüklendi', async () => {
            await searchResultsPage.waitForPageLoad();
        });

        const { productInfo, newPage } = await test.step('Rastgele ürün seçildi', async () => {
            return await searchResultsPage.clickRandomProduct();
        });

        const productDetailsPage = new ProductDetailPage(newPage);

        await test.step('Ürün detay sayfası yüklendi', async () => {
            await productDetailsPage.waitForPageLoad();
            await expect(productDetailsPage.productTitle, 'Ürün başlığı görünür değil').toBeVisible();
        });

        await test.step('Ürün bilgileri doğrulanıyor', async () => {
            const actualInfo = await productDetailsPage.getProductInfo();
            expect(actualInfo, 'Ürün detay sayfasındaki bilgiler, arama sonuçlarındaki bilgilerle eşleşmiyor').toEqual(productInfo);
        });

        await test.step('Değerlendirmeler sekmesine geçiliyor', async () => {
            await productDetailsPage.goToReviews();
        });

        await test.step('Değerlendirmeler sekmesinin açıldığı doğrulanıyor', async () => {
            await expect(productDetailsPage.reviewsPanel, 'Değerlendirmeler sekmesi açılamadı').toBeVisible();
            await expect(productDetailsPage.reviewsTabBtn, 'Değerlendirmeler sekmesi aktif (seçili) duruma geçmedi').toHaveAttribute('aria-selected', 'true');
        });

        await test.step('Değerlendirmeler "En Yeni" ye göre sıralanıyor', async () => {
            await productDetailsPage.selectSortOption(ReviewSortOption.Newest);
        });

        await test.step('Sıralamanın "En Yeni" olarak güncellendiği doğrulanıyor', async () => {
            await expect(productDetailsPage.sortReviewBTtnAfterSort, 'Sıralama seçeneği "En yeni değerlendirme" olarak güncellenemedi').toHaveText(ReviewSortOption.Newest);
        });

        await test.step('Değerlendirmeye oy veriliyor', async () => {
            if (await productDetailsPage.hasReviews()) {
                const card = await productDetailsPage.clickRandomThumb();
                await expect(card.getByText('Teşekkür Ederiz.'), 'Oy verme sonrası teşekkür mesajı görünmedi').toBeVisible();
            } else {
                console.log('Bu ürünün değerlendirmesi yok');
            }
        });
    });
});