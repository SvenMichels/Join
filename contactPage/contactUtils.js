/**
 * Kontakt-Utilities und Hilfsfunktionen
 */

/**
 * Holt ersten Buchstaben des Namens
 * @param {string} name - Name
 * @returns {string} Erster Buchstabe
 */
function getFirstLetter(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

/**
 * Bindet Button-Event
 * @param {HTMLElement} container - Container Element
 * @param {string} selector - CSS Selector
 * @param {Function} callback - Callback Funktion
 */
function bindButton(container, selector, callback) {
  const button = container.querySelector(selector);
  if (button) {
    button.addEventListener('click', callback);
  }
}

/**
 * Lädt und zeigt Kontaktdetails
 */
function loadAndShowContactDetails() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    showBigContactAtMobile();
  } else {
    showBigContactAtDesktop();
  }
}

/**
 * Zeigt großen Kontakt auf Mobile
 */
function showBigContactAtMobile() {
  document.getElementById("mobileContactFrame").style.display = "flex";
  document.getElementById("allContactsFrame").style.display = "none";
}

/**
 * Zeigt großen Kontakt auf Desktop
 */
function showBigContactAtDesktop() {
  document.getElementById("bigContact").style.display = "block";
}

/**
 * Behandelt Ansicht nach Löschung
 * @param {Array} list - Kontaktliste
 */
function handlePostDeleteView(list) {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    document.getElementById("mobileContactFrame").style.display = "none";
    document.getElementById("allContactsFrame").style.display = "flex";
  }
  
  clearContactListUI();
  renderAllContacts(list);
  clearBigContactView();
}
