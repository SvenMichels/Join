export function highlightActiveLinks(
  selectors = [".nav-buttons", ".taskFrameLink"]
) {
  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .replace(/[#?].*$/, "");
  const sel = selectors.join(",");
  document.querySelectorAll(sel).forEach((el) => {
    const href =
      el.tagName === "A"
        ? el.getAttribute("href")
        : el.closest("a")?.getAttribute("href");
    if (!href) return;
    const targetPage = href
      .split("/")
      .pop()
      .replace(/[#?].*$/, "");
    if (targetPage === currentPage) el.classList.add("active");
  });
}
