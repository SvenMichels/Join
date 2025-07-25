/**
 * Externe Service-Abhängigkeiten für Kontakte
 * Wrapper für Firebase und Utility-Funktionen
 */

/**
 * Holt alle Kontakte aus der Datenbank
 * @returns {Promise<Array>} Liste aller Kontakte
 */
async function getAllContactsFromDatabase() {
  try {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    const data = await response.json();
    return data ? Object.entries(data).map(([key, value]) => ({ ...value, userId: key })) : [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

/**
 * Erstellt Initialen aus Vollnamen
 * @param {string} fullName - Vollständiger Name
 * @returns {string} Initialen (max 2 Zeichen)
 */
function getInitials(fullName) {
  if (!fullName?.trim()) return "?";
  const names = fullName.trim().split(/\s+/);
  return names.length === 1 ? 
    names[0].charAt(0).toUpperCase() : 
    names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}

/**
 * Generiert zufällige CSS-Farb-Klasse
 * @returns {string} CSS-Klasse für Farbe
 */
function generateRandomColorClass() {
  const colors = ["user1", "user2", "user3", "user4", "user5", "user6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generiert Template für große Kontakt-Ansicht
 * @param {string} name - Name
 * @param {string} email - E-Mail
 * @param {string} phone - Telefon
 * @param {string} initials - Initialen
 * @param {string} color - Farb-Klasse
 * @returns {string} HTML Template
 */
function generateBigContactTemplate(name, email, phone, initials, color) {
  return `
    <div class="big-contact-header">
      <div class="contact-icon-big ${color}">
        <span>${initials}</span>
      </div>
      <div class="contact-info">
        <h2>${name}</h2>
        <div class="contact-actions">
          <button id="editContact" class="edit-btn">Edit</button>
          <button id="deleteContact" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
    <div class="contact-details">
      <h3>Contact Information</h3>
      <div class="detail-item">
        <span class="label">Email:</span>
        <span class="value">${email}</span>
      </div>
      <div class="detail-item">
        <span class="label">Phone:</span>
        <span class="value">${phone}</span>
      </div>
    </div>`;
}

// Globale Konstanten
const BASE_URL = 'https://join-42c03-default-rtdb.europe-west1.firebasedatabase.app';
