export function numberParser({ number, fixed }: { number: string | number; fixed?: number }): number {
  const _value = number?.toString() ?? '';

  if (Number.isNaN(parseFloat(_value))) return 0;

  return parseFloat(parseFloat(_value).toFixed(fixed ?? 2));
}
