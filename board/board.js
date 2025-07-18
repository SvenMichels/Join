import { requestData } from "../scripts/firebase.js";
import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveLinks } from "../scripts/utils/navUtils.js";

const statusMap = {
  todo: "todoList",
  "in-progress": "inProgressList",
  await: "awaitList",
  done: "doneList",
};

const priorityIcons = {
  urgent: "../assets/icons/urgent_red.svg",
  medium: "../assets/icons/medium_yellow.svg",
  low: "../assets/icons/low_green.svg",
};

window.editingTaskId = null;
window.isEditMode = false;
let loadedTasks = {};
let allUsers = [];

const categoryIcons = {
  User_Story: "propertyuserstory.svg",
  Technical_Task: "propertytechnicaltask.svg",
};

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string") return val.split(",").map((s) => s.trim());
  return [];
}

function getCategoryIcon(category) {
  return `../assets/icons/${categoryIcons[category] || "defaulticon.svg"}`;
}

async function deleteTask(id) {
  await requestData("DELETE", `/tasks/${id}`);
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("add-task-btn", "add-task-board-button")
    .addEventListener("click", openTaskModal);
  window.addEventListener("taskCreated", fetchTasks);
  window.addEventListener("taskUpdated", fetchTasks);
  setupDropdown("#openMenu", "#dropDownMenu");
  fetchTasks();
  setupDragAndDrop();
  loadUserInitials();
});

async function fetchTasks() {
  try {
    const [tasks, users] = await fetchTasksAndUsers();
    allUsers = extractUsers(users);
    loadedTasks = normalizeTasks(tasks);
    await renderTasks(Object.values(loadedTasks));
    updateEmptyLists();
  } catch (warning) {
    handleTaskFetchError(warning);
  }
}

async function fetchTasksAndUsers() {
  return Promise.all([
    requestData("GET", "/tasks/"),
    requestData("GET", "/users"),
  ]);
}

function extractUsers(userResponse) {
  return Object.values(userResponse?.data || {});
}

function normalizeTasks(taskResponse) {
  const tasks = {};
  const taskData = taskResponse?.data || {};

  for (const [id, task] of Object.entries(taskData)) {
    tasks[id] = prepareTask(id, task);
  }

  return tasks;
}

function prepareTask(id, task) {
  const subtaskCount = task.subtasks?.length || 0;
  const isValidArray = Array.isArray(task.subtaskDone);
  const lengthMatches = task.subtaskDone?.length === subtaskCount;

  return {
    ...task,
    id,
    subtaskDone: isValidArray && lengthMatches
      ? task.subtaskDone
      : new Array(subtaskCount).fill(false),
  };
}

function handleTaskFetchError(warning) {
  console.warn("Fehler:", warning);
}


async function renderTasks(tasks) {
  if (!Array.isArray(tasks)) return;
  clearTaskLists();

  for (const task of tasks) {
    const element = await createTaskElement(task, allUsers);
    const listId = statusMap[task.status];
    const list = document.getElementById(listId);
    if (list) list.appendChild(element);
  }

  updateEmptyLists();
}

async function createTaskElement(task, allUsers) {
  const element = document.createElement("article");
  element.className = getTaskClass(task);
  element.id = `task-${task.id}`;
  element.draggable = true;

  element.innerHTML = renderTaskHTML(task, allUsers);

  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("click", () => openTaskDetails(task));

  return element;
}

function clearTaskLists() {
  Object.values(statusMap).forEach((listId) => {
    const list = document.getElementById(listId);
    if (list) list.innerHTML = "";
  });
}

function getTaskClass(task) {
  const prio = (task.prio || "low").toLowerCase();
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
  return `task prio-${prio}${hasSubtasks ? " has-subtasks" : ""}`;
}

function renderTaskHTML(task, allUsers) {
  return `
    ${renderTaskIcon(task)}
    ${renderTaskContent(task)}
    ${renderProgressBar(task)}
    ${renderAssignment(task, allUsers)}
  `;
}

function renderTaskIcon(task) {
  const iconFile = categoryIcons[task.category] || "defaulticon.svg";
  return `
    <div class="task-icon">
      <img src="../assets/icons/${iconFile}" alt="${task.category}">
    </div>
  `;
}

function renderTaskContent(task) {
  return `
    <div>
      <h3>${task.title}</h3>
      <p class="task-description-style">${task.description}</p>
    </div>
  `;
}

function renderProgressBar(task) {
  const done = (task.subtaskDone || []).filter(Boolean).length;
  const total = (task.subtasks || []).length;
  if (total === 0) return "";

  const percent = (done / total) * 100;
  return `
    <div class="progress-bar-wrapper">
      <div class="progress-bar-container">
        <div id="subtask-progressbar-${task.id}" class="progress-bar-fill" style="width: ${percent}%;"></div>
      </div>
      <span id="subtask-progress-text-${task.id}" class="subtask-counter">${done}/${total} Subtasks</span>
    </div>`;
}

async function renderTaskDetailData(task) {
  const $ = (sel) => document.querySelector(sel);

  const iconEl = $("#detail-icon");
  if (iconEl) {
    iconEl.src = getCategoryIcon(task.category);
    iconEl.alt = task.category || "Task Icon";
  }

  $("#task-detail-title").textContent = task.title;
  $("#detail-description").textContent = task.description;
  $("#task-detail-due-date").textContent = task.dueDate;
  $("#task-detail-priority").innerHTML = getPriorityIcon(task.prio);
  $("#task-detail-assigned").innerHTML = generateAssignedChips(
    toArray(task.assigned),
    allUsers
  );

  $("#task-detail-subtasks").innerHTML = (task.subtasks || [])
    .map((txt, i) => {
      const isChecked = task.subtaskDone?.[i] ? "checked" : "";
      return `<li><input type="checkbox" id="sub-${i}" class="subtask-checkbox" ${isChecked}>
              <label for="sub-${i}">${txt}</label></li>`;
    })
    .join("");

  if (typeof renderSubtasksInModal === "function") {
    renderSubtasksInModal(task);
  }

  setupEditAndDelete(task);
  initSubtaskProgress(null, task);
}

function renderTaskIcon(task) {
  const iconEl = document.querySelector("#detail-icon");
  if (!iconEl) return;

  iconEl.src = getCategoryIcon(task.category);
  iconEl.alt = task.category || "Task Icon";
}

function renderTaskTextContent(task) {
  document.querySelector("#task-detail-title").textContent = task.title;
  document.querySelector("#detail-description").textContent = task.description;
  document.querySelector("#task-detail-due-date").textContent = task.dueDate;
}

function renderTaskPriority(task) {
  document.querySelector("#task-detail-priority").innerHTML = getPriorityIcon(task.prio);
}

function renderTaskAssigned(task) {
  document.querySelector("#task-detail-assigned").innerHTML = generateAssignedChips(
    toArray(task.assigned),
    allUsers
  );
}

function renderTaskSubtasks(task) {
  const subtasksHTML = (task.subtasks || []).map((txt, i) => {
    const isChecked = task.subtaskDone?.[i] ? "checked" : "";
    return `
      <li>
        <input type="checkbox" id="sub-${i}" class="subtask-checkbox" ${isChecked}>
        <label for="sub-${i}">${txt}</label>
      </li>`;
  }).join("");

  document.querySelector("#task-detail-subtasks").innerHTML = subtasksHTML;
}


function setupEditAndDelete(task) {
  const editBtn = document.querySelector(".edit-btn");
  const deleteBtn = document.querySelector(".delete-btn");

  if (editBtn) {
    editBtn.addEventListener("click", () => openTaskModal(true, task));
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      await deleteTask(task.id);
      closeDetailModal();
      fetchTasks();
    });
  }
}

function closeDetailModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("d_none");
  overlay.innerHTML = "";
}

async function openTaskDetails(task) {
  const overlay = document.getElementById("modal-overlay");
  resetOverlay(overlay);

  const modalHTML = await fetchModalHTML("../edittask/taskdetail.html");
  overlay.innerHTML = modalHTML;

  renderTaskDetailData(task);
  const modal = overlay.querySelector("#taskDetailModal");

  setupCloseButton(modal, overlay);
  setupOutsideClickHandler(modal, overlay);
}

function resetOverlay(overlay) {
  overlay.innerHTML = "";
  overlay.classList.remove("d_none");
}

async function fetchModalHTML(path) {
  const res = await fetch(path);
  return await res.text();
}

function setupCloseButton(modal, overlay) {
  const closeBtn = modal.querySelector(".taskDetailCloseButton");
  closeBtn?.addEventListener("click", async () => {
    closeOverlay(overlay);
    await fetchTasks();
  });
}

function setupOutsideClickHandler(modal, overlay) {
  const handler = (event) => {
    const clickedInside = event.composedPath().includes(modal);
    const clickedOverlay = event.target === overlay;

    if (clickedInside || !clickedOverlay) return;

    closeOverlay(overlay);
    overlay.removeEventListener("click", handler);
    fetchTasks();
  };
  overlay.addEventListener("click", handler);
}

function closeOverlay(overlay) {
  overlay.classList.add("d_none");
  overlay.innerHTML = "";
}

document.querySelectorAll(".board-icon").forEach((icon) => {
  icon.addEventListener("click", async () => {
    openTaskModal();
  });
});

function openTaskModal(isEdit = false, task = null) {
  const overlay = document.getElementById("modal-overlay");
  fetch("../taskFloatData/taskfloat.html")
    .then((res) => res.text())
    .then((html) => {
      overlay.innerHTML = html;
      overlay.classList.remove("d_none");
      initModalContents(overlay, isEdit, task);
    });
}

async function initModalContents(overlay, isEdit, task) {
  await waitForTaskFloatInit();
  setModalMode(isEdit, task);
  const form = overlay.querySelector("#taskForm-modal");

  if (isEdit && task && form) {
    prepareModalFormForEdit(form, task);
  }

  setupModalCloseButton(overlay);
}

async function waitForTaskFloatInit() {
  const init = window.initTaskFloat?.();
  if (init instanceof Promise) await init;
}

function setupModalCloseButton(overlay) {
  overlay.querySelector(".taskFloatButtonClose")?.addEventListener("click", () => {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  });
}

function setModalMode(isEdit, task) {
  window.isEditMode = isEdit;
  window.editingTaskId = isEdit && task ? task.id : null;
}

function prepareModalFormForEdit(form, task) {
  form.dataset.taskId = task.id;
  form.dataset.taskStatus = task.status;

  window.prefillModalWithTaskData(task);

  const okBtn = form.querySelector(".create-button");
  if (okBtn) {
    okBtn.innerHTML = 'OK <img src="../assets/icons/check.svg">';
    okBtn.disabled = false;
  }
}

function getPriorityIcon(prio) {
  const prioMap = {
    low: "prio_overlay_low.svg",
    medium: "prio_overlay_medium.svg",
    urgent: "prio_overlay_urgent.svg",
  };
  const icon = prioMap[prio?.toLowerCase()] || prioMap.low;
  return `<img src="../assets/icons/${icon}" alt="${prio}">`;
}

function setupDragAndDrop() {
  Object.values(statusMap).forEach((columnId) => {
    const column = document.getElementById(columnId);
    if (column) attachDragEvents(column);
  });
}

function attachDragEvents(column) {
  column.addEventListener("dragover", handleDragOver);
  column.addEventListener("dragleave", handleDragLeave);
  column.addEventListener("drop", handleDropOnColumn);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDropOnColumn(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  handleDrop(e);
}

function handleDrop(event) {
  const taskId = getDraggedTaskId(event);
  const task = getLoadedTaskById(taskId);
  const newStatus = getDropTargetStatus(event);

  if (!task || !newStatus) return;

  task.status = newStatus;
  moveTaskToNewList(taskId, event.currentTarget);
  updateTask(task);
  updateEmptyLists();
}

function getDraggedTaskId(event) {
  return event.dataTransfer.getData("text/plain");
}

function getLoadedTaskById(taskId) {
  const id = taskId.replace("task-", "");
  return loadedTasks[id];
}

function getDropTargetStatus(event) {
  const targetListId = event.currentTarget?.id;
  return getStatusFromElementId(targetListId);
}

function moveTaskToNewList(taskId, targetElement) {
  const taskElement = document.getElementById(taskId);
  if (taskElement && targetElement) {
    targetElement.appendChild(taskElement);
  }
}

function getStatusFromElementId(id) {
  return (
    Object.entries(statusMap).find(([_, listId]) => listId === id)?.[0] || null
  );
}

async function updateTask(task) {
  try {
    await requestData("PUT", `/tasks/${task.id}`, task);
  } catch (warn) {
    console.warn("Fehler beim Aktualisieren des Tasks:", warn);
  }
}

document.getElementById("inputIcon").addEventListener("click", searchTasks);

function searchTasks() {
  const term = getSearchTerm();
  Object.values(loadedTasks).forEach((task) => {
    const taskElement = document.getElementById(`task-${task.id}`);
    if (!taskElement) return;

    const isMatch = taskMatchesSearch(task, term);
    taskElement.style.display = isMatch ? "flex" : "none";
  });
}

function getSearchTerm() {
  const input = document.getElementById("searchFieldInput");
  return input?.value?.toLowerCase().trim() || "";
}

function taskMatchesSearch(task, term) {
  const titleMatch = task.title.toLowerCase().includes(term);
  const descriptionMatch = task.description.toLowerCase().includes(term);
  return titleMatch || descriptionMatch;
}

function initSubtaskProgress(taskId = null, task = null) {
  document.querySelectorAll(".subtask-checkbox").forEach((cb) =>
    cb.addEventListener("change", () => {
      updateSubtaskProgress(taskId);
      if (task) saveSubtaskState(task);
    })
  );
  updateSubtaskProgress(taskId);
}

function updateSubtaskProgress(taskId = null) {
  const boxes = [...document.querySelectorAll(".subtask-checkbox")];
  const total = boxes.length;
  const done = boxes.filter((b) => b.checked).length;
  setProgressText(done, total, taskId);
  setProgressBar(done, total, taskId);
}

function setProgressText(done, total, taskId) {
  const id = taskId
    ? `subtask-progress-text-${taskId}`
    : "subtask-progress-text";
  const text = document.getElementById(id);
  if (text) text.textContent = `${done}/${total} Subtasks`;
}

function setProgressBar(done, total, taskId) {
  const id = taskId ? `subtask-progressbar-${taskId}` : "subtask-progressbar";
  const bar = document.getElementById(id);
  if (bar) bar.style.width = total ? `${(done / total) * 100}%` : "0%";
}

function saveSubtaskState(task) {
  const boxes = [...document.querySelectorAll(".subtask-checkbox")];
  const states = boxes.map((cb) => cb.checked);
  task.subtaskDone = states;
  updateTask(task);
}

function isMobileDevice() {
  return window.innerWidth <= 820;
}

function isLandscapeMode() {
  return window.matchMedia("(orientation: landscape)").matches;
}

function toggleRotateWarning() {
  const warning = document.getElementById("rotateWarning");
  const shouldShow = isMobileDevice() && isLandscapeMode();
  warning.style.display = shouldShow ? "flex" : "none";
}

window.addEventListener("orientationchange", toggleRotateWarning);
window.addEventListener("resize", toggleRotateWarning);
document.addEventListener("DOMContentLoaded", toggleRotateWarning);
