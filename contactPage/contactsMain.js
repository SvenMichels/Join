import { LocalStorageService } from '../scripts/utils/localStorageHelper.js';
import { handleContactEditSubmission, openEditDialog, emptyInput } from './contactEditor.js';
import { generateBigContactTemplate } from './contactExternalService.js';
import { openContactAdditionWindow, closeAddWindow, closeEditWindow, showUserFeedback } from './contactModal.js';
import { loadAllContactsFromFirebaseDatabase, refreshUI, createContact, deleteContactFromDatabase } from './contactDataService.js';
import { getInitials } from '../scripts/utils/helpers.js';
import { generateRandomColorClass } from '../scripts/utils/colors.js';
import { bindButton, loadAndShowContactDetails, contactFeedback } from './contactUtils.js';
import { clearContactListUI, renderAllContacts } from './contactRenderer.js';
import { highlightActiveNavigationLinks, setupOpenMenuListener } from '../scripts/utils/navUtils.js';
import { updateTask } from '../board/taskManager.js';
import { fetchAllTasks } from '../scripts/auth/login.js';
import { initializeBackButton, initializeFabMenu } from "../scripts/ui/fabContact.js";
import { initInputField, showValidateBubble, confirmInputForFormValidation, validateInput } from "../scripts/auth/Validation.js";
import { enableButton, disableButton } from '../scripts/events/loginevents.js';

let contactList = [];
let editingContact = null;
let currentRenderedContact = null;

window.contactList = contactList;

/**
 * Sets up all contact-related event listeners
 */
/**
 * Sets up all contact-related event listeners
 */
function setupEventListeners() {
  setupProfileButton();
  setupOpenMenuListener();
  setupContactFormListeners();
  setupModalListeners();
  setupKeyboardListeners();
  setupInitInputFields();
  setupCreateContactButton()
}

function setupInitInputFields() {
  initInputField('contactEmail', 'emailHint', 'email');
  initInputField('contactName', 'nameHint', 'name');
  initInputField('contactPhone', 'phoneHint', 'phone');
  initInputField('editContactEmail', 'editEmailHint', 'email');
  initInputField('editContactName', 'editNameHint', 'name');
  initInputField('editContactPhone', 'editPhoneHint', 'phone');
}

function setupCreateContactButton() {
  const createContactBtn = document.getElementById("submitBtn");
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  if (!createContactBtn || !nameInput || !emailInput) return;
  disableButton(createContactBtn);

  function updateButtonState() {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    if (nameVal.length > 0 && nameVal.length < 4) {
      showValidateBubble("contactName", "Use at least 4 characters.", "nameHint", 1800);
    }
    if (emailVal.length > 0 && emailVal.length < 6) {
      showValidateBubble("contactEmail", "Use at least 6 characters.", "emailHint", 1800);
    }
    const nameValid = confirmInputForFormValidation("contactName", "nameHint");
    const emailValid = confirmInputForFormValidation("contactEmail", "emailHint");

    if (nameValid && emailValid) {
      enableButton(createContactBtn);
    } else {
      disableButton(createContactBtn);
    }
  }

  nameInput.addEventListener("input", updateButtonState);
  emailInput.addEventListener("input", updateButtonState);

  updateButtonState();
}
/**
 * Sets up contact form event listeners (add/edit forms)
 */
function setupContactFormListeners() {
  const addBtn = document.getElementById("addBtn");
  const addForm = document.getElementById("addContactForm");
  const editForm = document.getElementById("editContactForm");
  if (addBtn) addBtn.addEventListener("click", openContactAdditionWindow);
  if (addForm) {
    addForm.addEventListener("submit", addNewContactToDatabase);
  }
  if (editForm) editForm.addEventListener("submit", handleContactEditSubmission);
}

/**
 * Sets up modal-related event listeners (close buttons, outside clicks)
 */
function setupModalListeners() {
  setupCloseButtons();
  setupOutsideClickHandlers();
}

/**
 * Sets up close button event listeners
 */
function setupCloseButtons() {
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });
}

/**
 * Sets up cancel button event listeners
 */
export function setupDeleteButton(contact) {
  if (!contact || !contact.userId) return;
  const contactId = contact.userId;
  const contactName = contact.userFullName;
  document.querySelectorAll(".deleteModalBtn").forEach((btn) => {
    const clone = btn.cloneNode(true);
    btn.replaceWith(clone);
    clone.addEventListener("click", async (event) => {
      event.preventDefault();
      await deleteContactFromDatabase(contactId, contactName);
    },
      { once: true }
    );
  });
}

/**
 * Sets up outside click handlers for modals
 */
function setupOutsideClickHandlers() {
  const addWindow = document.getElementById("addWindow");
  const editWindow = document.getElementById("editWindow");
  if (addWindow) {
    addWindow.addEventListener("click", handleOutsideClick);
  }
  if (editWindow) {
    editWindow.addEventListener("click", handleOutsideClick);
  }
}

/**
 * Sets up keyboard event listeners (ESC key)
 */
function setupKeyboardListeners() {
  document.addEventListener("keydown", handleKeyPress);
}

/**
 * Handles outside click events on modals
 * @param {Event} e - Click event
 */
function handleOutsideClick(e) {
  if (e.target === e.currentTarget) {
    closeAllModals();
  }
}

/**
 * Handles keyboard events (ESC key)
 * @param {Event} e - Keyboard event
 */
function handleKeyPress(e) {
  if (e.key === "Escape") {
    closeAllModals();
  }
}

/**
 * Closes all open modals
 */
function closeAllModals() {
  closeAddWindow();
  closeEditWindow();
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
  currentRenderedContact = contact;
  clearActiveContactState();
  setActiveContactState(id);
  const template = generateBigContactTemplate(name, email, phone, initials, color);
  document.getElementById("bigContact").innerHTML = template;
  prepareResponsiveContactView(contact);
  bindContactActions(id, name, contact);
  loadAndShowContactDetails();
}

function clearActiveContactState() {
  document.querySelectorAll(
    '.contact-item.active, [data-contact-id].active, [onclick*="renderSingleContact"].active'
  ).forEach(el => el.classList.remove('active'));
}

/**
 * Sets the active class for the specified contact
 * @param {string} contactId
 */
function setActiveContactState(contactId) {
  const candidate =
    document.querySelector(`.contact-item[data-id="${contactId}"]`) ||
    document.querySelector(`[data-contact-id="${contactId}"]`) ||
    document.querySelector(`[onclick*="${contactId}"]`);
  if (!candidate) return;
  const target = candidate.closest('.contact-item') || candidate;
  target.classList.add('active');
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
  const panel = document.querySelector('.singleContact');
  if (!panel) return;
  currentRenderedContact = contact;
  const fab = document.getElementById('fabContainer');
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    updateMobileView(fab, panel, true);
  } else {
    updateDesktopView(fab, panel, true);
  }
}

export function formValidation(fullName, userEmailElement, userPhoneElement) {
  const userEmailAddress = document.getElementById(userEmailElement).value.trim();
  let userPhoneNumber = document.getElementById(userPhoneElement).value.trim();

  if (fullName === "") {
    showValidateBubble("contactName", "Input cannot be empty.", "nameHint");
    return null;
  }
  if (fullName.length < 4) {
    showValidateBubble("contactName", "Use at least 4 characters.", "nameHint");
    return null;
  }

  if (userEmailAddress === "") {
    showValidateBubble("contactEmail", "Input cannot be empty.", "emailHint");
    return null;
  }
  if (userEmailAddress.length < 6) {
    showValidateBubble("contactEmail", "Use at least 6 characters.", "emailHint");
    return null;
  }

  if (userPhoneNumber === "") userPhoneNumber = "No phone number provided";

  confirmInputForFormValidation("contactName", "nameHint");
  confirmInputForFormValidation("contactEmail", "emailHint");
  confirmInputForFormValidation("contactPhone", "phoneHint");

  return {
    userEmailAddress,
    userPhoneNumber,
    userFullName: fullName,
  };
}


/**
 * Creates a contact object from input form
 * 
 * @param {string} fullName - Full name from input
 * @returns {Object} contact - Contact object
 */
function createContactFromForm(fullName) {
  const userFullNameElement = document.getElementById("contactName");
  const userEmailAddressElement = document.getElementById("contactEmail");
  const userPhoneNumberElement = document.getElementById("contactPhone");
  const emailValidated = userEmailAddressElement.dataset.validationAttached === "true";
  const nameValidated = userFullNameElement.dataset.validationAttached === "true";

  if (!emailValidated || !nameValidated) {
    showUserFeedback("Please correct the highlighted fields before submitting.", "error");
    return null;
  }
  const result = formValidation(fullName, "contactEmail", "contactPhone");
  if (!result) {
    return null;
  }

  const { userEmailAddress, userPhoneNumber, userFullName } = result;

  const normalized = {
    userFullName,
    userEmailAddress,
    userPhoneNumber,
    userInitials: getInitials(userFullName),
    firstCharacter: userFullName ? userFullName.charAt(0).toUpperCase() : "?",
    userColor: generateRandomColorClass(),
    userPassword: '',
  };

  return normalized;
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
  if (!contact) return;
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
  contactFeedback();
  setTimeout(closeAddWindow, 800);
  refreshUI();
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
  ); return filtered;
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
 * Loads user data from localStorage
 * 
 * @returns {object|null} User data or null
 */
function getUserFromStorage() {
  const currentUserString = LocalStorageService.getItem("currentUser");
  return currentUserString ? currentUserString : null;
}

document.addEventListener('DOMContentLoaded', init);

export { setupEventListeners };

window.addEventListener('resize', handleResize);

/**
 * Handles responsive adjustments when window size changes.
 * - Mobile: shows FAB and contact panel only if a contact is open
 * - Desktop: hides FAB, removes slide animations, and shows panel if contact is open
 */
function handleResize() {
  const singleContact = document.querySelector('.singleContact');
  const fab = document.getElementById('fabContainer');
  if (!singleContact) return;

  const isMobile = window.innerWidth <= 768;
  const hasOpenContact = Boolean(currentRenderedContact);

  if (isMobile) {
    updateMobileView(fab, singleContact, hasOpenContact);
  } else {
    updateDesktopView(fab, singleContact, hasOpenContact);
  }
}

/**
 * Updates contact panel and FAB visibility for mobile view.
 * Adds slide-in animation if a contact is open, otherwise resets panel state.
 *
 * @param {HTMLElement} fab - Floating action button container
 * @param {HTMLElement} panel - Contact detail panel
 * @param {boolean} hasOpenContact - Whether a contact is currently open
 */
function updateMobileView(fab, panel, hasOpenContact) {
  if (fab) fab.style.display = hasOpenContact ? 'block' : 'none';
  if (hasOpenContact) {
    panel.classList.remove('slide-out');
    panel.classList.add('slide-in');
    panel.style.display = 'flex';
    initializeFabMenu(currentRenderedContact);
    initializeBackButton();
  } else {
    panel.classList.remove('slide-in', 'slide-out');
    panel.style.display = '';
  }
}

/**
 * Updates contact panel and FAB visibility for desktop view.
 * Removes any slide animation classes and shows panel if a contact is currently open.
 *
 * @param {HTMLElement} fab - Floating action button container
 * @param {HTMLElement} panel - Contact detail panel
 * @param {boolean} hasOpenContact - Whether a contact is currently open
 */
function updateDesktopView(fab, panel, hasOpenContact) {
  if (fab) fab.style.display = 'none';
  panel.classList.remove('slide-in', 'slide-out');
  panel.style.display = hasOpenContact ? 'flex' : '';
}