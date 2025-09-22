import { updateSelectedUserDisplay, clearSelectedUserNamesHandler } from "./userAssignmentHandler.js";
import { subtaskItemsList, clearValidationAlerts, closeDropdown } from "./formManager.js";

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