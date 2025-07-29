/**
 * Hauptdatei für die Kontaktverwaltung
 */

import { handleContactEditSubmission, openEditDialog, emptyInput } from './contactEditor.js';
import { getAllContactsFromDatabase, generateBigContactTemplate } from './contactExternalService.js';
import { openContactAdditionWindow, closeAddWindow, closeEditWindow, showUserFeedback } from './contactModal.js';
import { loadAllContactsFromFirebaseDatabase, createContact, deleteContactFromDatabase } from './contactDataService.js';
import { getInitials } from '../scripts/utils/helpers.js';
import { generateRandomColorClass } from '../scripts/utils/colors.js';
import { bindButton, loadAndShowContactDetails } from './contactUtils.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';

let contactList = [];
let editingContact = null;

window.contactList = contactList;

/**
 * Event-Listener einrichten
 */
function setupEventListeners() {
  setupProfileButton();
  setupDropdown();
  
  const addBtn = document.getElementById("addBtn");
  if (addBtn) addBtn.addEventListener("click", openContactAdditionWindow);

  const addForm = document.getElementById("addContactForm");
  if (addForm) addForm.addEventListener("submit", addNewContactToDatabase);

  const editForm = document.getElementById("editContactForm");
  if (editForm) editForm.addEventListener("submit", handleContactEditSubmission);

  // Modals schließen
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAddWindow();
      closeEditWindow();
    });
  });

  // Cancel Buttons
  const cancelBtns = document.querySelectorAll(".cancelBtn");
  cancelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      closeAddWindow();
      closeEditWindow();
    });
  });

  // Außerhalb Modal klicken zum Schließen
  const addWindow = document.getElementById("addWindow");
  const editWindow = document.getElementById("editWindow");
  
  if (addWindow) {
    addWindow.addEventListener("click", (e) => {
      if (e.target === addWindow) {
        closeAddWindow();
      }
    });
  }
  
  if (editWindow) {
    editWindow.addEventListener("click", (e) => {
      if (e.target === editWindow) {
        closeEditWindow();
      }
    });
  }

  // ESC-Taste zum Schließen der Modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddWindow();
      closeEditWindow();
    }
  });
}

/**
 * Zeigt Kontaktdetails an - im Mobile-Modus direkt bearbeiten
 */
function renderSingleContact(name, email, phone, initials, id, color) {
  const contact = contactList.find(c => c.userId === id);
  if (!contact) return;
  
  if (window.innerWidth <= 768) {
    openEditDialog(contact);
    return;
  }
  
  const template = generateBigContactTemplate(name, email, phone, initials, color);
  document.getElementById("bigContact").innerHTML = template;
  bindContactActions(id, name, contact);
  loadAndShowContactDetails();
}

window.renderSingleContact = renderSingleContact;

/**
 * Erstellt Kontakt aus Formulardaten
 */
function createContactFromForm(fullName) {
  return {
    userFullName: fullName,
    userEmailAddress: document.getElementById("contactEmail").value.trim(),
    userPhoneNumber: document.getElementById("contactPhone").value.trim(),
    userInitials: getInitials(fullName),
    firstCharacter: fullName ? fullName.charAt(0).toUpperCase() : "?",
    userColor: generateRandomColorClass(),
  };
}

/**
 * Fügt neuen Kontakt zur Datenbank hinzu
 * @param {Event} e - Submit Event
 */
async function addNewContactToDatabase(e) {
  e.preventDefault();
  const userFullName = document.getElementById("contactName").value.trim();
  const contact = createContactFromForm(userFullName);
  await addContactTry(contact);

}

/**
 * Speichert neuen Kontakt
 * @param {Object} contact - Kontaktdaten
 */
async function saveNewContact(contact) {
    const result = await createContact(contact);
    // Firebase gibt direkt ein Objekt mit 'name' (ID) zurück
    if (result && result.name) {
      contact.userId = result.name;
      contactList.push(contact);
      window.contactList = contactList;
    }
}

/**
 * Aktualisiert UI nach Kontakt-Erstellung
 */
function updateUIAfterContactCreation() {
  clearContactListUI();
  renderAllContacts(contactList);
  emptyInput();
  showUserFeedback();
  setTimeout(closeAddWindow, 800);
}

/**
 * Versucht neuen Kontakt hinzuzufügen
 * @param {Object} contact - Kontaktdaten
 */
async function addContactTry(contact) {
  await saveNewContact(contact);
  updateUIAfterContactCreation();
}

/**
 * Bindet Kontakt-Aktionen
 * @param {string} id - Kontakt ID
 * @param {string} name - Kontakt Name
 * @param {Object} contact - Kontakt Objekt
 */
function bindContactActions(id, name, contact) {
  const container = document.getElementById("bigContact");
  bindButton(container, "#delete", () => deleteContactFromDatabase(id, name));
  bindButton(container, "#edit", () => openEditDialog(contact));
}

/**
 * Filtert Tasks nach gelöschtem User
 * @param {Array} tasks - Alle Tasks
 * @param {string} userName - Gelöschter Username
 * @returns {Array} Gefilterte Tasks
 */
function filterTasksByUser(tasks, userName) {
  return tasks.filter(task => task.assignedTo?.includes(userName));
}

/**
 * Aktualisiert Task ohne User
 * @param {Object} task - Task Objekt
 * @param {string} userName - Zu entfernender Username
 * @returns {Promise} Update Promise
 */
function updateTaskWithoutUser(task, userName) {
  task.assignedTo = task.assignedTo.filter(user => user !== userName);
  return putTaskData(task.id, task);
}

/**
 * Entfernt User aus allen Tasks
 * @param {string} deletedUserName - Name des gelöschten Users
 */
async function removeUserFromAllTasks(deletedUserName) {
  const allTasks = await getAllTasks();
  const filteredTasks = filterTasksByUser(allTasks, deletedUserName);
  const updates = filteredTasks.map(task => updateTaskWithoutUser(task, deletedUserName));

  await Promise.all(updates);
}

/**
 * Prüft ob Mobile-Ansicht aktiv ist
 * @returns {boolean} True wenn Mobile
 */
function isMobileView() {
  return window.innerWidth <= 768;
}

/**
 * Behandelt Mobile-Ansicht
 * @param {HTMLElement} contactFrame - Mobile Kontakt Frame
 * @param {HTMLElement} allContactsFrame - Alle Kontakte Frame
 */
function handleMobileView(contactFrame, allContactsFrame) {
  // Prüfe ob beide Elemente existieren
  if (!contactFrame || !allContactsFrame) {
    console.warn("Mobile View Elemente nicht gefunden:", { contactFrame, allContactsFrame });
    return;
  }
  
  if (contactFrame.style.display === "flex") {
    allContactsFrame.style.display = "none";
  } else {
    allContactsFrame.style.display = "flex";
  }
}

/**
 * Initialisiert die Kontaktseite
 */
async function init() {
  const loadedContacts = await loadAllContactsFromFirebaseDatabase();
  contactList = loadedContacts || [];
  window.contactList = contactList;
  setupEventListeners();
}

/**
 * Richtet Profile-Button mit Benutzer-Initialen ein
 */
function setupProfileButton() {
  // Verwende die gleichen Daten wie für den ersten Kontakt
  let userData = getUserFromStorage();

  const userName = userData.userFullName || userData.name;
  const profileButton = document.getElementById("openMenu");
  
  if (profileButton) {
    const initials = getInitials(userName);
    profileButton.textContent = initials;
  }
}

/**
 * Richtet Dropdown-Menu ein
 */
function setupDropdown() {
  const openMenuButton = document.getElementById("openMenu");
  const dropDownMenu = document.getElementById("dropDownMenu");
  
  if (openMenuButton && dropDownMenu) {
    openMenuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      dropDownMenu.classList.toggle("dp-none");
    });
    
    // Schließe Dropdown bei Klick außerhalb
    document.addEventListener("click", (e) => {
      if (!dropDownMenu.contains(e.target) && !openMenuButton.contains(e.target)) {
        dropDownMenu.classList.add("dp-none");
      }
    });
  }
}

/**
 * Holt Benutzer aus localStorage
 * @returns {Object|null} Benutzerdaten oder null
 */
function getUserFromStorage() {
  try {
    const currentUserString = localStorage.getItem("currentUser");
    const userDataString = localStorage.getItem("userData");
    
    if (currentUserString) {
      return JSON.parse(currentUserString);
    } else if (userDataString) {
      return JSON.parse(userDataString);
    }
    
    return null;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerdaten:", error);
    return null;
  }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', init);

export { setupEventListeners };
