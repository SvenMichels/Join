/**
 * Hauptdatei für Kontaktverwaltung
 * Koordiniert alle Kontakt-Module
 */

let contactList = [];
let alphabetLettersUsedSet = new Set();
let editingContact = null;

/**
 * Initialisiert Kontaktseite
 */
function init() {
  loadAllContactsFromFirebaseDatabase();
  setupEventListeners();
}

/**
 * Richtet Event-Listener ein
 */
function setupEventListeners() {
  const createForm = document.getElementById("createContactForm");
  const editForm = document.getElementById("editContactForm");
  
  if (createForm) createForm.addEventListener("submit", addNewContactToDatabase);
  if (editForm) editForm.addEventListener("submit", handleContactEditSubmission);
  
  document.addEventListener("DOMContentLoaded", renderContactsOnDifferentScreensizes);
  window.addEventListener("resize", renderContactsOnDifferentScreensizes);
}

/**
 * Erstellt Kontakt-Objekt aus Formulardaten
 * @param {string} fullName - Vollständiger Name
 * @returns {Object} Kontakt-Objekt
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

  try {
    await addContactTry(contact);
  } catch (error) {
    console.error('Error adding contact:', error);
  }
}

/**
 * Speichert neuen Kontakt
 * @param {Object} contact - Kontaktdaten
 */
async function saveNewContact(contact) {
  const result = await createContact(contact);
  contact.userId = result.data.name;
  contactList.push(contact);
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
  bindButton(container, "#deleteContact", () => deleteContactFromDatabase(id, name));
  bindButton(container, "#editContact", () => openEditDialog(contact));
}

/**
 * Rendert einzelnen Kontakt in Detailansicht
 * @param {string} name - Name
 * @param {string} email - E-Mail
 * @param {string} phone - Telefon
 * @param {string} initials - Initialen
 * @param {string} id - User ID
 * @param {string} color - Farbe
 */
function renderSingleContact(name, email, phone, initials, id, color) {
  const contact = contactList.find(c => c.userId === id);
  if (!contact) return;

  const template = generateBigContactTemplate(name, email, phone, initials, color);
  document.getElementById("bigContact").innerHTML = template;
  
  bindContactActions(id, name, contact);
  loadAndShowContactDetails();
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
  try {
    const allTasks = await getAllTasks();
    const filteredTasks = filterTasksByUser(allTasks, deletedUserName);
    const updates = filteredTasks.map(task => updateTaskWithoutUser(task, deletedUserName));
    
    await Promise.all(updates);
  } catch (error) {
    console.error('Error removing user from tasks:', error);
  }
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
  if (contactFrame?.style.display === "flex") {
    allContactsFrame.style.display = "none";
  } else {
    allContactsFrame.style.display = "flex";
  }
}

/**
 * Rendert Kontakte auf verschiedenen Bildschirmgrößen
 */
function renderContactsOnDifferentScreensizes() {
  const contactFrame = document.getElementById("mobileContactFrame");
  const allContactsFrame = document.getElementById("allContactsFrame");

  if (isMobileView()) {
    handleMobileView(contactFrame, allContactsFrame);
  }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', init);
