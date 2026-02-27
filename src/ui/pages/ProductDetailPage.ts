import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductDetailPage extends BasePage {
    readonly productTitle;
    readonly produectPrice;

    constructor(page: Page) {
        super(page);
        this.productTitle = page.locator('data-test-id="title"');
        this.produectPrice = page.locator('data-test-id="default-price"');
    }

    async waitForPageLoad() {
        await super.waitForPageLoad();
        // ürün sayfasının yüklenmesini bekle
    }

    async getProductTitle() {

    }

    async gerProductPrice() {

    }
}

/**
 * sayfanın yüklenmesini doğrula
 * ürün detaylarını al ve seçilen ürün ile karşılaştır
 * Değerlendirme tabına git
 * Sıralama dropdown'ını aç
 * En yeni değerlendirme seç
 * gelen değerlendirmeleri al
 * içlerinden birinin thumpsUp/thumpsDown butonuna tıkla 
 * teşekkür ederiz mesajını doğrula
 * Eğer ürünün hiç bir değerlendirmesi yoksa bekle
 */