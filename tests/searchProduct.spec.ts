import { test, expect } from '../src/ui/fixtures/uiFixtures';
import { ProductDetailPage } from '../src/ui/pages/ProductDetailPage';
import { ReviewSortOption } from '../src/ui/types/ReviewSortOption';

test.describe('Scenario 1 - Product Search and Review', () => {

    test('Search for a product, select random product, verify and interact with reviews', async ({ homePage, searchResultsPage }) => {

        await homePage.open();
        await homePage.search('iphone');

        await searchResultsPage.waitForPageLoad();

        const { productInfo, newPage } = await searchResultsPage.clickRandomProduct();
        const productDetailsPage = new ProductDetailPage(newPage);

        const actualInfo = await productDetailsPage.getProductInfo();
        expect(actualInfo).toEqual(productInfo);

        await productDetailsPage.goToReviews();
        await productDetailsPage.selectSortOption(ReviewSortOption.Newest);

        if (await productDetailsPage.hasReviews()) {
            const card = await productDetailsPage.clickRandomThumb();
            await expect(card.getByText('Teşekkür Ederiz.')).toBeVisible();
        } else {
            console.log('Bu ürünün değerlendirmesi yok');
        }
    });
});
