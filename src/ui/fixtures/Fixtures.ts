import { test as base, expect } from '@playwright/test'
import { HomePage } from "../pages/HomePage"
import { SearchResultsPage } from "../pages/SearchResultsPage";
import { SearchFlow } from '../flows/SearchFlow';

type UIFixtures = {
    homePage: HomePage;
    searchResultsPage: SearchResultsPage;
    searchFlow: SearchFlow;
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
    }
})

export { expect };

