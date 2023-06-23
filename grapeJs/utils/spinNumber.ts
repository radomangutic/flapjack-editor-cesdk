export function spinNumber(
  current: number,
  min: number,
  max: number,
  step: number
): number {
  return current === max ? min : Math.min(current + step, max);
}
