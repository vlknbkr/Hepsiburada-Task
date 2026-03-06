import { expect, Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

const DEBUG = '[SearchFlow]';

export class SearchFlow {
    constructor(
        private homePage: HomePage) {
    }

    async openSearchModal(): Promise<void> {
        console.log(`${DEBUG} openSearchModal → Arama modalı açılıyor...`);

        await expect.poll(async () => {
            await this.homePage.clickSearchBoxToTrigger();

            try {
                await this.homePage.isSearchModalActive();
                return true;
            } catch (e) {
                console.log(`${DEBUG} Modal henüz gelmedi, tekrar tıklanıyor...`);
                return false;
            }
        }, {
            message: 'Arama modalı 5 saniye içinde açılamadı.',
            intervals: [1000, 2000],
            timeout: 15000
        }).toBeTruthy();
    }

    async searchFor(term: string): Promise<void> {
        await this.openSearchModal();
        await this.homePage.fillSearchInput(term);
        await this.homePage.submitInput();
    }
}