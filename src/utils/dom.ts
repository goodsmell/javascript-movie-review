export function requireElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`요소를 찾을 수 없습니다: ${selector}`);
  return el;
}
