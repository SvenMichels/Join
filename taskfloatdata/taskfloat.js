import { requestData } from "../scripts/firebase.js";
import { ensureUserHasAssignedColor } from "../scripts/utils/colors.js";
import {
  getSubtaskHTML,
  getEditableSubtaskTemplate,
  getUserCheckboxHTML,
} from "./taskfloatHTML.js";
import { getInitials } from "../scripts/utils/helpers.js";

export const PRIORITY_ICONS = {
  urgent: [
    "../assets/icons/urgent_red.svg",
    "../assets/icons/urgent_white.svg",
  ],
  medium: [
    "../assets/icons/medium_yellow.svg",
    "../assets/icons/medium_white.svg",
  ],
  low: ["../assets/icons/low_green.svg", "../assets/icons/low_white.svg"],
};

const PRIORITY_CONFIG = {
  urgent: {
    id: "urgent-task-modal",
    icon: PRIORITY_ICONS.urgent,
    className: "prioUrgentBtnActive",
  },
  medium: {
    id: "medium-task-modal",
    icon: PRIORITY_ICONS.medium,
    className: "prioMediumBtnActive",
  },
  low: {
    id: "low-task-modal",
    icon: PRIORITY_ICONS.low,
    className: "prioLowBtnActive",
  },
};

const PRIORITY_CLASSES = [
  "prioUrgentBtnActive",
  "prioMediumBtnActive",
  "prioLowBtnActive",
];

const SUBTASK_SELECTORS = [
  ".subtask-edit-button-modal",
  ".subtask-delete-button-second-modal",
  ".subtask-save-button-modal",
  ".subtask-delete-button-modal",
  ".subtask-text-input-modal",
];

const $ = {};
let currentlySelectedPriorityModal = "medium";
let allSystemUsersModal = [];
let subtaskItemsListModal = [];
export let completedSubtasksModal = [];
let pendingTaskUpdateQueue = {};

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string") return val.split(",").map((s) => s.trim());
  return [];
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getPriorityClass(prio) {
  return `prio${capitalize(prio)}BtnActive`;
}

function getPriorityClasses() {
  return PRIORITY_CLASSES;
}

function getChecked(selector) {
  return [...document.querySelectorAll(selector + ":checked")].map(
    (c) => c.value
  );
}

function getSubtaskInputValue() {
  return $.subInput.value.trim();
}

function clearSubtaskInput() {
  $.subInput.value = "";
}

function getFilteredUsers(query) {
  const filteredQuery = query.trim().toLowerCase();
  return !filteredQuery
    ? allSystemUsersModal
    : allSystemUsersModal.filter((u) =>
        u.userName.toLowerCase().includes(filteredQuery)
      );
}

export function initTaskFloat() {
  cacheDom();
  if (!$.modal) return Promise.resolve();

  loadUserInitialsModal();
  eventHandleSearchModal();

  return initFormModal();
}

function cacheDom() {
  $.modal = document.querySelector(".form-wrapper-modal");
  if (!$.modal) return;

  $.closeBtn = $.modal?.querySelector(".task-h1-container-modal button");
  $.form = document.getElementById("taskForm-modal");
  $.date = document.getElementById("task-date-modal");
  $.subInput = document.getElementById("subtask-modal");
  $.subAddBtn = $.modal?.querySelector(".subtask-add-button-modal");
  $.assignBtn = $.modal?.querySelector(".assigned-userlist-button-modal");
  $.assignImg = document.getElementById("assignedBtnImg-modal");

  if ($.date) {
    $.date.min = new Date().toISOString().split("T")[0];
  }

  attachEventListeners();
}

function attachEventListeners() {
  $.closeBtn?.addEventListener("click", closeModal);
  $.form?.addEventListener("submit", handleSubmitModal);
  $.subAddBtn?.addEventListener("click", addSubtaskModal);
  $.subInput?.addEventListener("keydown", addSubtaskOnEnterModal);
  $.assignBtn?.addEventListener("click", toggleUserListModal);
}

export async function initFormModal() {
  await loadAndRenderUsersModal();
  selectPriorityModal("medium");

  const category = document.getElementById("category-modal");
  const submit = $.form?.querySelector(".create-button");
  const toggle = () => (submit.disabled = category.value.trim() === "");
  toggle();
  category.addEventListener("change", toggle);

  ["urgent", "medium", "low"].forEach((p) =>
    document
      .getElementById(`${p}-task-modal`)
      ?.addEventListener("click", () => selectPriorityModal(p))
  );
}

function selectPriorityModal(priorityLevel) {
  currentlySelectedPriorityModal = priorityLevel;

  const priorityConfigEntries = Object.values(PRIORITY_CONFIG);
  for (let configIndex = 0; configIndex < priorityConfigEntries.length; configIndex++) {
    const { id, icon, className } = priorityConfigEntries[configIndex];
    const priorityElement = document.getElementById(id);
    if (priorityElement) {
      priorityElement.classList.remove(...getPriorityClasses());
    }
    const imageElement = document.getElementById(
      `${id.replace("-task-modal", "")}-task-img-modal`
    );
    if (imageElement) imageElement.src = icon[0];
  }

  const { id, icon, className: activeClass } = PRIORITY_CONFIG[priorityLevel];
  const activePriorityElement = document.getElementById(id);
  if (activePriorityElement) {
    activePriorityElement.classList.add(activeClass);
  }
  const activeImageElement = document.getElementById(
    `${id.replace("-task-modal", "")}-task-img-modal`
  );
  if (activeImageElement) activeImageElement.src = icon[1];
}

async function handleSubmitModal(event) {
  event.preventDefault();
  const task = collectTaskDataModal(event.target);
  if (!validateTaskModal(task)) return;
  await saveTaskModal(task);
  resetFormState(task);
}

function collectTaskDataModal(form) {
  const id = form.dataset.taskId || Date.now();
  const status = form.dataset.taskStatus || "todo";

  const task = {
    id,
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentlySelectedPriorityModal,
    assigned: getChecked(".user-checkbox-modal"),
    subtasks: [...subtaskItemsListModal],
    subtaskDone: [...completedSubtasksModal],
    status,
  };

  return task;
}

function validateTaskModal(task) {
  let valid = true;
  const show = (id, condition) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.display = condition ? "inline" : "none";
    if (condition) valid = false;
  };

  show("titleAlert-modal", !task.title);
  show("dateAlert-modal", !task.dueDate);
  show("categoryAlert-modal", !task.category);

  return valid;
}

const saveTaskModal = (task) => requestData("PUT", `/tasks/${task.id}`, task);

function resetFormState(task) {
  $.form.removeAttribute("data-task-id");
  $.form.removeAttribute("data-task-status");

  const eventType = window.isEditMode ? "taskUpdated" : "taskCreated";
  window.dispatchEvent(new CustomEvent(eventType, { detail: task }));

  window.editingTaskId = null;
  window.isEditMode = false;
  subtaskItemsListModal = [];
  completedSubtasksModal = [];
  $.form.reset();
  selectPriorityModal("medium");
  closeModal();
}

function prefillModalWithTaskData(task) {
  fillBasicFields(task);
  updateUserCheckboxes(task.assigned);
  updateSubtasks(task.subtasks, task.subtaskDone);
  renderSubtasksModal();
}

function fillBasicFields(task) {
  document.getElementById("task-title-modal").value = task.title || "";
  document.getElementById("task-description-modal").value =
    task.description || "";
  document.getElementById("task-date-modal").value = task.dueDate || "";
  document.getElementById("category-modal").value = task.category || "";
  selectPriorityModal((task.prio || "medium").toLowerCase());
}

function updateSubtasks(subtasks = [], subtaskDone = []) {
  const fallbackDone = new Array(subtasks.length).fill(false);
  subtaskItemsListModal = [...subtasks];
  completedSubtasksModal = [
    ...(subtaskDone.length === subtasks.length ? subtaskDone : fallbackDone),
  ];
}

async function loadAndRenderUsersModal() {
  const { data = {} } = await requestData("GET", "/users");
  const listObj = data && typeof data === "object" ? data : {};

  allSystemUsersModal = Object.entries(listObj).map(([id, u]) => ({ id, ...u }));

  if (allSystemUsersModal.length === 0) {
    const me = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (me.userName)
      allSystemUsersModal.push({ id: me.id || "me", userName: me.userName });
  }

  renderUserCheckboxesModal(allSystemUsersModal);
}

async function renderUserCheckboxesModal(users) {
  const container = document.getElementById("assignedUserList-modal");
  if (!container) return;

  container.innerHTML = "";
  const seen = new Set();

  for (let user of users) {
    user = await ensureUserHasAssignedColor(user);
    if (seen.has(user.userName)) continue;
    seen.add(user.userName);

    const checkboxEl = buildUserCheckboxElement(user);
    container.appendChild(checkboxEl);
  }

  updateSelectedModal();
}

function buildUserCheckboxElement(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-checkbox-wrapper-modal";

  wrapper.innerHTML = getUserCheckboxHTML(user);
  const checkbox = wrapper.querySelector("input");

  wrapper.addEventListener("click", (ev) => {
    if (ev.target !== checkbox) checkbox.checked = !checkbox.checked;
    wrapper.classList.toggle("active", checkbox.checked);
    updateSelectedModal();
  });

  return wrapper;
}

function updateUserCheckboxes(assignedUsers) {
  const checkboxes = document.querySelectorAll(".user-checkbox-modal");
  checkboxes.forEach((cb) => {
    cb.checked = false;
    cb.closest(".user-checkbox-wrapper-modal")?.classList.remove("active");
  });

  toArray(assignedUsers).forEach((name) => {
    const cb = [...checkboxes].find((c) => c.value === name);
    if (cb) {
      cb.checked = true;
      cb.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
    }
  });

  updateSelectedModal();
}

function updateSelectedModal() {
  const tgt = document.getElementById("selectedUser-modal");
  if (!tgt) return;

  tgt.innerHTML = "";
  const checkedUserNames = getChecked(".user-checkbox-modal");
  for (let userIndex = 0; userIndex < checkedUserNames.length; userIndex++) {
    const userName = checkedUserNames[userIndex];
    const user = allSystemUsersModal.find((u) => u.userName === userName);
    tgt.insertAdjacentHTML(
      "beforeend",
      `<div class="selected-contact-chip ${
        user?.colorClass || "color-1"
      }">${getInitials(userName)}</div>`
    );
  }
}

function toggleUserListModal(event) {
  event.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  list.classList.toggle("visible");
  $.assignImg?.classList.toggle("rotated", list.classList.contains("visible"));
}

function loadUserInitialsModal() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const btn = $.modal?.querySelector(".profile-button-modal");
  if (btn && user.userName) btn.textContent = getInitials(user.userName);
}

function eventHandleSearchModal() {
  const input = document.getElementById("searchUser-modal");
  input?.addEventListener("input", () => {
    const filtered = getFilteredUsers(input.value);
    renderUserCheckboxesModal(filtered);
  });
}

function addSubtaskModal(event) {
  event.preventDefault();
  const value = getSubtaskInputValue();
  if (!value) return;

  addSubtask(value);
  clearSubtaskInput();
  renderSubtasksModal();
}

function addSubtask(value) {
  subtaskItemsListModal.push(value);
  completedSubtasksModal.push(false);
}

function addSubtaskOnEnterModal(ev) {
  if (ev.key === "Enter") {
    ev.preventDefault();
    addSubtaskModal(ev);
  }
}

function renderSubtasksModal() {
  const list = document.getElementById("subtaskList-modal");
  if (!list) return;

  list.innerHTML = "";
  for (let index = 0; index < subtaskItemsListModal.length; index++) {
    const text = subtaskItemsListModal[index];
    list.insertAdjacentHTML("beforeend", getSubtaskHTML(text, index));
  }

  addSubtaskEventListeners(list);
}

function addSubtaskEventListeners(list) {
  addDeleteListeners(list);
  addEditListeners(list);
  addCheckboxListeners(list);
}

function addDeleteListeners(list) {
  list.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const i = +btn.dataset.del;
      subtaskItemsListModal.splice(i, 1);
      completedSubtasksModal.splice(i, 1);
      renderSubtasksModal();
    })
  );
}

function addEditListeners(list) {
  list
    .querySelectorAll("[data-edit]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        makeSubtaskEditableModal(+btn.dataset.edit)
      )
    );
}

function addCheckboxListeners(list) {
  list.querySelectorAll(".subtask-checkbox-modal").forEach((cb) =>
    cb.addEventListener("change", (e) => {
      const i = +e.target.dataset.index;
      completedSubtasksModal[i] = e.target.checked;
    })
  );
}

function makeSubtaskEditableModal(index) {
  const item = document.getElementById("subtaskList-modal")?.children[index];
  if (!item) return;

  item.innerHTML = getEditableSubtaskTemplate(subtaskItemsListModal[index]);
  attachSubtaskEditListeners(item, index);
}

function attachSubtaskEditListeners(container, index) {
  const input = container.querySelector("input");
  const saveBtn = container.querySelector("[data-save]");
  const deleteBtn = container.querySelector("[data-del]");

  saveBtn?.addEventListener("click", () => {
    subtaskItemsListModal[index] = input.value.trim();
    renderSubtasksModal();
  });

  deleteBtn?.addEventListener("click", () => {
    subtaskItemsListModal.splice(index, 1);
    completedSubtasksModal.splice(index, 1);
    renderSubtasksModal();
  });
}

function closeModal() {
  const modal = document.getElementById("taskDetailModal");
  const overlay = document.getElementById("modal-overlay");
  if (modal?.close) modal.close();
  if (overlay) {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  }
}

function closeModals(detailModal, formModal, overlay) {
  if (detailModal?.open && typeof detailModal.close === "function") {
    detailModal.close();
  }

  if (formModal) formModal.style.display = "none";

  if (overlay) {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  }

  window.isEditMode = false;
  window.editingTaskId = null;
}

function resetModalFormState() {
  const form = document.getElementById("taskForm");
  if (!form) return;

  form.reset();
  form.removeAttribute("data-task-id");
  form.removeAttribute("data-task-status");

  subtaskItemsListModal = [];
  completedSubtasksModal = [];
}

function handleGlobalClick(event) {
  if (clickedOnSubtaskControl(event)) return;

  const detailModal = document.getElementById("taskDetailModal");
  const formModal = document.querySelector(".form-wrapper-modal");
  const overlay = document.getElementById("modal-overlay");

  const clickedOutsideDetail =
    detailModal?.open &&
    !detailModal.contains(event.target) &&
    !event.composedPath().includes(detailModal);

  const clickedOutsideForm =
    formModal &&
    getComputedStyle(formModal).display !== "none" &&
    !formModal.contains(event.target);

  if (clickedOutsideDetail || clickedOutsideForm) {
    closeModals(detailModal, formModal, overlay);
    resetModalFormState();
  }
}

function clickedOnSubtaskControl(event) {
  return SUBTASK_SELECTORS.some((selector) => event.target.closest(selector));
}

async function handleSubtaskCheckboxChange(e) {
  if (!e.target.classList.contains("modal-subtask-checkbox")) return;

  const index = parseInt(e.target.dataset.index);
  const taskId = e.target.dataset.taskId;
  const checked = e.target.checked;

  if (!taskId || isNaN(index)) return;

  if (!pendingTaskUpdates[taskId]) {
    const { data: task } = await requestData("GET", `/tasks/${taskId}`);
    task.subtaskDone =
      task.subtaskDone || new Array(task.subtasks.length).fill(false);
    pendingTaskUpdates[taskId] = task;
  }
  pendingTaskUpdates[taskId].subtaskDone[index] = checked;
}

async function handleModalClose() {
  for (const [taskId, updatedTask] of Object.entries(pendingTaskUpdates)) {
    await requestData("PATCH", `/tasks/${taskId}`, {
      subtaskDone: updatedTask.subtaskDone,
    });
  }
  pendingTaskUpdates = {};

  if (typeof window.renderBoard === "function") {
    window.renderBoard();
  } else {
    location.reload();
  }
}

// ==================== INITIALIZATION AND EVENT SETUP ====================

document.addEventListener("DOMContentLoaded", initTaskFloat);
document.addEventListener("change", handleSubtaskCheckboxChange);
document.addEventListener("click", handleGlobalClick);

const modal = document.getElementById("taskDetailModal");
if (modal) {
  modal.addEventListener("close", handleModalClose);
}

// ==================== WINDOW EXPORTS ====================
// Diese Exports müssen sofort verfügbar sein, nicht erst bei DOMContentLoaded

window.initTaskFloat = initTaskFloat;
window.selectPriorityModal = selectPriorityModal;
window.updateSelectedModal = updateSelectedModal;
window.renderSubtasksModal = renderSubtasksModal;
window.prefillModalWithTaskData = prefillModalWithTaskData;
window.editingTaskId = null;
window.isEditMode = false;

window.setSubtaskState = (arr) => {
  subtaskItemsListModal = [...arr];
};

window.getSubtaskState = () => subtasksModal;

// Make global state accessible for debugging
window.subtaskItemsListModal = subtaskItemsListModal;
window.completedSubtasksModal = completedSubtasksModal;
