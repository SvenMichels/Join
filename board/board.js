import { requestData } from "../scripts/firebase.js";

const statusMap = {
  todo: "todoList",
  "in-progress": "inProgressList",
  await: "awaitList",
  done: "doneList",
};

window.addEventListener("DOMContentLoaded", fetchTasks);

async function fetchTasks() {
  try {
    const { data: tasks } = await requestData("GET", "/tasks/");
    console.table("Tasks geladen:", tasks);
    renderTasks(Object.values(tasks));
    setupDragAndDrop();
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
  configureTaskElement(element, task);
  return element;
}

function configureTaskElement(element, task) {
  element.className = `task prio-${(task.prio || "low").toLowerCase()}`;
  element.draggable = true;
  element.id = `task-${task.id}`;
  element.innerHTML = buildTaskHTML(task);
  element.addEventListener("dragstart", handleDragStart);
}

function buildTaskHTML(task) {
  return `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="meta">
      <span>Fällig: ${task.dueDate}</span>
      <span>Prio: ${task.prio}</span>
    </div>
  `;
}

function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const targetListId = event.currentTarget.id;
  const newStatus = getStatusFromElementId(targetListId);

  if (!taskElement || !newStatus) return;

  event.currentTarget.appendChild(taskElement);
  updateTaskStatus(taskId.replace("task-", ""), newStatus);
}

function getStatusFromElementId(id) {
  return Object.keys(statusMap).find((key) => statusMap[key] === id);
}

async function updateTaskStatus(id, newStatus) {
  try {
    await requestData("PUT", `/tasks/${id}`, { status: newStatus });
    console.log(`Task ${id} auf Status ${newStatus} gesetzt`);
  } catch (error) {
    console.error(`Fehler beim Aktualisieren von Task ${id}:`, error);
  }
}

function setupDragAndDrop() {
  Object.values(statusMap).forEach((id) => {
    const list = document.getElementById(id);
    if (list) {
      list.addEventListener("dragover", allowDrop);
      list.addEventListener("drop", drop);
    }
  });
}
