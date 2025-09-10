/**
 * User Assignment Management for Add Task
 * Handles assigning users to a task during creation.
 *
 * @module userAssignmentHandler
 */

import { getUserCheckboxTemplate } from "./addtasktemplates.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { createRemainingChip } from "../board/boardUtils.js";
import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";
import { clearSelectedUserNamesModal } from "../taskFloatData/userAssignmentManager.js";

let allSystemUsers = [];
const selectedUserNames = new Set();

setupOutsideClickToClose(
  "assignedUserList",
  ".assigned-input-wrapper", 
  "#assignedBtnImg", 
  "#searchUser",
   () => renderAllUsers()
);

/**
 * Returns the list of all loaded system users.
 *
 * @returns {Array<Object>} List of users
 */
export function getAllSystemUsers() {
  return allSystemUsers;
}

export function clearSelectedUserNamesHandler() {
  selectedUserNames.clear();
}

export function clearBothSelectedUserNames() {
  clearSelectedUserNamesHandler();
  clearSelectedUserNamesModal();
}
/**
 * Loads users from backend and renders them in the checkbox list.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsers() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsers = contacts;
    renderUserCheckboxes(allSystemUsers, Array.from(selectedUserNames));
  } catch (error) {
    console.error("Error loading contacts for add task:", error);
    allSystemUsers = [];
  }
}

/**
 * Renders user checkboxes inside the DOM container.
 *
 * @param {Array<Object>} users - User data list
 * @param {Array<string>} [preselected=[]] - Optional list of preselected usernames
 */
export function renderUserCheckboxes(users, preselected = []) {
  const container = clearAndPrepareContainer("assignedUserList");
  if (!container) return;

  addUniqueCheckboxes(users, preselected, container);
  updateSelectedUserDisplay();
}

/**
 * Clears and returns the checkbox container element.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function clearAndPrepareContainer(id) {
  const container = document.getElementById(id);
  if (!container) return null;
  container.innerHTML = "";
  return container;
}

/**
 * Adds unique checkbox elements for users.
 *
 * @param {Array<Object>} users - All users
 * @param {Array<string>} preSelected - Preselected users
 * @param {HTMLElement} container - Parent DOM node
 */
function addUniqueCheckboxes(users, preSelected, container) {
  const uniqueNames = new Set();

  users.forEach(user => {
    if (uniqueNames.has(user.userFullName)) return;
    uniqueNames.add(user.userFullName);

    const isChecked = preSelected.includes(user.userFullName);
    const checkboxElement = createUserCheckboxElement(user, isChecked);
    container.appendChild(checkboxElement);
  });
}

/**
 * Creates a checkbox HTML element for a user.
 *
 * @param {Object} user - User object
 * @param {boolean} isChecked - Whether the checkbox should be checked
 * @returns {HTMLElement} Checkbox element wrapper
 */
function createUserCheckboxElement(user, isChecked) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper";
  if (isChecked) wrapper.classList.add("active");

  wrapper.innerHTML = getUserCheckboxTemplate(user, isChecked);
  attachCheckboxListener(wrapper);
  return wrapper;
}

/**
 * Adds click listener to checkbox wrapper.
 *
 * @param {HTMLElement} wrapper - Wrapper element
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");
  wrapper.addEventListener("click", (e) => {
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
    wrapper.classList.toggle("active", checkbox.checked);
    const userName = checkbox.value;
    if (checkbox.checked) {
      selectedUserNames.add(userName);
    } else {
      selectedUserNames.delete(userName);
    }
    document.getElementById("assignedUserList")?.classList.add("visible");
    updateSelectedUserDisplay();
  });
}

/**
 * Updates the visual display of selected user chips.
 */

export function updateSelectedUserDisplay() {
  const container = document.getElementById("selectedUser");
  if (!container) return;

  container.innerHTML = "";
  const users = [...selectedUserNames]
    .map(name => allSystemUsers.find(u => u.userFullName === name))
    .filter(Boolean);

  const maxVisible = 6;
  const visible = users.slice(0, maxVisible - 1);
  const overflow = users.length - (maxVisible - 1);

  visible.forEach(u => container.appendChild(createUserChip(u, u.userFullName)));
  if (overflow > 0) container.insertAdjacentHTML("beforeend", createRemainingChip(overflow));
}

/**
 * Creates a visual chip element for a user.
 *
 * @param {Object} user - User object
 * @param {string} name - Username fallback
 * @returns {HTMLElement} Chip element
 */

function createUserChip(user, name) {
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(name);
  return chip;
}

export function renderUserChips(users, container, maxVisible = 5) {
  if (!Array.isArray(users) || !container) return;
  container.innerHTML = "";
  const visibleUsers = users.length > maxVisible
    ? users.slice(0, maxVisible - 1)
    : users;
  visibleUsers.forEach(user => {
    container.appendChild(createUserChip(user, user?.name));
  });
  if (users.length > maxVisible) {
    const remainingCount = users.length - (maxVisible - 1);
    container.insertAdjacentHTML("beforeend", createRemainingChip(remainingCount));
  }
}

/**
 * Returns a list of currently assigned users.
 *
 * @returns {Array<string>} List of usernames
 */
export function collectAssignedUsers() {
  return Array.from(selectedUserNames);
}

/**
 * Clears all selected user checkboxes and chips.
 */
export function clearSelectedUsers() {
  const selectedUserContainer = document.getElementById("selectedUser");
  if (selectedUserContainer) {
    selectedUserContainer.innerHTML = "";
    clearBothSelectedUserNames();
  }
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.closest('.user-checkbox-wrapper')?.classList.remove('active');
  });
}

/**
 * Toggles the visibility of the user assignment list.
 *
 * @param {Event} clickEvent - Button click event
 */
export function toggleUserAssignmentList(clickEvent) {
  clickEvent.preventDefault();
  const userAssignmentList = document.getElementById("assignedUserList");
  const arrowIndicator = document.getElementById("assignedBtnImg");
  const isListVisible = userAssignmentList.classList.toggle("visible");
  arrowIndicator?.classList.toggle("rotated", isListVisible);
}

/**
 * Sets up the user search input and filters the user list.
 */
export async function setupUserSearch() {
  const searchBar = document.getElementById("searchUser");
  const listEl = document.getElementById("assignedUserList");
  if (!searchBar || !listEl) return;
  searchBar.addEventListener("input", () => {
    const term = searchBar.value.trim().toLowerCase();
    const preselected = Array.from(selectedUserNames);
    if (term.length < 1) {
      renderUserCheckboxes(allSystemUsers, preselected);
      return;
    }
    listEl.classList.add("visible");
    const matchedUsers = allSystemUsers.filter(u =>
      u.userFullName.toLowerCase().includes(term)
    );
    renderUserCheckboxes(matchedUsers, preselected);
  });
}

function setupOutsideClickToClose(containerId, toggleElementSelector, arrowSelector, inputSelector) {
  document.addEventListener("click", (event) => {
    const container = document.getElementById(containerId);
    const toggleElement = document.querySelector(toggleElementSelector);
    const arrow = document.querySelector(arrowSelector);
    const input = document.querySelector(inputSelector);
    if (!container || !toggleElement) return;
    if (
      container.classList.contains("visible") &&
      !container.contains(event.target) &&
      !toggleElement.contains(event.target)
    ) {
      container.classList.remove("visible");
      if (arrow) arrow.classList.remove("rotated");
      if (input) {
        input.value = "";
        if ( typeof loadAndRenderUsers() === "function") {
          loadAndRenderUsers();
        }
      }
    }
  });
}