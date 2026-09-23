const PALETTE = ["#eb7100", "#5c2163", "#0f7c8c", "#241e4e", "#1f7a4d", "#b8860b", "#c2410c", "#8b3fa8"];

export function projectColor(id: number): string {
  return PALETTE[(id - 1) % PALETTE.length];
}
