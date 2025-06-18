import { requestData } from "../scripts/firebase.js";

let currentActivePriority = "";

const priorityIcons = {
  urgent: ["../assets/icons/urgent_red.svg", "../assets/icons/urgent_white.svg"],
  medium: ["../assets/icons/medium_yellow.svg", "../assets/icons/medium_white.svg"],
  low: ["../assets/icons/low_green.svg", "../assets/icons/low_white.svg"]
};

window.addEventListener("DOMContentLoaded", () => {
   document.getElementById("openMenu").addEventListener("click", closeOpenMenu);
  initForm();
});

function initForm() {
  document.getElementById("taskForm").addEventListener("submit", handleFormSubmit);

  ["urgent", "medium", "low"].forEach(priority => {
    const button = document.getElementById(`${priority}-task`);
    if (button) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        selectPriority(priority);
      });
    }
  });

  const categorySelect = document.getElementById("category");
  const submitButton = document.querySelector(".createButton");
  submitButton.disabled = true;
  categorySelect.addEventListener("change", () => {
    submitButton.disabled = categorySelect.value.trim() === "";
  });
}

function selectPriority(priority) {
  currentActivePriority = priority;

  const priorityMap = {
    urgent: "urgent-task",
    medium: "medium-task",
    low: "low-task"
  };

  Object.entries(priorityMap).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    const img = document.getElementById(`${key}-task-img`);
    if (btn) {
      btn.classList.remove("prioUrgentBtnActive", "prioMediumBtnActive", "prioLowBtnActive");
    }
    if (img) img.src = priorityIcons[key][0];
  });

  const activeBtn = document.getElementById(priorityMap[priority]);
  const activeImg = document.getElementById(`${priority}-task-img`);

  if (activeBtn) {
    const className = {
      urgent: "prioUrgentBtnActive",
      medium: "prioMediumBtnActive",
      low: "prioLowBtnActive"
    }[priority];
    activeBtn.classList.add(className);
  }

  if (activeImg) activeImg.src = priorityIcons[priority][1];
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const task = collectTaskData(form);
  if (!isTaskValid(task)) return;
  saveTask(task);
}

function collectTaskData(form) {
  return {
    id: Date.now(),
    title: form.taskTitle.value,
    description: form.taskDescription.value,
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentActivePriority,
    assigned: form.assignedUsers.value,
    subtask: form.subtask.value,
    status: "todo"
  };
}

function isTaskValid(task) {
  if (!task.title || !task.description || !task.category || task.category.trim() === "") {
    alert("Bitte fülle alle Pflichtfelder aus und wähle eine Kategorie.");
    return false;
  }
  return true;
}

async function saveTask(task) {
  try {
    const path = `/tasks/${task.id}`;
    await requestData("PUT", path, task);
    alert("Task erfolgreich gespeichert!");
  } catch (error) {
    console.error("Fehler beim Speichern des Tasks:", error);
    alert("Fehler beim Speichern des Tasks.");
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