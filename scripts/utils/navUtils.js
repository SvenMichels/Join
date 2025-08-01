/**
 * @fileoverview Navigation utility functions for handling active link highlighting.
 */

/**
 * Highlights active navigation links based on the current page URL.
 *
 * @param {Array<string>} [selectors=[".nav-buttons", ".taskFrameLink"]] - 
 * An array of CSS selectors for navigation elements to check.
 */
export function highlightActiveNavigationLinks(selectors = [".nav-buttons", ".taskFrameLink"]) {
  const currentPage = getCurrentPageName();

  document.querySelectorAll(selectors.join(",")).forEach(element => {
    const link = element.tagName === "A" ? element : element.closest("a");
    if (!link.href) return;

    const targetPage = getPageNameFromHref(link.href);
    if (targetPage === currentPage) {
      element.classList.add("active");
    }
  });
}

/**
 * Retrieves the current page filename from the URL.
 *
 * @returns {string} The current page name without path or query/hash parameters.
 */
function getCurrentPageName() {
  return window.location.pathname.split("/").pop().replace(/[#?].*$/, "");
}

/**
 * Extracts the page filename from a given href string.
 *
 * @param {string} href - The href attribute value of a link.
 * @returns {string} The page name without path or query/hash parameters.
 */
function getPageNameFromHref(href) {
  return href.split("/").pop().replace(/[#?].*$/, "");
}
