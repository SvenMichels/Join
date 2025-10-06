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
import { handleResize, prepareResponsiveContactView } from './handleView.js';
import { checkNoLoggedInUser, logoutUserHandler } from '../scripts/events/logoutevent.js';

let contactList = [];
let editingContact = null;
export let currentRenderedContact = null;

window.contactList = contactList;

/**
 * Sets up all contact-related event listeners
 * @description Initializes all event handlers for the contact management interface
 * @returns {void}
 */
function setupEventListeners() {
  checkNoLoggedInUser();
  logoutUserHandler();
  setupProfileButton();
  setupOpenMenuListener();
  setupContactFormListeners();
  setupModalListeners();
  setupKeyboardListeners();
  setupInitInputFields();
  setupCreateContactButton()
}

/**
 * Sets up input field initialization with validation
 * @description Initializes input fields with their corresponding validation hints
 * @returns {void}
 * @private
 */
function setupInitInputFields() {
  initInputField('contactEmail', 'emailHint', 'email');
  initInputField('contactName', 'nameHint', 'name');
  initInputField('contactPhone', 'phoneHint', 'phone');
  initInputField('editContactEmail', 'editEmailHint', 'email');
  initInputField('editContactName', 'editNameHint', 'name');
  initInputField('editContactPhone', 'editPhoneHint', 'phone');
}

/**
 * Sets up the create contact button with validation
 * @description Configures the submit button state based on form validation
 * @returns {void}
 * @private
 */
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
 * @description Attaches event handlers to contact form elements for add and edit operations
 * @returns {void}
 * @private
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
 * @description Initializes event handlers for modal interactions
 * @returns {void}
 * @private
 */
function setupModalListeners() {
  setupCloseButtons();
  setupOutsideClickHandlers();
}

/**
 * Sets up close button event listeners
 * @description Attaches click handlers to all close buttons in the interface
 * @returns {void}
 * @private
 */
function setupCloseButtons() {
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });
}

/**
 * Sets up delete button event listeners for a specific contact
 * @description Configures delete button functionality for contact removal
 * @param {Object} contact - Contact object containing user information
 * @returns {void}
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
 * @description Enables closing modals by clicking outside their content area
 * @returns {void}
 * @private
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
 * @description Enables closing modals with the Escape key
 * @returns {void}
 * @private
 */
function setupKeyboardListeners() {
  document.addEventListener("keydown", handleKeyPress);
}

/**
 * Handles outside click events on modals
 * @description Closes modals when clicking outside their content area
 * @param {Event} e - Click event
 * @returns {void}
 * @private
 */
function handleOutsideClick(e) {
  if (e.target === e.currentTarget) {
    closeAllModals();
  }
}

/**
 * Handles keyboard events (ESC key)
 * @description Processes keyboard input for modal control
 * @param {Event} e - Keyboard event
 * @returns {void}
 * @private
 */
function handleKeyPress(e) {
  if (e.key === "Escape") {
    closeAllModals();
  }
}

/**
 * Closes all open modals
 * @description Closes both add and edit contact modals
 * @returns {void}
 * @private
 */
function closeAllModals() {
  closeAddWindow();
  closeEditWindow();
}

/**
 * Displays a contact in detail view or opens edit view on mobile
 * @description Renders a single contact's detailed information and sets up actions
 * @param {string} name - Contact's full name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone number
 * @param {string} initials - Contact initials
 * @param {string} id - Contact ID
 * @param {string} color - Assigned color
 * @returns {void}
 * @private
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

/**
 * Clears active state from all contact elements
 * @description Removes active styling from previously selected contacts
 * @returns {void}
 * @private
 */
function clearActiveContactState() {
  document.querySelectorAll(
    '.contact-item.active, [data-contact-id].active, [onclick*="renderSingleContact"].active'
  ).forEach(el => el.classList.remove('active'));
}

/**
 * Sets the active class for the specified contact
 * @description Adds active styling to the selected contact element
 * @param {string} contactId - ID of the contact to activate
 * @returns {void}
 * @private
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
 * Validates contact form input fields
 * @description Performs comprehensive validation on contact form data
 * @param {string} fullName - Full name input value
 * @param {string} userEmailElement - Email input element ID
 * @param {string} userPhoneElement - Phone input element ID
 * @returns {Object|null} Validated contact data or null if validation fails
 */
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
 * @description Constructs a normalized contact object from form input data
 * @param {string} fullName - Full name from input
 * @returns {Object|null} Contact object or null if validation fails
 * @private
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
 * @description Handles the form submission for creating a new contact
 * @param {Event} e - Submit event
 * @returns {Promise<void>}
 * @private
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
 * @description Persists contact data to the Firebase database
 * @param {Object} contact - Contact object
 * @returns {Promise<void>}
 * @private
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
 * @description Refreshes the contact list display and closes forms after successful creation
 * @returns {void}
 * @private
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
 * @description Orchestrates the contact creation process with error handling
 * @param {Object} contact - Contact object
 * @returns {Promise<void>}
 * @private
 */
async function addContactTry(contact) {
  await saveNewContact(contact);
  updateUIAfterContactCreation();
}

/**
 * Binds actions to the big contact view buttons
 * @description Attaches event handlers to contact detail view action buttons
 * @param {string} id - Contact ID
 * @param {string} name - Contact name
 * @param {Object} contact - Contact object
 * @returns {void}
 * @private
 */
function bindContactActions(id, name, contact) {
  const container = document.getElementById("bigContact");
  bindButton(container, "#delete", () => deleteContactFromDatabase(id, name));
  bindButton(container, "#edit", () => openEditDialog(contact));
}

/**
 * Filters tasks assigned to a deleted user
 * @description Finds all tasks that include the specified user in their assignments
 * @param {Array} tasks - All tasks
 * @param {string} userName - Name of the deleted user
 * @returns {Array} Filtered tasks containing the user
 * @private
 */
function filterTasksByUser(tasks, userName) {
  const filtered = tasks.filter(task =>
    Array.isArray(task.assignedUsers) && task.assignedUsers.includes(userName)
  ); return filtered;
}

/**
 * Removes user from assigned task and updates task
 * @description Removes a user from a task's assignment list and saves the changes
 * @param {Object} task - Task object
 * @param {string} userName - Username to remove
 * @returns {Promise} Promise resolving to the update result
 */
export function updateTaskWithoutUser(task, userName) {
  task.assignedUsers = task.assignedUsers.filter(user => user !== userName);
  return updateTask(task);
}

/**
 * Removes a deleted user from all tasks
 * @description Cleans up task assignments when a user is deleted from the system
 * @param {string} deletedUserName - Name of the deleted user
 * @returns {Promise<void>}
 */
export async function removeUserFromAllTasks(deletedUserName) {
  const allTasks = await fetchAllTasks();
  const filteredTasks = filterTasksByUser(allTasks, deletedUserName);
  const updates = filteredTasks.map(task => updateTaskWithoutUser(task, deletedUserName));
  await Promise.all(updates);
}

/**
 * Initializes the contact page
 * @description Sets up the contact page by loading data and initializing event listeners
 * @returns {Promise<void>}
 * @private
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
 * @description Updates the profile button with the current user's initials
 * @returns {void}
 * @private
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
 * @description Retrieves the current user's information from local storage
 * @returns {Object|null} User data or null if not found
 * @private
 */
function getUserFromStorage() {
  const currentUserString = LocalStorageService.getItem("currentUser");
  return currentUserString ? currentUserString : null;
}

document.addEventListener('DOMContentLoaded', init);

export { setupEventListeners };

window.addEventListener('resize', handleResize);
