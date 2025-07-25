/**
 * Navigation Utilities
 * Hilfsfunktionen für Navigation und Link-Highlighting
 */

/**
 * Hebt aktive Navigation-Links hervor
 * @param {Array} selectors - CSS-Selektoren für Navigation-Elemente
 */
export function highlightActiveNavigationLinks(selectors = [".nav-buttons", ".taskFrameLink"]) {
  const currentPage = getCurrentPageName();
  
  document.querySelectorAll(selectors.join(",")).forEach(element => {
    const link = element.tagName === "A" ? element : element.closest("a");
    if (!link?.href) return;
    
    const targetPage = getPageNameFromHref(link.href);
    if (targetPage === currentPage) {
      element.classList.add("active");
    }
  });
}

/**
 * Ermittelt aktuellen Seitennamen
 * @returns {string} Seitenname ohne Pfad und Parameter
 */
function getCurrentPageName() {
  return window.location.pathname.split("/").pop().replace(/[#?].*$/, "");
}

/**
 * Extrahiert Seitennamen aus href
 * @param {string} href - Link-href-Attribut
 * @returns {string} Seitenname ohne Pfad und Parameter
 */
function getPageNameFromHref(href) {
  return href.split("/").pop().replace(/[#?].*$/, "");
}
