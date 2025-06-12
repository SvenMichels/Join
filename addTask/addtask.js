import { requestData } from "../scripts/firebase.js"; // Firebase-Datenbankzugriff

let urgentImageArray = ['../assets/icons/urgent_red.svg', '../assets/icons/urgent_white.svg'];
let mediumImageArray = ['../assets/icons/medium_yellow.svg', '../assets/icons/medium_white.svg'];
let lowImageArray = ['../assets/icons/low_green.svg', '../assets/icons/low_white.svg'];

let currentActiveId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("taskForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.elements["taskTitle"].value.trim();
    const description = form.elements["taskDescription"].value.trim();
    const dueDate = form.elements["taskDate"].value;
    const category = form.elements["category"].value;
    const assigned = form.elements["assignedUsers"].value;
    const subtasks = form.elements["subtask"].value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let prio = null;
    if (document.getElementById("urgent-task").classList.contains("prioUrgentBtnActive")) {
      prio = "Urgent";
    } else if (document.getElementById("medium-task").classList.contains("prioMediumBtnActive")) {
      prio = "Medium";
    } else if (document.getElementById("low-task").classList.contains("prioLowBtnActive")) {
      prio = "Low";
    }

    if (!title || !description || !category) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const task = {
      id: Date.now(),
      title,
      description,
      dueDate,
      category,
      assigned,
      subtasks,
      prio,
      status: "todo",
    };

    console.log("Neue Aufgabe:", task);
    await requestData("POST", "/tasks/", task);

    form.reset();
    resetPrio(); // Reset auch nach dem Abschicken
    alert("Aufgabe erfolgreich erstellt!");
  });

  // Event Listener für Prio-Buttons
  document.getElementById("urgent-task").addEventListener("click", (e) => {
    e.preventDefault();
    resetPrio();
    document.getElementById('urgent-task').classList.add('prioUrgentBtnActive');
    togglePriority("urgent-task-img");
  });

  document.getElementById("medium-task").addEventListener("click", (e) => {
    e.preventDefault();
    resetPrio();
    document.getElementById('medium-task').classList.add('prioMediumBtnActive');
    togglePriority("medium-task");
  });

  document.getElementById("low-task").addEventListener("click", (e) => {
    e.preventDefault();
    resetPrio();
    document.getElementById('low-task').classList.add('prioLowBtnActive');
    togglePriority("low-task");
  });
});

function togglePriority(activeId) {
  const priorities = {
    "urgent-task-img": urgentImageArray,
    "medium-task": mediumImageArray,
    "low-task": lowImageArray
  };

  Object.keys(priorities).forEach((id) => {
    const images = priorities[id];
    const imgElement = document.getElementById(id);

    if (id === activeId) {
      if (currentActiveId === activeId) {
        imgElement.src = images[0];
        currentActiveId = null;
      } else {
        imgElement.src = images[1];
        currentActiveId = activeId;
      }
    } else {
      imgElement.src = images[0];
    }
  });
}

function resetPrio() {
  // Buttons zurücksetzen
  document.getElementById("urgent-task").classList.remove("prioUrgentBtnActive");
  document.getElementById("medium-task").classList.remove("prioMediumBtnActive");
  document.getElementById("low-task").classList.remove("prioLowBtnActive");

  // Icons zurücksetzen
  document.getElementById("urgent-task-img").src = urgentImageArray[0];
  document.getElementById("medium-task").src = mediumImageArray[0];
  document.getElementById("low-task").src = lowImageArray[0];

  currentActiveId = null;
}
