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
  const element = document.createElement("article");
  element.className = `task prio-${(task.prio || "low").toLowerCase()}`;
  element.draggable = true;
  element.id = `task-${task.id}`;
  element.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="meta">
      <span>Fällig: ${task.dueDate}</span>
      <span>Prio: ${task.prio}</span>
    </div>
  `;
  element.addEventListener("dragstart", handleDragStart);
  return element;
}

function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

function setupDragAndDrop() {
  Object.values(statusMap).forEach((id) => {
    const column = document.getElementById(id);
    if (column) {
      column.addEventListener("dragover", allowDrop);
      column.addEventListener("drop", handleDrop);
    }
  });
}

function allowDrop(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
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

function closeOpenMenu(){
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
      document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
} 