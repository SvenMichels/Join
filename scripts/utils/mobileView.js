export function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches
}