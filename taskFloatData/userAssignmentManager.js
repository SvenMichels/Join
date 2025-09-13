/**
 * @fileoverview User Assignment Management for Task Modal.
 * Handles loading, rendering, selection, and search of users to assign tasks.
 * @module userAssignmentManager
 */

import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";
import { getUserCheckboxHTML } from "./taskfloatHTML.js";
import { createRemainingChip } from "../board/boardUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";

let allSystemUsersModal = [];
const selectedUserNamesModal = new Set();

setupOutsideClickToClose(
  "assignedUserList-modal",
  ".assigned-input-wrapper", 
  "#assignedBtnImg-modal", 
  "#searchUser-modal",
   () => renderAllUsers()
);

/**
 * Loads and renders user checkboxes in the modal.
 * Always reloads contacts to ensure current user's data is displayed.
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsersModal(preselected = []) {
  await loadContactData();

  // clearSelectedUserNamesModal();

  const initial = Array.isArray(preselected) ? preselected : [];
  if (Array.isArray(window.pendingAssignedUsers) && window.pendingAssignedUsers.length) {
    initial.push(...window.pendingAssignedUsers);
    window.pendingAssignedUsers = null;
  }
  initial.forEach(n => selectedUserNamesModal.add(n));

  await renderUserCheckboxesModal(allSystemUsersModal);
}

/**
 * Loads contact data from the contact service.
 * Populates the global user array.
 * @private
 */
async function loadContactData() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsersModal = contacts || [];
  } catch (error) {
    allSystemUsersModal = [];
  }
}

export function clearSelectedUserNamesModal() {
  selectedUserNamesModal.clear();
  const chips = document.getElementById("selectedUser-modal");
  if (chips) chips.innerHTML = "";
  document.querySelectorAll(".user-checkbox-modal").forEach(cb => {
    cb.checked = false;
    cb.closest(".user-checkbox-wrapper-modal")?.classList.remove("active");
  });
}

/**
 * Renders user checkboxes in the modal.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {Promise<void>}
 */
export async function renderUserCheckboxesModal(users) {
  const container = document.getElementById("assignedUserList-modal");
  if (!container) return;

  renderCheckboxList(container, users);
  selectAssignedUsers(Array.from(selectedUserNamesModal));
  updateSelectedModal();
}

/**
 * Renders the checkbox list in the container.
 * @param {HTMLElement} container - Target DOM container.
 * @param {Array<Object>} users - List of users to render.
 * @private
 */
function renderCheckboxList(container, users) {
  container.innerHTML = "";
  users.forEach(user => {
    const checkboxElement = createUserCheckboxElement(user);
    container.appendChild(checkboxElement);
  });
}

/**
 * Applies a predefined user selection to the checkboxes.
 * @param {Array<string>} assignedUsers - User names to select.
 */
export function applyUserPreselection(assignedUsers) {
  if (!Array.isArray(assignedUsers)) return;

  selectedUserNamesModal.clear();
  assignedUsers.forEach(n => selectedUserNamesModal.add(n));
  renderUserCheckboxesModal(allSystemUsersModal);
}

/**
 * Selects the checkboxes for the given user names.
 * @param {Array<string>} assignedUsers - Array of user names to select.
 * @private
 */
function selectAssignedUsers(assignedUsers) {

  assignedUsers.forEach(userName => {
    const checkbox = document.querySelector(
      `.user-checkbox-modal[value="${userName}"]`
    );
    if (checkbox) {
      activateCheckbox(checkbox);
    }
  });
}

/**
 * Activates and highlights a checkbox wrapper.
 * @param {HTMLInputElement} checkbox - Target checkbox element.
 * @private
 */
function activateCheckbox(checkbox) {
  checkbox.checked = true;
  checkbox.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
}

/**
 * Creates a DOM element for a user checkbox.
 * @param {Object} user - User object.
 * @returns {HTMLElement} Wrapper DOM element.
 * @private
 */
function createUserCheckboxElement(user) {
  const wrapper = createCheckboxWrapper(user);
  attachCheckboxListener(wrapper);
  return wrapper;
}

/**
 * Creates a wrapper for a user checkbox element.
 * @param {Object} user - User object.
 * @returns {HTMLElement} The wrapper DOM element.
 * @private
 */
function createCheckboxWrapper(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper-modal";
  wrapper.innerHTML = getUserCheckboxHTML(user);
  return wrapper;
}

/**
 * Attaches a click listener to a checkbox wrapper.
 * @param {HTMLElement} wrapper - Checkbox wrapper element.
 * @private
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");
  const checkboxLabel = wrapper.getElementsByClassName("checkboxLabel");

  wrapper.addEventListener("click", (event) => {
    handleCheckboxClick(event, checkbox, wrapper, checkboxLabel);
    const name = checkbox.value;
    if (checkbox.checked) selectedUserNamesModal.add(name);
    else selectedUserNamesModal.delete(name);
    updateSelectedModal();
  });
}

function handleCheckboxClick(event, checkbox, wrapper, checkboxLabel) {
  if (event.target !== checkbox || event.target !== checkboxLabel) {
  }
  wrapper.classList.toggle("active", checkbox.checked);
  updateSelectedModal();
}
/**
 * Updates the UI to show selected users as colored chips.
 */
export function updateSelectedModal() {
  const container = document.getElementById("selectedUser-modal");
  if (!container) return;
  container.innerHTML = "";
  const users = Array.from(selectedUserNamesModal)
    .map(name => allSystemUsersModal.find(u => u.userFullName === name))
    .filter(Boolean);
  const MAX = 5;
  const showCount = users.length > MAX ? MAX - 1 : users.length;
  users.slice(0, showCount).forEach(user => {
    container.appendChild(createUserChip(user));
  });
  if (users.length > MAX) {
    container.insertAdjacentHTML("beforeend", createRemainingChip(users.length - showCount));
  }
}

/**
 * Creates a chip for the selected user.
 * @param {string} userName - Name of the user.
 * @returns {HTMLElement} The chip element.
 * @private
 */
function createUserChip(userOrName) {
  const user = typeof userOrName === "string"
    ? allSystemUsersModal.find(u => u.userFullName === userOrName)
    : userOrName;

  const fullName = user?.userFullName || String(userOrName || "");
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(fullName);
  return chip;
}

/**
 * Toggles the visibility of the user selection list and rotates the dropdown icon.
 * @param {Event} event - Click event.
 */
export function toggleUserListModal(event) {
  event.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  const assignImg = document.getElementById("assignedBtnImg-modal");

  toggleListVisibility(list, assignImg);
}

/**
 * Toggles list visibility and icon rotation.
 * @param {HTMLElement} list - The user list container.
 * @param {HTMLElement} assignImg - The icon element.
 * @private
 */
function toggleListVisibility(list, assignImg) {
  list.classList.toggle("visible");
  const backgroundElement = document.getElementById("formWrapper");
  if (backgroundElement.classList.contains("no-scroll") ) {
    backgroundElement.classList.remove("no-scroll");
  } else {
    backgroundElement.classList.add("no-scroll");
  }
  assignImg?.classList.toggle("rotated", list.classList.contains("visible"));
}

/**
 * Initializes the event listener for the user search input field.
 */
export function initUserSearchEventListener() {
  const searchInput = document.getElementById("searchUser-modal");
  if (!searchInput) return;

  searchInput.addEventListener("input", handleSearchInput);
}

/**
 * Handles input change in the user search field.
 * Filters and re-renders user checkboxes.
 * @private
 */
function handleSearchInput() {
  const searchInput = document.getElementById("searchUser-modal");
  const list = document.getElementById("assignedUserList-modal");
  if (!searchInput || !list) return;

  const term = searchInput.value.trim().toLowerCase();
  list.classList.add("visible");

  if (term.length < 1) {
    renderUserCheckboxesModal(allSystemUsersModal);
    return;
  }
  const matchedUsers = allSystemUsersModal.filter(user =>
    user.userFullName.toLowerCase().includes(term)
  );
  renderUserCheckboxesModal(matchedUsers);
}

function setupConst(containerId, toggleElementSelector, arrowSelector, inputSelector) {
    const container = document.getElementById(containerId);
    const backgroundElement = document.getElementById("formWrapper");
    const toggleElement = document.querySelector(toggleElementSelector);
    const arrow = document.querySelector(arrowSelector);
    const input = document.querySelector(inputSelector);
    return { container, backgroundElement, toggleElement, arrow, input};
} 

function setupOutsideClickToClose(containerId, toggleElementSelector, arrowSelector, inputSelector) {
  document.addEventListener("click", (event) => {
    const { container, backgroundElement, toggleElement, arrow, input} = setupConst(containerId, toggleElementSelector, arrowSelector, inputSelector);
    if (!container || !toggleElement) return;
    if (
      container.classList.contains("visible") &&
      !container.contains(event.target) &&
      !toggleElement.contains(event.target) &&
      !backgroundElement.classList.remove("no-scroll")
    ) {
      container.classList.remove("visible");
      if (arrow) arrow.classList.remove("rotated");
      if (input) {
        input.value = "";
        if ( typeof loadAndRenderUsersModal() === "function") {
          loadAndRenderUsersModal();
        }
      }
    }
  });
}