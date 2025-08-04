/**
 * Main file for contact management
 */

import { LocalStorageService } from '../scripts/utils/localStorageHelper.js';
import { handleContactEditSubmission, openEditDialog, emptyInput } from './contactEditor.js';
import { getAllContactsFromDatabase, generateBigContactTemplate } from './contactExternalService.js';
import { openContactAdditionWindow, closeAddWindow, closeEditWindow, showUserFeedback } from './contactModal.js';
import { loadAllContactsFromFirebaseDatabase, createContact, deleteContactFromDatabase } from './contactDataService.js';
import { getInitials } from '../scripts/utils/helpers.js';
import { generateRandomColorClass } from '../scripts/utils/colors.js';
import { bindButton, loadAndShowContactDetails } from './contactUtils.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { highlightActiveNavigationLinks } from '../scripts/utils/navUtils.js';
import { updateTask } from '../board/taskManager.js';
import { fetchAllTasks } from '../scripts/auth/login.js';
import { initializeBackButton, initializeFabMenu } from "../scripts/ui/fabContact.js";

let contactList = [];
let editingContact = null;
let currentRenderedContact = null;

window.contactList = contactList;

/**
 * Sets up all contact-related event listeners
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

  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAddWindow();
      closeEditWindow();
    });
  });

  const cancelBtns = document.querySelectorAll(".cancelBtn");
  cancelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      closeAddWindow();
      closeEditWindow();
    });
  });

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddWindow();
      closeEditWindow();
    }
  });
}

/**
 * Displays a contact in detail view or opens edit view on mobile
 * 
 * @param {string} name - Contact's full name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone number
 * @param {string} initials - Contact initials
 * @param {string} id - Contact ID
 * @param {string} color - Assigned color
 */
function renderSingleContact(name, email, phone, initials, id, color) {
  const contact = contactList.find(c => c.userId === id);
  if (!contact) return;
    // currentRenderedContact = contact;

  if (window.innerWidth <= 768) {
    openEditDialog(contact);
    return;
  }

  currentRenderedContact = contact;

  const template = generateBigContactTemplate(name, email, phone, initials, color);
  document.getElementById("bigContact").innerHTML = template;

  prepareResponsiveContactView(contact)
  
  
  bindContactActions(id, name, contact);
  loadAndShowContactDetails();
}

window.renderSingleContact = renderSingleContact;

/**
 * Prepares the contact view based on screen size (mobile or desktop).
 *
 * - On desktop: ensures the contact panel is visible
 * - On mobile: shows FAB and back button and sets contact panel visible
 *
 * @param {Object} contact - Contact object to be rendered
 */
function prepareResponsiveContactView(contact) {
  const singleContact = document.querySelector('.singleContact');
  if (!singleContact) return;

  if (window.innerWidth > 768) {
    singleContact.style.display = 'flex';
  }

  if (window.innerWidth <= 768) {
    singleContact.style.display = 'flex';

    setTimeout(() => {
      initializeFabMenu(contact);
      initializeBackButton();
    }, 50);
  }
}

/**
 * Creates a contact object from input form
 * 
 * @param {string} fullName - Full name from input
 * @returns {Object} contact - Contact object
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
 * Adds a new contact to Firebase and updates UI
 * 
 * @param {Event} e - Submit event
 */
async function addNewContactToDatabase(e) {
  e.preventDefault();
  const userFullName = document.getElementById("contactName").value.trim();
  const contact = createContactFromForm(userFullName);
  await addContactTry(contact);
}

/**
 * Saves contact to Firebase
 * 
 * @param {Object} contact - Contact object
 */
async function saveNewContact(contact) {
  const result = await createContact(contact);
  if (result && result.name) {
    contact.userId = result.name;
    contactList.push(contact);
    window.contactList = contactList;
  }
}

/**
 * Updates UI after contact creation
 */
function updateUIAfterContactCreation() {
  clearContactListUI();
  renderAllContacts(contactList);
  emptyInput();
  showUserFeedback();
  setTimeout(closeAddWindow, 800);
}

/**
 * Tries to save contact and update UI
 * 
 * @param {Object} contact - Contact object
 */
async function addContactTry(contact) {
  await saveNewContact(contact);
  updateUIAfterContactCreation();
}

/**
 * Binds actions to the big contact view buttons
 * 
 * @param {string} id - Contact ID
 * @param {string} name - Contact name
 * @param {Object} contact - Contact object
 */
function bindContactActions(id, name, contact) {
  const container = document.getElementById("bigContact");
  bindButton(container, "#delete", () => deleteContactFromDatabase(id, name));
  bindButton(container, "#edit", () => openEditDialog(contact));
}

/**
 * Filters tasks assigned to a deleted user
 * 
 * @param {Array} tasks - All tasks
 * @param {string} userName - Name of the deleted user
 * @returns {Array} Filtered tasks
 */
function filterTasksByUser(tasks, userName) {
  const filtered = tasks.filter(task =>
    Array.isArray(task.assignedUsers) && task.assignedUsers.includes(userName)
  );return filtered;
}

/**
 * Removes user from assigned task and updates task
 * 
 * @param {Object} task - Task object
 * @param {string} userName - Username to remove
 * @returns {Promise}
 */
export function updateTaskWithoutUser(task, userName) {
  task.assignedUsers = task.assignedUsers.filter(user => user !== userName);
  return updateTask(task);
}

/**
 * Removes a deleted user from all tasks
 * 
 * @param {string} deletedUserName - Name of the deleted user
 */
export async function removeUserFromAllTasks(deletedUserName) {
  const allTasks = await fetchAllTasks();

  const filteredTasks = filterTasksByUser(allTasks, deletedUserName);
  const updates = filteredTasks.map(task => updateTaskWithoutUser(task, deletedUserName));

  await Promise.all(updates);
}

/**
 * Initializes the contact page
 */
async function init() {
  const loadedContacts = await loadAllContactsFromFirebaseDatabase();
  contactList = loadedContacts || [];
  window.contactList = contactList;
  setupEventListeners();
  highlightActiveNavigationLinks();
}

/**
 * Sets initials into the profile button
 */
function setupProfileButton() {
  const userData = getUserFromStorage();
  const userName = userData.userFullName || userData.name;
  const profileButton = document.getElementById("openMenu");

  if (profileButton) {
    const initials = getInitials(userName);
    profileButton.textContent = initials;
  }
}

/**
 * Sets up dropdown menu for profile
 */
function setupDropdown() {
  const openMenuButton = document.getElementById("openMenu");
  const dropDownMenu = document.getElementById("dropDownMenu");

  if (openMenuButton && dropDownMenu) {
    openMenuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      dropDownMenu.classList.toggle("dp-none");
    });

    document.addEventListener("click", (e) => {
      if (!dropDownMenu.contains(e.target) && !openMenuButton.contains(e.target)) {
        dropDownMenu.classList.add("dp-none");
      }
    });
  }
}

/**
 * Loads user data from localStorage
 * 
 * @returns {object|null} User data or null
 */
function getUserFromStorage() {
  const currentUserString = LocalStorageService.getItem("currentUser");
  return currentUserString ? currentUserString : null;
}

// Initialize page on DOM load
document.addEventListener('DOMContentLoaded', init);

export { setupEventListeners };


window.addEventListener('resize', () => {
  const singleContact = document.querySelector('.singleContact');
  const fab = document.getElementById('fabContainer');
  const isMobile = window.innerWidth <= 768;

  if (!singleContact) return;

  if (isMobile && currentRenderedContact) {
    singleContact.style.display = 'flex';
    if (fab) fab.style.display = 'block';

    initializeFabMenu(currentRenderedContact);
    initializeBackButton();
  }

  if (!isMobile) {
    singleContact.style.display = 'flex';
    if (fab) fab.style.display = 'none';
  }
});