// board.js
import { requestData } from "../scripts/firebase.js"; // Pfad ggf. anpassen

const statusMap = {
  "todo": "todoList",
  "in-progress": "inProgressList",
  "await": "awaitList",
  "done": "doneList"
};

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
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    const targetId = statusMap[task.status];
    const list = document.getElementById(targetId);
    if (list) list.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const prioClass = (task.prio || 'low').toLowerCase();
  const element = document.createElement("article");
  element.className = `task prio-${prioClass}`;
  element.draggable = true;
  element.id = `task-${task.id}`;
  element.addEventListener("dragstart", drag);
  element.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="meta">
      <span>Fällig: ${task.dueDate}</span>
      <span>Prio: ${task.prio}</span>
    </div>
  `;
  return element;
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const newStatus = Object.keys(statusMap).find(key => statusMap[key] === event.currentTarget.id);
  event.currentTarget.appendChild(taskElement);
  updateTaskStatus(taskId.replace("task-", ""), newStatus);
}

async function updateTaskStatus(id, newStatus) {
  try {
    await requestData("PUT", `/tasks/${id}`, { status: newStatus });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Status:", error);
  }
}

function setupDragAndDrop() {
  Object.values(statusMap).forEach(id => {
    const list = document.getElementById(id);
    if (list) {
      list.addEventListener("dragover", allowDrop);
      list.addEventListener("drop", drop);
    }
  });
}

window.addEventListener("DOMContentLoaded", fetchTasks);