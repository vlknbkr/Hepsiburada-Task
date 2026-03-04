# Hepsiburada Test Automation Framework

A production-ready UI and API test automation framework built with **Playwright** and **TypeScript** for the Hepsiburada e-commerce platform.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev/) | Browser automation & API testing |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe test authoring |
| [Zod](https://zod.dev/) | Schema validation |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

---

## Project Structure

```
├── src/
│   ├── ui/
│   │   ├── pages/          # Page Object Models (BasePage, HomePage, SearchResultsPage, ProductDetailPage)
│   │   ├── components/     # Reusable UI components (ProductCard)
│   │   ├── fixtures/       # Playwright fixture definitions (page injection)
│   │   ├── types/          # TypeScript interfaces & enums (ProductInfo, OtherSellerInfo, ReviewSortOption…)
│   │   └── utils/          # Utility functions (ParsePrice)
│   └── api/
│       ├── client.ts       # Generic HTTP client wrapper (APIRequestContext)
│       ├── services/       # Service objects per API domain (SwaggerService)
│       ├── fixtures/       # API fixture definitions (service injection)
│       └── utils/          # Utility helpers (NameCounter, paths)
├── tests/
│   ├── ui/
│   │   ├── searchProduct.spec.ts   # Senaryo 1: Ürün arama & değerlendirme etkileşimi
│   │   └── otherSeller.spec.ts     # Senaryo 2: Diğer satıcıları bul & en ucuza sepete ekle
│   └── api/
│       └── swaggerGenerator.spec.ts # Swagger Generator API — POST client oluştur / GET indir
├── playwright.config.ts    # Global Playwright configuration
├── .env                    # Environment variables (gitignore'da olmalı)
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Install Playwright browsers
```bash
npx playwright install
```

### 3. Configure environment variables

Create a `.env` file in the project root (already present — **do not commit to git**):

```env
BASE_URL=https://www.hepsiburada.com
BASE_URL_API=https://generator.swagger.io/api/
```

---

## Running Tests

| Command | Description |
|---|---|
| `npm run test:chrome` | Run all tests on Chromium only |
| `npm run test:firefox` | Run all tests on Firefox only |
| `npm run test:all` | Run all tests on all configured browsers |
| `npm run test:debug` | Run in debug mode (Playwright Inspector) |

### Run a specific test file
```bash
npx playwright test tests/ui/searchProduct.spec.ts
npx playwright test tests/ui/otherSeller.spec.ts
npx playwright test tests/api/swaggerGenerator.spec.ts
```

### Run a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

---

## Reporting

Playwright HTML report is generated automatically after each run:
```bash
npx playwright show-report
```

Reports include:
- ✅ Full-page **screenshots** on every test
- 📹 **Video** recordings on every test
- 🔍 **Trace** files on failure (viewable at [trace.playwright.dev](https://trace.playwright.dev))

---

## Test Scenarios

### Senaryo 1 — Ürün Arama & Değerlendirme (`searchProduct.spec.ts`)
1. Hepsiburada ana sayfasını aç
2. Arama modalını aç
3. `"iphone"` ara
4. Arama sonuçlarından rastgele bir ürün seç
5. Ürün detay sayfasındaki başlık ve fiyatın, arama sonuçlarıyla eşleştiğini doğrula
6. Değerlendirmeler sekmesine geç
7. Değerlendirmeleri `"En yeni değerlendirme"` ye göre sırala
8. Rastgele bir değerlendirmeye `👍` veya `👎` oy ver; `"Teşekkür Ederiz."` mesajını doğrula

### Senaryo 2 — Diğer Satıcılar & Sepet (`otherSeller.spec.ts`)
1. Hepsiburada ana sayfasını aç ve `"iphone"` ara
2. Rastgele bir ürün seç
3. `"Diğer Satıcılar"` bölümü varsa, en ucuz satıcıya git
4. Ürünü sepete ekle
5. Sepete ekleme modalındaki başarı mesajını ve ürün başlığını doğrula

### API — Swagger Generator (`swaggerGenerator.spec.ts`)
1. `POST /gen/clients/javascript` ile Swagger client oluşturma isteği gönder
2. Yanıtta bir `link` alanı olduğunu doğrula
3. `GET {link}` ile oluşturulan client'ı indir
4. HTTP 200, `content-type: application/zip`, ve dosya boyutunun > 0 olduğunu doğrula

---

## Architecture Highlights

- **Page Object Model (POM):** Her sayfa için yüksek seviyeli action metotları; selector'lar sıkı biçimde POM içinde kapsüllenmiştir.
- **Playwright Fixtures:** `homePage` ve `searchResultsPage` fixture enjeksiyonu ile test bloklarında manuel `new` kullanımına gerek yoktur.
- **`expect.poll`:** Tüm kararsız UI etkileşimleri (tab değiştirme, sıralama, oy verme, sepete ekleme) `expect.poll` ile sarmalanarak otomatik yeniden deneme sağlanır.
- **`data-test-id` önceliği:** Selector stratejisi `data-test-id` niteliklerine (`[data-test-id="addToCart"]`) dayanır.
- **API Service Layer:** `HttpClient` ↔ `SwaggerService` ayrımı ile API testleri service object pattern'ını takip eder.
- **TypeScript:** Tüm veri tipleri için strict interface ve enum tanımları mevcuttur (`ReviewSortOption`, `ProductInfo`, `AddToCartModalData`).
