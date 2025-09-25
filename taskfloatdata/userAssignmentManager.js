/**
 * @fileoverview User Assignment Management for Task Modal.
 * Handles loading, rendering, selection, and search of users to assign tasks.
 * @module userAssignmentManager
 */

import { getUserCheckboxHTML } from "./taskfloatHTML.js";
import { createRemainingChip } from "../board/boardUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { fetchContactsListForAssignment } from "../scripts/firebase.js";
import { initFormAndButtonHandlers } from "../addtask/formManagerInit.js";
import { setupUserSearch } from "../addtask/userAssignmentHandler.js";

let allSystemUsersModal = [];
const selectedUserNamesModal = new Set();

let usersLoadedOnce = false;
let searchListenersInit = false;

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderUsersModal();
  initUserSearchEventListener();
  initFormAndButtonHandlers("formWrapper");
});




/**
 * Loads and renders user checkboxes in the modal.
 * @description Always reloads contacts to ensure current user's data is displayed and handles preselected users
 * @param {Array<string>} [preselected=[]] - Array of preselected user names
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsersModal(preselected = []) {
  if (!usersLoadedOnce) {
    await loadContactData();
  }
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
 * @description Fetches contacts from the backend and populates the global user array
 * @returns {Promise<void>}
 * @private
 */
export async function loadContactData() {
  try {
    const contacts = await fetchContactsListForAssignment();
    allSystemUsersModal = Array.isArray(contacts) ? contacts : [];
    usersLoadedOnce = true;
  } catch (error) {
    console.error("Error loading contacts for add task:", error);
    allSystemUsersModal = [];
  }
}

/**
 * Clears all selected user names from the modal and resets the UI state.
 * Removes all chips and unchecks all checkboxes.
 * @description Resets the user selection state in the modal
 * @returns {void}
 */
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
 * @description Creates and displays checkbox elements for user selection in the modal
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
 * @description Creates and appends checkbox elements for each user in the container
 * @param {HTMLElement} container - Target DOM container.
 * @param {Array<Object>} users - List of users to render.
 * @returns {void}
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
 * @description Clears current selection and applies the provided user names as selected
 * @param {Array<string>} assignedUsers - User names to select.
 * @returns {void}
 */
export function applyUserPreselection(assignedUsers) {
  if (!Array.isArray(assignedUsers)) return;

  selectedUserNamesModal.clear();
  assignedUsers.forEach(n => selectedUserNamesModal.add(n));
  renderUserCheckboxesModal(allSystemUsersModal);
}

/**
 * Selects the checkboxes for the given user names.
 * @description Finds and activates checkboxes for the specified user names
 * @param {Array<string>} assignedUsers - Array of user names to select.
 * @returns {void}
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
 * @description Sets checkbox as checked and adds active styling to wrapper
 * @param {HTMLInputElement} checkbox - Target checkbox element.
 * @returns {void}
 * @private
 */
function activateCheckbox(checkbox) {
  checkbox.checked = true;
  checkbox.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
}

/**
 * Creates a DOM element for a user checkbox.
 * @description Constructs a complete checkbox wrapper element with event listeners
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
 * @description Generates the HTML wrapper containing the user checkbox
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
 * @description Sets up event handlers for checkbox interaction and wrapper clicks
 * @param {HTMLElement} wrapper - Checkbox wrapper element.
 * @returns {void}
 * @private
 */
function attachCheckboxListener(wrapper) {

  const checkbox = wrapper.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    wrapper.classList.toggle('active', checkbox.checked);
    const name = checkbox.value;
    if (checkbox.checked) selectedUserNamesModal.add(name);
    else selectedUserNamesModal.delete(name);
    updateSelectedModal();
  });
  wrapper.addEventListener('click', (e) => {
    if (e.target === checkbox) return;
    const label = e.target.closest('label');
    if (label && (label.contains(checkbox) ||
      (label.htmlFor && checkbox.id && label.htmlFor === checkbox.id))) {
      return;
    }
    checkbox.click();
  });
}

/**
 * Updates the UI to show selected users as colored chips.
 * @description Refreshes the display of selected users as visual chips with overflow handling
 * @returns {void}
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
 * @description Generates a visual chip element representing a selected user
 * @param {string|Object} userOrName - Name of the user or user object.
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

function setAssignedListState(list, isVisible) {
  if (!list) return;
  const assignImg = document.getElementById("assignedBtnImg-modal");
  const backgroundElement = document.getElementById("formWrapper");
  list.classList.toggle("visible", isVisible);
  assignImg?.classList.toggle("rotated", isVisible);
  backgroundElement?.classList.toggle("no-scroll", isVisible);
  toggleExpender(list, isVisible);
}

function toggleExpender(list, isVisibleOverride) {
  const required = document.querySelector(".required-container-modal");
  if (!required) return;
  const shouldHideButtons =
    typeof isVisibleOverride === "boolean"
      ? isVisibleOverride
      : list
        ? list.classList.contains("visible")
        : true;
  // required.classList.toggle("d-none", shouldHideButtons);
  // required.classList.toggle("expender-container-assigned", shouldHideButtons);
}

export function toggleUserListModal(event) {
  event.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  const shouldOpen = !list?.classList.contains("visible");
  setAssignedListState(list, shouldOpen);
}

export function initUserSearchEventListener() {
  if (searchListenersInit) return;
  const searchInput = document.getElementById("searchUser-modal");
  if (!searchInput) return;
  const handleInputFocus = () => {
    const listEl = document.getElementById("assignedUserList-modal");
    setAssignedListState(listEl, true);
    loadAndRenderUsersModal();
  };
  searchInput.addEventListener("focus", handleInputFocus);
  searchInput.addEventListener("click", handleInputFocus);
  searchInput.addEventListener("input", handleSearchInput);
  searchListenersInit = true;
}

export async function handleSearchInput(e) {
  const searchBar = e?.target ?? document.getElementById("searchUser-modal");
  const listEl = document.getElementById("assignedUserList-modal");
  setAssignedListState(listEl, true);
  await loadAndRenderUsersModal();
  if (!searchBar || !listEl) return;
  const term = (searchBar.value || "").trim().toLowerCase();
  const preselected = Array.from(selectedUserNamesModal);
  if (!term) {
    renderUserCheckboxesModal(allSystemUsersModal, preselected);
    return;
  }
  const matchedUsers = allSystemUsersModal.filter(u =>
    u.userFullName.toLowerCase().includes(term)
  );
  renderUserCheckboxesModal(matchedUsers, preselected);
}