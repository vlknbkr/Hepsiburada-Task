import { test as base, expect } from '@playwright/test'
import { HomePage } from "../pages/HomePage"
import { SearchResultsPage } from "../pages/SearchResultsPage";
import { SearchFlow } from '../flows/SearchFlow';
import { AddToCartFlow } from '../flows/AddToCartflow';
import { ProductDetailPage } from '../pages/ProductDetailPage';


type UIFixtures = {
    homePage: HomePage;
    searchResultsPage: SearchResultsPage;
    searchFlow: SearchFlow;
    productDetailPage: (page: import('@playwright/test').Page) => ProductDetailPage;
    addToCartFlow: (page: import('@playwright/test').Page) => AddToCartFlow;
}


export const test = base.extend<UIFixtures>({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },

    searchResultsPage: async ({ page }, use) => {
        const searchResultsPage = new SearchResultsPage(page);
        await use(searchResultsPage);
    },

    searchFlow: async ({ homePage }, use) => {
        const searchFlow = new SearchFlow(homePage);
        await use(searchFlow);
    },
    
    productDetailPage: async ({ }, use) => {
        // Factory pattern: Return a function that takes the dynamically created page (new tab)
        const createProductDetailPage = (newPage: import('@playwright/test').Page) => {
            return new ProductDetailPage(newPage);
        };
        await use(createProductDetailPage);
    },

    addToCartFlow: async ({ }, use) => {
        // Factory pattern: Return a function that takes the dynamically created page (new tab)
        const createAddToCartFlow = (newPage: import('@playwright/test').Page) => {
            return new AddToCartFlow(new ProductDetailPage(newPage));
        };
        await use(createAddToCartFlow);
    }
})

export { expect };

