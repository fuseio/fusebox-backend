export function aprToApy (interest: number, frequency: number) {
  return ((1 + (interest / 100) / frequency) ** frequency - 1) * 100
}
