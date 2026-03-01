export function parseTRY(price: string): number {
    return Number(
        price
            .replace(/\./g, '')
            .replace(',', '.')
            .replace(/[^\d.]/g, '')
    );
}