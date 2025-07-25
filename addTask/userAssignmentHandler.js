/**
 * User Assignment Management for Add Task
 * Verwaltung der Benutzerzuordnungen
 */

import { getUserCheckboxTemplate } from "./addtasktemplates.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";

let allSystemUsers = [];

export function getAllSystemUsers() {
  return allSystemUsers;
}

export async function loadAndRenderUsers() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsers = contacts;
    renderUserCheckboxes(allSystemUsers);
  } catch (error) {
    console.error("Error loading contacts for add task:", error);
    allSystemUsers = [];
  }
}

export function renderUserCheckboxes(users, preselected = []) {
  const container = clearAndPrepareContainer("assignedUserList");
  if (!container) return;

  addUniqueCheckboxes(users, preselected, container);
  updateSelectedUserDisplay();
}

function clearAndPrepareContainer(id) {
  const container = document.getElementById(id);
  if (!container) return null;
  container.innerHTML = "";
  return container;
}

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

function createUserCheckboxElement(user, isChecked) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper";
  if (isChecked) wrapper.classList.add("active");

  wrapper.innerHTML = getUserCheckboxTemplate(user, isChecked);
  attachCheckboxListener(wrapper);
  return wrapper;
}

function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");

  wrapper.addEventListener("click", (e) => {
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
    wrapper.classList.toggle("active", checkbox.checked);
    updateSelectedUserDisplay();
  });
}

export function updateSelectedUserDisplay() {
  const selectedContainer = document.getElementById("selectedUser");
  if (!selectedContainer) return;
  
  selectedContainer.innerHTML = "";
  collectAssignedUsers().forEach(name => {
    const user = allSystemUsers.find(u => u.userFullName === name);
    const chip = createUserChip(user, name);
    selectedContainer.appendChild(chip);
  });
}

function createUserChip(user, name) {
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(name);
  return chip;
}

function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map(cb => cb.value);
}

export function clearSelectedUsers() {
  const selectedUserContainer = document.getElementById("selectedUser");
  if (selectedUserContainer) {
    selectedUserContainer.innerHTML = "";
  }
  
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.closest('.user-checkbox-wrapper')?.classList.remove('active');
  });
}

export function toggleUserAssignmentList(clickEvent) {
  clickEvent.preventDefault();
  const userAssignmentList = document.getElementById("assignedUserList");
  const arrowIndicator = document.getElementById("assignedBtnImg");
  const isListVisible = userAssignmentList.classList.toggle("visible");
  arrowIndicator?.classList.toggle("rotated", isListVisible);
}

export function setupUserSearch() {
  const searchBar = document.getElementById("searchUser");
  searchBar?.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    if (term.length < 3) {
      if (!term.length) renderUserCheckboxes(allSystemUsers);
      return;
    }
    document.getElementById("assignedUserList").classList.add("visible");
    renderUserCheckboxes(
      allSystemUsers.filter(u => u.userFullName.toLowerCase().includes(term))
    );
  });
}
