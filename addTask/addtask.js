 import { requestData } from "../scripts/firebase.js"; // Firebase-Datenbankzugriff

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
    if (document.getElementById("urgentTask").classList.contains("active"))
      prio = "Urgent";
    if (document.getElementById("mediumTask").classList.contains("active"))
      prio = "Medium";
    if (document.getElementById("lowTask").classList.contains("active"))
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

  document.getElementById("urgentTask").addEventListener("click", (e) => {
    e.preventDefault();
    togglePriority("urgentTask");
  });
  document.getElementById("mediumTask").addEventListener("click", (e) => {
    e.preventDefault();
    togglePriority("mediumTask");
  });
  document.getElementById("lowTask").addEventListener("click", (e) => {
    e.preventDefault();
    togglePriority("lowTask");
  });

  function togglePriority(activeId) {
    ["urgentTask", "mediumTask", "lowTask"].forEach((id) => {
      document.getElementById(id).classList.remove("active");
    });
    document.getElementById(activeId).classList.add("active");
  }
});

function closeOpenMenu(){
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
      document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
}