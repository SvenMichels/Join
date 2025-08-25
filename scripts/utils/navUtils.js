/**
 * @fileoverview Navigation utility functions for handling active link highlighting.
 */

/**
 * Highlights active navigation links based on the current page URL.
 *
 * @param {Array<string>} [selectors=[".nav-buttons", ".taskFrameLink"]] - 
 * An array of CSS selectors for navigation elements to check.
 */
export function highlightActiveNavigationLinks(selectors = [".nav-buttons", ".taskFrameLink", ".nav-media-links"]) {
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

/**
 * Initialisiert den Listener zum Öffnen des Menüs (Desktop und Mobile).
 *
 * - Ersetzt den bestehenden Button mit einem geklonten Element, 
 *   um doppelte Event-Listener zu vermeiden.
 * - Fügt dem neuen Button einen Click-Listener hinzu, 
 *   der je nach Bildschirmbreite unterschiedliche Aktionen ausführt:
 *   - **Mobile (<= 768px):** Öffnet oder schließt das mobile Dropdown-Menü
 *     über `toggleMobileMenu()`.
 *   - **Desktop (> 768px):** Schaltet die Sichtbarkeit des Dropdown-Menüs
 *     über die Klasse `dp-none` um.
 *
 * Voraussetzungen:
 * - Es muss ein Button mit der ID `"openMenu"` existieren.
 * - Das Dropdown-Menü muss ein Element mit der ID `"dropDownMenu"` haben.
 *
 * @function setupOpenMenuListener
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
export function setupOpenMenuListener() {
  const openMenuButton = document.getElementById("openMenu");
  const dropDownMenu = document.getElementById("dropDownMenu");
  if (openMenuButton && dropDownMenu) {
    openMenuButton.replaceWith(openMenuButton.cloneNode(true));
    const newOpenMenuButton = document.getElementById("openMenu");
    newOpenMenuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 768) {
        toggleMobileMenu();
      } else {
        dropDownMenu.classList.toggle("dp-none");
      }
    });
  }
}

/**
 * Schaltet die Sichtbarkeit des mobilen Dropdown-Menüs um.
 *
 * Diese Funktion greift auf das Element mit der ID `"dropDownMenu"` zu
 * und toggelt die CSS-Klasse `"dp-none"`.  
 * Damit wird das Menü ein- oder ausgeblendet.
 *
 * @function toggleMobileMenu
 * @returns {void} Diese Funktion gibt keinen Wert zurück.
 */
function toggleMobileMenu() {
  const dropDownMenu = document.getElementById("dropDownMenu");
  if (dropDownMenu) {
    dropDownMenu.classList.toggle("dp-none");
  }
}