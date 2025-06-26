// board.js
import { requestData } from "../scripts/firebase.js";

const statusMap = {
  todo: "todoList",
  "in-progress": "inProgressList",
  await: "awaitList",
  done: "doneList",
};

let loadedTasks = {};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("openMenu").addEventListener("click", closeOpenMenu);
  fetchTasks();
  setupDragAndDrop();
  loadUserInitials();
});

async function fetchTasks() {
  try {
    const { data: tasks } = await requestData("GET", "/tasks/");
    loadedTasks = tasks || {};
    renderTasks(Object.values(loadedTasks));
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
}

function renderTasks(tasks) {
  if (!Array.isArray(tasks)) return;
  tasks.forEach((task) => {
    const element = createTaskElement(task);
    const listId = statusMap[task.status];
    const list = document.getElementById(listId);
    if (list) list.appendChild(element);
  });
}

function createTaskElement(task) {
  const categoryIcons = {
    "User_Story": "propertyuserstory.svg",
    "Technical_Task": "propertytechnicaltask.svg",
  };

  const iconFile = categoryIcons[task.category] || "defaulticon.svg";

  const element = document.createElement("article");
  element.className = `task prio-${(task.prio || "low").toLowerCase()}`;
  element.id = `task-${task.id}`;

  const assignedHTML = generateAssignedChips(task.assigned);

  element.innerHTML = `
    <img src="../assets/icons/${iconFile}" alt="${task.category}">
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="meta">
      <span>Fällig: ${task.dueDate}</span>
      <span>Prio: ${task.prio}</span>
    </div>
    <div class="assigned-chips">${assignedHTML}</div>
  `;

  element.draggable = true;
  element.addEventListener("dragstart", handleDragStart);

  return element;
}

function generateAssignedChips(assigned) {
  if (!assigned || (Array.isArray(assigned) && assigned.length === 0)) return "";

  const names = Array.isArray(assigned)
    ? assigned.map(item =>
        typeof item === "string"
          ? item : item.name || item.fullName || "") : String(assigned).split(",");

  return names
    .map(name => name.trim()).filter(name => name.length > 0).map(name => {
      const initials = getInitials(name);
      const color = getRandomColor();
      return `<div class="selected-contact-chip" style="background-color:${color};">${initials}</div>`;
    })
    .join("");
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function getRandomColor() {
  const color = Math.floor(Math.random() * 360);
  return `hsl(${color}, 70%, 80%)`;
}

function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
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

  if (!task) {
    console.warn("Task nicht im Speicher – Drop wird ignoriert.");
    return;
  }

  task.status = newStatus;
  event.currentTarget.appendChild(taskElement);
  updateTask(task);
}

function getStatusFromElementId(id) {
  return Object.entries(statusMap).find(([_, listId]) => listId === id)?.[0] || null;
}

async function updateTask(task) {
  try {
    await requestData("PUT", `/tasks/${task.id}`, task);
    console.log("Task aktualisiert:", task);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
}

function closeOpenMenu() {
  const element = document.getElementById("dropDownMenu");
  element.classList.toggle("dp-none");
}

function loadUserInitials(){
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const user = JSON.parse(userString);
  const name = user.userName || "Guest";
  const profileBtn = document.getElementById("openMenu");
  if (profileBtn) profileBtn.textContent = getInitials(name);
}