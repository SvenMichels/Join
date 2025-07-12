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

window.editingTaskId = null;
window.isEditMode = false;
let loadedTasks = {};

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
  document.getElementById("add-task-btn").addEventListener("click", openTaskModal);
  window.addEventListener("taskCreated", fetchTasks);
  window.addEventListener("taskUpdated", fetchTasks);
  setupDropdown("#openMenu", "#dropDownMenu");
  fetchTasks();
  setupDragAndDrop();
  loadUserInitials();
});

async function fetchTasks() {
  try {
    const { data: tasksData } = await requestData("GET", "/tasks/");
    loadedTasks = {};

    for (const [id, task] of Object.entries(tasksData || {})) {
      task.id = id;
      if (
        !Array.isArray(task.subtaskDone) ||
        task.subtaskDone.length !== (task.subtasks?.length || 0)
      ) {
        task.subtaskDone = new Array(task.subtasks?.length || 0).fill(false);
      }
      loadedTasks[id] = task;
    }

    renderTasks(Object.values(loadedTasks));
    updateEmptyLists();
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
}

function renderTasks(tasks) {
  if (!Array.isArray(tasks)) return;
  clearTaskLists();

  tasks.forEach((task) => {
    const element = createTaskElement(task);
    const listId = statusMap[task.status];
    const list = document.getElementById(listId);
    if (list) list.appendChild(element);
  });

  updateEmptyLists();
}

function createTaskElement(task) {
  const done = Array.isArray(task.subtaskDone)
    ? task.subtaskDone.filter(Boolean).length
    : 0;
  const total = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  const percent = total > 0 ? (done / total) * 100 : 0;
  const hasSubtasksClass = total > 0 ? " has-subtasks" : "";

  const iconFile = categoryIcons[task.category] || "defaulticon.svg";

  const element = document.createElement("article");
  element.className = `task prio-${(
    task.prio || "low"
  ).toLowerCase()}${hasSubtasksClass}`;
  element.id = `task-${task.id}`;

  const assignedHTML = generateAssignedChips(task.assigned);

  const progressBar =
    total > 0
      ? `<div class="progress-bar-wrapper">
        <div class="progress-bar-container">
          <div id="subtask-progressbar-${task.id}" class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <span id="subtask-progress-text-${task.id}" class="subtask-counter">${done}/${total} Subtasks</span>
      </div>`
      : "";

  element.innerHTML = `
    <div class="task-icon">
      <img src="../assets/icons/${iconFile}" alt="${task.category}">
    </div>
    <div>
      <h3>${task.title}</h3>
      <p class="task-description-style">${task.description}</p>
    </div>
    ${progressBar}
    <div class="assigned-chips">
      <div>${assignedHTML}</div>
      <span>${task.prio}</span>
    </div>
  `;

  element.draggable = true;
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

function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function generateAssignedChips(assigned) {
  const names = toArray(assigned);
  if (names.length === 0) return "";
  return names
    .map((name) => `<div class="assigned-chip">${name}</div>`)
    .join("");
}

function loadUserInitials() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const user = JSON.parse(userString);
  const name = user.userName || "Guest";
  const profileButton = document.getElementById("openMenu");
  if (profileButton) profileButton.textContent = getInitials(name);
}

// Restliche Funktionen

function renderTaskDetailData(task) {
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
    toArray(task.assigned)
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

  overlay.innerHTML = "";
  overlay.classList.remove("d_none");

  const res = await fetch("../edittask/taskdetail.html");
  const modalHTML = await res.text();
  overlay.innerHTML = modalHTML;

  renderTaskDetailData(task);

  const modal = overlay.querySelector("#taskDetailModal");

  // 🧲 X-Button zum Schließen
  const closeBtn = modal.querySelector(".taskDetailCloseButton");
  closeBtn?.addEventListener("click", async () => {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
    await fetchTasks();
  });

  // ✨ NEUER Outside-Klick-Handler (Variante A)
  const outsideClickHandler = (event) => {
    if (!modal) return;

    const clickedInside = event.composedPath().includes(modal);
    const clickedOverlay = event.target === overlay;

    if (clickedInside || !clickedOverlay) return;

    overlay.classList.add("d_none");
    overlay.innerHTML = "";
    overlay.removeEventListener("click", outsideClickHandler)
    fetchTasks();
  };

  overlay.addEventListener("click", outsideClickHandler);
  
}


document.querySelectorAll(".board-icon").forEach((icon) => {
  icon.addEventListener("click", async () => {
    await openTaskModal();
  });
});

function openTaskModal(isEdit = false, task = null) {
  const overlay = document.getElementById("modal-overlay");
  fetch("../taskFloatData/taskfloat.html")
    .then((r) => r.text())
    .then((html) => {
      overlay.innerHTML = html;
      overlay.classList.remove("d_none");
      (async () => {
        const p = window.initTaskFloat?.();
        if (p instanceof Promise) await p;
        window.isEditMode = isEdit;
        window.editingTaskId = isEdit && task ? task.id : null;
        const form = overlay.querySelector("#taskForm-modal");
        if (isEdit && task && form) {
          form.dataset.taskId = task.id;
          form.dataset.taskStatus = task.status;
          window.prefillModalWithTaskData(task);
          const okBtn = form.querySelector(".create-button");
          if (okBtn) {
            okBtn.innerHTML = 'OK <img src="../assets/icons/check.svg">';
            okBtn.disabled = false;
          }
        }
        overlay
          .querySelector(".taskFloatButtonClose")
          ?.addEventListener("click", () => {
            overlay.classList.add("d_none");
            overlay.innerHTML = "";
          });
      })();
    });
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
  Object.values(statusMap).forEach((id) => {
    const column = document.getElementById(id);
    if (column) {
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
      });
      column.addEventListener("dragleave", () => {
        column.classList.remove("drag-over");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");
        handleDrop(e);
      });
    }
  });
}

function handleDrop(event) {
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const targetListId = event.currentTarget.id;
  const newStatus = getStatusFromElementId(targetListId);

  if (!taskElement || !newStatus) return;

  const id = taskId.replace("task-", "");
  const task = loadedTasks[id];
  if (!task) return;
  task.status = newStatus;
  event.currentTarget.appendChild(taskElement);
  updateEmptyLists();
  updateTask(task);
}

function getStatusFromElementId(id) {
  return (
    Object.entries(statusMap).find(([_, listId]) => listId === id)?.[0] || null
  );
}

async function updateTask(task) {
  try {
    await requestData("PUT", `/tasks/${task.id}`, task);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
}

document.getElementById("inputIcon").addEventListener("click", searchTasks);

function searchTasks() {
  const searchInput = document.getElementById("searchFieldInput");
  const searchTerm = searchInput.value.toLowerCase().trim();
  Object.values(loadedTasks).forEach((task) => {
    const taskElement = document.getElementById(`task-${task.id}`);
    if (!taskElement) return;
    const matchesTitle = task.title.toLowerCase().includes(searchTerm);
    const matchesDescription = task.description
      .toLowerCase()
      .includes(searchTerm);
    taskElement.style.display =
      matchesTitle || matchesDescription ? "flex" : "none";
  });
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