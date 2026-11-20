/**
 * Tumpukan overlay (sheet/dialog) yang sedang terbuka.
 * Escape hanya menutup overlay paling atas, supaya sheet bersarang tidak ikut tertutup.
 */
const stack: symbol[] = [];

export function pushOverlay(token: symbol): void {
  stack.push(token);
}

export function popOverlay(token: symbol): void {
  const index = stack.lastIndexOf(token);
  if (index >= 0) stack.splice(index, 1);
}

export function isTopOverlay(token: symbol): boolean {
  return stack[stack.length - 1] === token;
}
