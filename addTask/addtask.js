 import { requestData } from "../scripts/firebase.js"; // Firebase-Datenbankzugriff

let urgentImageArray = ['../assets/icons/urgent_red.svg' , '../assets/icons/urgent_white.svg']
let mediumImageArray = ['../assets/icons/medium_yellow.svg' , '../assets/icons/medium_white.svg']
let lowImageArray = ['../assets/icons/low_green.svg' , '../assets/icons/low_white.svg']


document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("taskForm");
  document.getElementById("openMenu").addEventListener("click", closeOpenMenu);

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
    if (document.getElementById("urgent-task").classList.contains("active")) {
      prio = "Urgent";
    }
    if (document.getElementById("medium-task").classList.contains("active"))
      prio = "Medium";
    if (document.getElementById("low-task").classList.contains("active"))
      prio = "Low";

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
    alert("Aufgabe erfolgreich erstellt!");
  });

  document.getElementById("urgent-task").addEventListener("click", (e) => {
    e.preventDefault();
    let urgentRef = document.getElementById('urgent-task');
    urgentRef.classList.toggle('prioUrgentBtnActive');
    togglePriority("urgent-task-img");
  });
  document.getElementById("medium-task").addEventListener("click", (e) => {
    e.preventDefault();
    let mediumRef = document.getElementById('medium-task');
    mediumRef.classList.toggle('prioMediumBtnActive');
    togglePriority("medium-task-img");
  });
  document.getElementById("low-task").addEventListener("click", (e) => {
    e.preventDefault();
    togglePriority("low-task");
  });

let currentActiveId = null;

function togglePriority(activeId) {
  const imageIds = ["urgent-task-img", "medium-task", "low-task"];
  imageIds.forEach((id) => {
    if (id === activeId) {
      if (currentActiveId === activeId) {
        // Wenn bereits aktiv, dann deaktivieren
        document.getElementById(id).src = urgentImageArray[0]; // inaktives Bild
        currentActiveId = null;
      } else {
        // Aktivieren
        document.getElementById(id).src = urgentImageArray[1]; // aktives Bild
        currentActiveId = activeId;
      }
    } else {
      // Für alle anderen Bilder, inaktives Bild setzen
      document.getElementById(id).src = urgentImageArray[0];
    }
  });
}});

function closeOpenMenu(){
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
      document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
}