export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNumericString(str: string): boolean {
  if (typeof str !== 'string' || str.trim() === '') {
    return false;
  }
  return Number.isFinite(+str);
}