export function parseTRY(price: string): number | null {
    const match = price.match(/(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?/);
    if (match) {
        return Number(
            match[0]
                .replace(/\./g, '')
                .replace(',', '.')
        );
    }
    return null;
}