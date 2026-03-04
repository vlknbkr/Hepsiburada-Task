import { Locator } from "@playwright/test";

export interface OtherSellerInfo {
    merchantName: string;
    price: number | null;
    goToProductBtn: Locator;
}
