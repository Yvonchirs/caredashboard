const PALETTE = ["#f77600", "#2563a6", "#1f7a4d", "#8b3fa8", "#b7791f", "#0f7c8c", "#c2410c", "#be185d"];

export function projectColor(id: number): string {
  return PALETTE[(id - 1) % PALETTE.length];
}
