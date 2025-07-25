/**
 * User Assignment Management for Task Modal
 * Verwaltung der Benutzerzuordnungen
 */

import { loadContactsForTaskAssignment } from "../contactPage/contactService.js";
import { getUserCheckboxHTML } from "./taskfloatHTML.js";
import { getInitials } from "../scripts/utils/helpers.js";

let allSystemUsersModal = [];

/**
 * Lädt und rendert User-Daten für das Modal
 */
export async function loadAndRenderUsersModal() {
  await loadContactData();
  renderUserCheckboxesModal(allSystemUsersModal);
}

/**
 * Lädt Kontaktdaten vom Service
 */
async function loadContactData() {
  try {
    const contacts = await loadContactsForTaskAssignment();
    allSystemUsersModal = contacts || [];
  } catch (error) {
    console.error("Error loading contacts for modal:", error);
    allSystemUsersModal = [];
  }
}

/**
 * Rendert User-Checkboxen im Modal
 * @param {Array} users - Array von User-Objekten
 */
export async function renderUserCheckboxesModal(users) {
  const container = document.getElementById("assignedUserList-modal");
  if (!container) return;

  renderCheckboxList(container, users);
  handlePendingPreselection();
}

/**
 * Rendert die Checkbox-Liste
 * @param {HTMLElement} container - Container-Element
 * @param {Array} users - User-Array
 */
function renderCheckboxList(container, users) {
  container.innerHTML = "";
  users.forEach(user => {
    const checkboxElement = createUserCheckboxElement(user);
    container.appendChild(checkboxElement);
  });
}

/**
 * Behandelt ausstehende Vorauswahl
 */
function handlePendingPreselection() {
  if (window.pendingAssignedUsers) {
    applyUserPreselection(window.pendingAssignedUsers);
    window.pendingAssignedUsers = null;
  } else {
    updateSelectedModal();
  }
}

/**
 * Wendet User-Vorauswahl an
 * @param {Array} assignedUsers - Array von vorausgewählten Usern
 */
export function applyUserPreselection(assignedUsers) {
  if (!Array.isArray(assignedUsers)) return;
  
  resetAllCheckboxes();
  selectAssignedUsers(assignedUsers);
  updateSelectedModal();
}

/**
 * Setzt alle Checkboxen zurück
 */
function resetAllCheckboxes() {
  const checkboxes = document.querySelectorAll(".user-checkbox-modal");
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.closest(".user-checkbox-wrapper-modal")?.classList.remove("active");
  });
}

/**
 * Wählt zugewiesene User aus
 * @param {Array} assignedUsers - Array von User-Namen
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
 * Aktiviert eine Checkbox
 * @param {HTMLElement} checkbox - Checkbox-Element
 */
function activateCheckbox(checkbox) {
  checkbox.checked = true;
  checkbox.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
}

/**
 * Erstellt ein User-Checkbox-Element
 * @param {Object} user - User-Objekt
 * @returns {HTMLElement} Wrapper-Element
 */
function createUserCheckboxElement(user) {
  const wrapper = createCheckboxWrapper(user);
  attachCheckboxListener(wrapper);
  return wrapper;
}

/**
 * Erstellt Checkbox-Wrapper
 * @param {Object} user - User-Objekt
 * @returns {HTMLElement} Wrapper-Element
 */
function createCheckboxWrapper(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper-modal";
  wrapper.innerHTML = getUserCheckboxHTML(user);
  return wrapper;
}

/**
 * Bindet Checkbox-Event-Listener
 * @param {HTMLElement} wrapper - Wrapper-Element
 */
function attachCheckboxListener(wrapper) {
  const checkbox = wrapper.querySelector("input");
  wrapper.addEventListener("click", (event) => {
    handleCheckboxClick(event, checkbox, wrapper);
  });
}

/**
 * Behandelt Checkbox-Klick
 * @param {Event} event - Click-Event
 * @param {HTMLElement} checkbox - Checkbox-Element
 * @param {HTMLElement} wrapper - Wrapper-Element
 */
function handleCheckboxClick(event, checkbox, wrapper) {
  if (event.target !== checkbox) {
    checkbox.checked = !checkbox.checked;
  }
  wrapper.classList.toggle("active", checkbox.checked);
  updateSelectedModal();
}

/**
 * Aktualisiert die Anzeige der ausgewählten User
 */
export function updateSelectedModal() {
  const container = document.getElementById("selectedUser-modal");
  if (!container) return;

  container.innerHTML = "";
  renderSelectedChips(container);
}

/**
 * Rendert die ausgewählten User-Chips
 * @param {HTMLElement} container - Container-Element
 */
function renderSelectedChips(container) {
  const checkedBoxes = document.querySelectorAll(".user-checkbox-modal:checked");
  checkedBoxes.forEach(checkbox => {
    const chip = createUserChip(checkbox.value);
    container.appendChild(chip);
  });
}

/**
 * Erstellt einen User-Chip
 * @param {string} userName - Name des Users
 * @returns {HTMLElement} Chip-Element
 */
function createUserChip(userName) {
  const user = allSystemUsersModal.find(u => u.userFullName === userName);
  const chip = document.createElement("div");
  chip.className = `selected-contact-chip ${user?.userColor || "color-1"}`;
  chip.textContent = user?.userInitials || getInitials(userName);
  return chip;
}

/**
 * Togglet die Sichtbarkeit der User-Liste
 * @param {Event} event - Click-Event
 */
export function toggleUserListModal(event) {
  event.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  const assignImg = document.getElementById("assignedBtnImg-modal");
  
  toggleListVisibility(list, assignImg);
}

/**
 * Togglet List-Sichtbarkeit und Icon-Rotation
 * @param {HTMLElement} list - Listen-Element
 * @param {HTMLElement} assignImg - Icon-Element
 */
function toggleListVisibility(list, assignImg) {
  list.classList.toggle("visible");
  assignImg?.classList.toggle("rotated", list.classList.contains("visible"));
}

/**
 * Initialisiert User-Search Event-Listener
 */
export function initUserSearchEventListener() {
  const searchInput = document.getElementById("searchUser-modal");
  if (!searchInput) return;
  
  searchInput.addEventListener("input", handleSearchInput);
}

/**
 * Behandelt Search-Input
 */
function handleSearchInput() {
  const searchInput = document.getElementById("searchUser-modal");
  const filteredUsers = getFilteredUsers(searchInput.value);
  renderUserCheckboxesModal(filteredUsers);
}

/**
 * Filtert User nach Suchbegriff
 * @param {string} query - Suchbegriff
 * @returns {Array} Gefilterte User
 */
function getFilteredUsers(query) {
  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) return allSystemUsersModal;
  
  return allSystemUsersModal.filter(user =>
    user.userFullName.toLowerCase().includes(searchTerm)
  );
}
