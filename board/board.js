// board.js
import { requestData } from "../scripts/firebase.js";
import { updateEmptyLists } from "../scripts/utils/emptylisthelper.js";

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
    updateEmptyLists();
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
  updateEmptyLists();
}

function createTaskElement(task) {
  const categoryIcons = {
    User_Story: "propertyuserstory.svg",
    Technical_Task: "propertytechnicaltask.svg",
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
  if (!assigned || (Array.isArray(assigned) && assigned.length === 0))
    return "";

  const names = Array.isArray(assigned)
    ? assigned.map((item) =>
        typeof item === "string" ? item : item.name || item.fullName || ""
      )
    : String(assigned).split(",");

  return names
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => {
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
    console.log("Task aktualisiert:", task);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
}

function closeOpenMenu() {
  const element = document.getElementById("dropDownMenu");
  element.classList.toggle("dp-none");
}

function loadUserInitials() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const user = JSON.parse(userString);
  const name = user.userName || "Guest";
  const profileButton = document.getElementById("openMenu");
  if (profileButton) profileButton.textContent = getInitials(name);
}

document.querySelectorAll(".board-icon").forEach((icon) => {
  icon.addEventListener("click", async () => {
    await openTaskModal();
  });
});

async function openTaskModal() {
  const overlay = document.getElementById("modal-overlay");
  const response = await fetch("../taskfloatdata/taskfloat.html");
  overlay.innerHTML = await response.text();
  overlay.classList.remove("d_none");

  /* ---------- Close-Button ---------- */
  const closeBtn = overlay.querySelector(".taskFloatButtonClose");
  if (closeBtn)
    closeBtn.addEventListener("click", () => {
      overlay.classList.add("d_none");
      overlay.innerHTML = ""; // Modal säubern
    });

  /* ---------- Submit-Button ---------- */
  const submitBtn = overlay.querySelector(".createButton");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const newTask = extractTaskFromForm(overlay);
      if (!newTask) return; // Pflichtfelder fehlen → Abbruch

      const { data } = await requestData("POST", "/tasks/", newTask);
      newTask.id = data.name; // Firebase-ID
      loadedTasks[newTask.id] = newTask;

      const taskEl = createTaskElement(newTask);
      document.getElementById(statusMap[newTask.status]).appendChild(taskEl);

      updateEmptyLists();
      overlay.classList.add("d_none");
      overlay.innerHTML = "";
    });
  }

  /* ---------- Prio-Buttons aktivieren ---------- */
  const prioButtons = overlay.querySelectorAll(
    ".prioButtonUrgent, .prioButtonMedium, .prioButtonLow"
  );
  prioButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      prioButtons.forEach((b) => b.classList.remove("active")); // alle zurücksetzen
      btn.classList.add("active"); // geklickten markieren
    });
  });
  // nachdem prioButtons definiert sind:
  prioButtons[2]?.classList.add("active"); // Low vorselektieren
}

function extractTaskFromForm(root) {
  const title = root.querySelector("#titleInput")?.value.trim();
  const description = root.querySelector("#descriptionInput")?.value.trim();
  const dueDate = root.querySelector("#dateInput")?.value;
  const assigned = root.querySelector(".prioAssignInput")?.value;
  const category = root.querySelector(".prioCategoryInput")?.value.trim();
  const prio = getSelectedPriority(root);

  if (!title || !dueDate || !category) {
    alert("Bitte fülle alle Pflichtfelder aus.");
    return null;
  }

  return {
    title,
    description,
    dueDate,
    assigned: assigned ? [assigned] : [],
    category: category === "User Story" ? "User_Story" : "Technical_Task",
    prio,
    status: "todo", // Default
  };
}

function getSelectedPriority(root) {
  if (root.querySelector(".prioButtonUrgent.active")) return "Urgent";
  if (root.querySelector(".prioButtonMedium.active")) return "Medium";
  if (root.querySelector(".prioButtonLow.active")) return "Low";
  return "Medium"; // Fallback, falls keiner aktiv
}
