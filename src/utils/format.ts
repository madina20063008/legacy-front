/** Format tiyin (minor units) as UZS so'm with grouped thousands. */
export function formatUzs(tiyin: number): string {
  const som = Math.round(tiyin / 100);
  return `${som.toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;
}

/** Parse a user-typed so'm amount into tiyin. */
export function parseUzs(input: string): number {
  const digits = input.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) * 100 : 0;
}
