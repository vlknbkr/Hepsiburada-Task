export class NameCounter {
  constructor(private readonly items: Array<{ name: string | null }>) { }

  count(): Record<string, number> {
    return this.items
      .map(item => item.name)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      .reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }
}