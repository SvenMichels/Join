import { updateSelectedUserDisplay, clearSelectedUserNamesHandler } from "./userAssignmentHandler.js";
import { subtaskItemsList, clearValidationAlerts, closeDropdown } from "./formManager.js";

/**
 * Resets the visual state of all priority buttons to the default (medium active).
 * Updates button classes and icon sources accordingly.
 * @returns {void}
 */
export function resetPriorityButtonsUI() {
  const lowBtn = document.querySelector('#low-task') || document.querySelector('#low-task-modal');
  lowBtn?.classList.remove("prioLowBtnActive");
  const lowBtnImg = document.getElementById("low-task-img") || document.getElementById("low-task-img-modal");
  lowBtnImg.src = "../assets/icons/low_green.svg";
  const urgentBtn = document.querySelector('#urgent-task') || document.querySelector('#urgent-task-modal');
  urgentBtn?.classList.remove("prioUrgentBtnActive");
  const urgentBtnImg = document.getElementById("urgent-task-img") || document.getElementById("urgent-task-img-modal");
  urgentBtnImg.src = "../assets/icons/urgent_red.svg";
  const mediumBtn = document.querySelector('#medium-task') || document.querySelector('#medium-task-modal');
  mediumBtn?.classList.add("prioMediumBtnActive");
  const mediumBtnImg = document.getElementById("medium-task-img") || document.getElementById("medium-task-img-modal");
  mediumBtnImg.src = "../assets/icons/medium_white.svg";
}

/**
 * Clears the entire add-task form state (category, title, date, priority, users, subtasks, validation).
 * Also closes any open dropdowns.
 * @param {HTMLElement} wrapper - Wrapper element of the dropdown/select area.
 * @param {HTMLElement} select - The category select display element.
 * @param {HTMLElement} options - The category options dropdown element.
 * @param {HTMLInputElement} titleInput - Title input field.
 * @param {HTMLInputElement} dateInput - Date input field.
 * @param {HTMLElement} arrow - Arrow element controlling dropdown rotation.
 * @returns {void}
 */
export function clearFormState(wrapper, select, options, titleInput, dateInput, arrow) {
  if (select) {
    select.textContent = "Select a category";
    select.dataset.selected = "";
  }
  if (wrapper) wrapper.classList.remove("expanded");
  if (options) options.classList.remove("open", "visible");
  if (titleInput) titleInput.value = "";
  if (dateInput) dateInput.value = "";
  resetPriorityButtonsUI();
  resetAssignedUsers();
  resetSubtasksUI();
  clearValidationAlerts();
  closeDropdown(options, wrapper, arrow);
}

/**
 * Resets all assigned user selections (checkboxes, chips and internal name set).
 * Hides modal assigned user list if visible.
 * @returns {void}
 */
export function resetAssignedUsers() {
  const checked = document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked");
  checked.forEach(cb => { cb.checked = false; });
  if (window.selectedUserNames) {
    window.selectedUserNames.clear();
  }
  const chipContainer = document.getElementById("selectedUser");
  if (chipContainer) chipContainer.innerHTML = "";
  updateSelectedUserDisplay?.();
  clearSelectedUserNamesHandler();
  const clearAssignedListContainer = document.getElementById("assignedUserList-modal");
  clearAssignedListContainer?.classList.remove("visible");

}

/**
 * Clears the subtask input field and visual list and empties the in-memory subtask list.
 * Uses setSubtaskItems if available, falls back to mutating subtaskItemsList.
 * @returns {void}
 */
export function resetSubtasksUI() {
  if (typeof setSubtaskItems === "function") setSubtaskItems([]);
  else if (Array.isArray(subtaskItemsList)) subtaskItemsList.length = 0;
  const input = document.getElementById("subtaskInput")
    || document.getElementById("subtask-input");
  if (input) input.value = "";
  const list =
    document.getElementById("subtaskList")
    || document.getElementById("subtaskList-modal");
  if (list) list.innerHTML = "";
}

/**
 * (Duplicate helper) Collects and returns all form data in a structured object.
 * NOTE: This function appears duplicated from formManager.js; consider consolidating.
 * @param {HTMLFormElement} form - The form element to extract data from.
 * @returns {Object} Task data object including title, description, due date, category, priority, users and subtasks.
 */
export function collectTaskData(form) {
  const id = form.getAttribute("data-task-id");
  const title = form.taskTitle.value.trim();
  const description = form.taskDescription.value.trim();
  const dueDate = form.taskDate.value;
  const categoryElement = document.getElementById("categorySelect").innerHTML;
  const category = categorySave(categoryElement);
  const prio = currentlySelectedPriority;
  const assignedUsers = collectAssignedUsers();
  const subtasks = [...subtaskItemsList];
  const subtaskDone = Array(subtaskItemsList.length).fill(false);

  return {
    ...(id && { id }),
    title,
    description,
    dueDate,
    category,
    prio,
    assignedUsers,
    subtasks,
    subtaskDone,
    status: "todo",
  };
}