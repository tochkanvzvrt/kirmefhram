export function toArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}