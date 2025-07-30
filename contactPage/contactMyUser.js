
import { getInitials } from "../scripts/utils/helpers.js";
import { renderContact } from "./contactRenderer.js";
import { openEditWindow } from "./contacts.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
});

/**
 * Rendert die Kontaktkarte des aktuell eingeloggten Benutzers 
 * und fügt einen Event-Listener zum Bearbeiten-Button hinzu.
 *
 * Diese Funktion:
 * - Lädt die aktuellen Benutzerdaten aus dem `localStorage`
 * - Extrahiert die Kontaktinformationen via `extractContactInformation()`
 * - Rendert die Kontaktkarte mit `renderContact()`
 * - Fügt nach dem Rendering einen Click-Listener für den Button mit der ID `editContact` hinzu
 *
 * @async
 * @function currentUserCard
 * @returns {Promise<void>} Gibt nichts zurück. Führt UI-Manipulationen aus.
 *
 * @example
 * await currentUserCard();
 */
async function currentUserCard() {
  const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUserData) return;

  const contactData = extractContactInformation(currentUserData);

  renderContact(
    contactData.userFullName,
    contactData.userEmailAddress,
    contactData.userPhoneNumber,
    contactData.userInitials,
    contactData.firstCharacter,
    contactData.userId,
    contactData.userColor
  );

  // Event-Listener NACH dem Rendern hinzufügen
  setTimeout(() => {
    const editBtn = document.getElementById("editContact");
    if (editBtn) {
      editBtn.addEventListener("click", () => openEditWindow());
    }
  }, 100);
}

/**
 * Extrahiert relevante Kontaktinformationen aus einem User-Objekt.
 * 
 * Wandelt ein Benutzerobjekt in ein strukturiertes Objekt mit Informationen um, 
 * die für die Darstellung einer Kontaktkarte benötigt werden.
 *
 * @function extractContactInformation
 * @param {Object} userData - Das Benutzerobjekt mit den gespeicherten Userdaten.
 * @param {string} userData.userFullName - Vollständiger Name des Benutzers.
 * @param {string} userData.userEmailAddress - E-Mail-Adresse des Benutzers.
 * @param {string} userData.userPhoneNumber - Telefonnummer des Benutzers.
 * @param {string} userData.userColor - Farbcode, der dem Benutzer zugeordnet ist.
 * @param {string|number} userData.id - Eindeutige Benutzer-ID.
 *
 * @returns {Object} Ein Objekt mit extrahierten Kontaktdaten:
 * @returns {string} return.userFullName - Vollständiger Name.
 * @returns {string} return.userEmailAddress - E-Mail-Adresse.
 * @returns {string} return.userPhoneNumber - Telefonnummer.
 * @returns {string} return.userInitials - Initialen aus dem Namen.
 * @returns {string} return.firstCharacter - Erster Buchstabe des Namens (groß).
 * @returns {string|number} return.userId - Benutzer-ID.
 * @returns {string} return.userColor - Zugeordnete Farbe.
 *
 * @example
 * const contactData = extractContactInformation(currentUser);
 */
function extractContactInformation(userData) {
  const userFullName = userData.userFullName;
  const userEmailAddress = userData.userEmailAddress;
  const userPhoneNumber = userData.userPhoneNumber;
  const userInitials = getInitials(userData.userFullName);
  const firstCharacter = userData.userFullName ? userData.userFullName.charAt(0).toUpperCase() : "?";
  const userId = userData.id;
  const userColor = userData.userColor;

  return {
    userFullName,
    userEmailAddress,
    userPhoneNumber,
    userInitials,
    firstCharacter,
    userId,
    userColor
  };
}