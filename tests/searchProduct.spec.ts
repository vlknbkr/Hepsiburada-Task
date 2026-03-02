import { test, expect } from '../src/ui/fixtures/Fixtures';
import { ProductDetailPage } from '../src/ui/pages/ProductDetailPage';
import { ReviewSortOption } from '../src/ui/types/ReviewSortOption';

test.describe('Scenario 1 - Product Search and Review', () => {

    test('Search for a product, select random product, verify and interact with reviews', async ({ homePage, searchResultsPage, page }) => {

        await homePage.open();
        await expect(page).toHaveURL('https://www.hepsiburada.com/');

        await homePage.search('iphone');
        await expect(page).toHaveURL(/iphone/i);

        await searchResultsPage.waitForPageLoad();

        const { productInfo, newPage } = await searchResultsPage.clickRandomProduct();

        const productDetailsPage = new ProductDetailPage(newPage);
        await productDetailsPage.waitForPageLoad();
        await expect(productDetailsPage.productTitle).toBeVisible();
        const sellers = await productDetailsPage.getOtherSellers();



        const actualInfo = await productDetailsPage.getProductInfo();
        expect(actualInfo).toEqual(productInfo);

        console.table(sellers?.map(s => ({
            Merchant: s.merchantName,
            price: s.price,
            button: s.goToProductBtn
        })));

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