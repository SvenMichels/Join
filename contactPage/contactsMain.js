/**
 * Main file for contact management
 */

import { handleContactEditSubmission, openEditDialog, emptyInput } from './contactEditor.js';
import { getAllContactsFromDatabase, generateBigContactTemplate } from './contactExternalService.js';
import { openContactAdditionWindow, closeAddWindow, closeEditWindow, showUserFeedback } from './contactModal.js';
import { loadAllContactsFromFirebaseDatabase, createContact, deleteContactFromDatabase } from './contactDataService.js';
import { getInitials } from '../scripts/utils/helpers.js';
import { generateRandomColorClass } from '../scripts/utils/colors.js';
import { bindButton, loadAndShowContactDetails } from './contactUtils.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { highlightActiveNavigationLinks } from '../scripts/utils/navUtils.js';

let contactList = [];
let editingContact = null;

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
  return tasks.filter(task => task.assignedTo?.includes(userName));
}

/**
 * Removes user from assigned task and updates task
 * 
 * @param {Object} task - Task object
 * @param {string} userName - Username to remove
 * @returns {Promise}
 */
function updateTaskWithoutUser(task, userName) {
  task.assignedTo = task.assignedTo.filter(user => user !== userName);
  return putTaskData(task.id, task);
}

/**
 * Removes a deleted user from all tasks
 * 
 * @param {string} deletedUserName - Name of the deleted user
 */
async function removeUserFromAllTasks(deletedUserName) {
  const allTasks = await getAllTasks();
  const filteredTasks = filterTasksByUser(allTasks, deletedUserName);
  const updates = filteredTasks.map(task => updateTaskWithoutUser(task, deletedUserName));

  await Promise.all(updates);
}

/**
 * Checks whether current view is mobile
 * 
 * @returns {boolean}
 */
function isMobileView() {
  return window.innerWidth <= 768;
}

/**
 * Handles UI display logic for mobile contact view
 * 
 * @param {HTMLElement} contactFrame 
 * @param {HTMLElement} allContactsFrame 
 */
function handleMobileView(contactFrame, allContactsFrame) {
  if (!contactFrame || !allContactsFrame) {
    console.warn("Mobile view elements not found:", { contactFrame, allContactsFrame });
    return;
  }
  
  if (contactFrame.style.display === "flex") {
    allContactsFrame.style.display = "none";
  } else {
    allContactsFrame.style.display = "flex";
  }
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
 * @returns {Object|null} User data or null
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
    console.error("Error loading user data:", error);
    return null;
  }
}

// Initialize page on DOM load
document.addEventListener('DOMContentLoaded', init);

export { setupEventListeners };
