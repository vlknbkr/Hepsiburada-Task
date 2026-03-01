import { test as base, expect, Page } from '@playwright/test'
import { HomePage } from "../pages/HomePage"
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";

type UIFixtures = {
    homePage: HomePage;
    searchResultsPage: SearchResultsPage;
}

export const test = base.extend<UIFixtures>({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },

    searchResultsPage: async ({ page }, use) => {
        const searchResultsPage = new SearchResultsPage(page);
        await use(searchResultsPage);
    }
})

export { expect };

