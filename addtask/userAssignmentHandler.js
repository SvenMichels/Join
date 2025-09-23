/**
 * User Assignment Management for Add Task
 * Handles assigning users to a task during creation.
 *
 * @module userAssignmentHandler
 */
import { getUserCheckboxTemplate } from "./addtasktemplates.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { createRemainingChip } from "../board/boardUtils.js";
import { clearSelectedUserNamesModal } from "../taskfloatdata/userAssignmentManager.js";
import { fetchContactsListForAssignment } from "../scripts/firebase.js";

let allSystemUsers = [];
const selectedUserNames = new Set();



/**
 * Returns the list of all loaded system users.
 * @description Provides access to the cached system users array
 * @returns {Array<Object>} List of users
 */
export function getAllSystemUsers() {
  return allSystemUsers;
}

/**
 * Clears the selected user names from the handler's internal set.
 * @description Removes all selected user names from the internal selection state
 * @returns {void}
 */
export function clearSelectedUserNamesHandler() {
  selectedUserNames.clear();
}

/**
 * Clears selected user names from both handler and modal contexts.
 * @description Resets user selection state in both add task handler and modal
 * @returns {void}
 */
export function clearBothSelectedUserNames() {
  clearSelectedUserNamesHandler();
  clearSelectedUserNamesModal();
}

/**
 * Loads users from backend and renders them in the checkbox list.
 * @description Fetches user data from the backend and displays checkboxes for user selection
 * @async
 * @returns {Promise<void>}
 */
export async function loadAndRenderUsers() {
  try {
    const contacts = await fetchContactsListForAssignment();
    allSystemUsers = Array.isArray(contacts) ? contacts : [];
    renderUserCheckboxes(allSystemUsers, Array.from(selectedUserNames));
  } catch (error) {
    console.error("Error loading contacts for add task:", error);
    allSystemUsers = [];
    renderUserCheckboxes(allSystemUsers, []);
  }
}

/**
 * Renders user checkboxes inside the DOM container.
 * @description Creates and displays checkbox elements for user selection
 * @param {Array<Object>} users - User data list
 * @param {Array<string>} [preselected=[]] - Optional list of preselected usernames
 * @returns {void}
 */
export function renderUserCheckboxes(users, preselected = []) {
  const container = clearAndPrepareContainer("assignedUserList");
  if (!container) return;

  addUniqueCheckboxes(users, preselected, container);
  updateSelectedUserDisplay();
}

/**
 * Clears and returns the checkbox container element.
 * @description Empties the specified container and returns it for further use
 * @param {string} id - Element ID of the container
 * @returns {HTMLElement|null} The cleared container element or null if not found
 * @private
 */
function clearAndPrepareContainer(id) {
  const container = document.getElementById(id);
  if (!container) return null;
  container.innerHTML = "";
  return container;
}

/**
 * Adds unique checkbox elements for users.
 * @description Creates checkbox elements for each unique user and adds them to the container
 * @param {Array<Object>} users - All users
 * @param {Array<string>} preSelected - Preselected users
 * @param {HTMLElement} container - Parent DOM node
 * @returns {void}
 * @private
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
 * @description Constructs a complete checkbox wrapper with event listeners for a user
 * @param {Object} user - User object
 * @param {boolean} isChecked - Whether the checkbox should be checked
 * @returns {HTMLElement} Checkbox element wrapper
 * @private
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
 * @description Attaches event handlers for checkbox interaction and wrapper clicks
 * @param {HTMLElement} wrapper - Wrapper element
 * @returns {void}
 * @private
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    wrapper.classList.toggle('active', checkbox.checked);
    const name = checkbox.value;
    if (checkbox.checked) selectedUserNames.add(name);
    else selectedUserNames.delete(name);
    updateSelectedUserDisplay();
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
 * Updates the visual display of selected user chips.
 * @description Refreshes the display of selected users as visual chips with overflow handling
 * @returns {void}
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
 * @description Generates a styled chip element representing a selected user
 * @param {Object} user - User object
 * @param {string} name - Username fallback
 * @returns {HTMLElement} Chip element
 * @private
 */
function createUserChip(user, name) {
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(name);
  return chip;
}

/**
 * Renders user chips in a container with overflow handling.
 * @description Creates visual chips for users with support for showing overflow count
 * @param {Array<Object>} users - Array of user objects to render.
 * @param {HTMLElement} container - Container element to render chips into.
 * @param {number} [maxVisible=5] - Maximum number of visible chips before showing overflow.
 * @returns {void}
 */
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
 * @description Provides access to the current selection of assigned user names
 * @returns {Array<string>} List of usernames
 */
export function collectAssignedUsers() {
  return Array.from(selectedUserNames);
}

/**
 * Clears all selected user checkboxes and chips.
 * @description Resets the entire user selection interface to its initial state
 * @returns {void}
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
 * @description Initializes event listeners for showing/hiding the user assignment dropdown
 * @returns {void}
 */
export function initUserAssignmentList() {
  const assignBtn = document.querySelector(".assignUserListBtn");
  const userAssignmentList = document.getElementById("assignedUserList");
  const arrowIndicator = document.getElementById("assignedBtnImg");

  if (!assignBtn || !userAssignmentList) return;

  assignBtn.addEventListener("click", () => {
    const isListVisible = userAssignmentList.classList.toggle("visible");
    arrowIndicator?.classList.toggle("rotated", isListVisible);
  });
}

/**
 * Sets up the user search input and filters the user list.
 * @description Initializes search functionality for filtering users in the assignment list
 * @async
 * @returns {Promise<void>}
 */
export async function setupUserSearch() {
  const searchBar = document.getElementById("searchUser");
  const listEl = document.getElementById("assignedUserList");
  const arrow = document.getElementById("assignedBtnImg");
  await loadAndRenderUsers();
  if (!searchBar || !listEl) return;
  const showAll = () => {
    const preselected = Array.from(selectedUserNames);
    listEl.classList.add("visible");
    arrow.classList.add("rotated");
    renderUserCheckboxes(allSystemUsers, preselected);
  };
  const filterList = () => {
    const term = searchBar.value.trim().toLowerCase();
    const preselected = Array.from(selectedUserNames);
    listEl.classList.add("visible");
    if (!term) {
      renderUserCheckboxes(allSystemUsers, preselected);
      return;
    }
    const matchedUsers = allSystemUsers.filter(u =>
      u.userFullName.toLowerCase().includes(term)
    );
    renderUserCheckboxes(matchedUsers, preselected);
  };
  searchBar.addEventListener("focus", showAll);
  searchBar.addEventListener("click", showAll);
  searchBar.addEventListener("input", filterList);
  renderUserCheckboxes(allSystemUsers, Array.from(selectedUserNames));
}
