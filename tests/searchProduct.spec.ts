import { test, expect } from '@playwright/test';
import { HomePage } from '../src/ui/pages/HomePage';
import { SearchResultsPage } from '../src/ui/pages/SearchResultsPage';
import { ProductDetailPage } from '../src/ui/pages/ProductDetailPage';

test.describe('Scenario 1 - Product Search and Review', () => {

    test('Search for a product, select random product, verify and interact with reviews', async ({ page }) => {

        const homePage = new HomePage(page);
        await homePage.open();

        await homePage.search('iphone');

        const searchResultsPage = new SearchResultsPage(page);
        await searchResultsPage.waitForPageLoad();

        const { productInfo } = await searchResultsPage.clickRandomProduct();
        console.log(`Selected product: ${productInfo.title} | Price: ${productInfo.finalPrice}`);

    });
});
