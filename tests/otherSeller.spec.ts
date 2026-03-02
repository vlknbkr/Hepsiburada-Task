import { test, expect } from '../src/ui/fixtures/Fixtures';
import { ProductDetailPage } from '../src/ui/pages/ProductDetailPage';
import { ReviewSortOption } from '../src/ui/types/ReviewSortOption';

test.describe('Scenario 2 - Find Other Sellers', () => {

    test('Search for a product and navigate to the cheapest seller', async ({ homePage, searchResultsPage, page }) => {

        await homePage.open();
        await homePage.search('iphone');
        await searchResultsPage.waitForPageLoad();

        const { productInfo, newPage } = await searchResultsPage.clickRandomProduct();
        const productDetailsPage = new ProductDetailPage(newPage);

        await productDetailsPage.waitForPageLoad();

        const mainProduct = await productDetailsPage.getProductInfo();
        const otherSellers = await productDetailsPage.getOtherSellers() || [];

        if (otherSellers.length > 0) {
            const cheapest = otherSellers.reduce((min, s) =>
                s.price < min.price ? s : min);

            if (cheapest.price < mainProduct.finalPrice) {
                console.log(`Daha ucuz satici bulundu: ${cheapest.merchantName} — ${cheapest.price} TL`);
                await cheapest.goToProductBtn.click();
            }
        }

        await productDetailsPage.addToCart();

        await expect.poll(async () => {
            const data = await productDetailsPage.getAddToCartModalData();
            return data.isModalVisible;
        }, {
            message: 'Add to Cart modal did not appear in time',
            intervals: [500, 1000],
            timeout: 10000
        }).toBe(true);

        const modalData = await productDetailsPage.getAddToCartModalData();
        expect(modalData.successMessage).toContain('Ürün sepetinizde');
        expect(modalData.productTitle).not.toBe('');
    });
});