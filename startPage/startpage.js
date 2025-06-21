import { requestData } from "../scripts/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  updateUserGreeting();
  updateSummary();
});

function updateUserGreeting() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    const name = user.userName || "Guest";

    const greetingEl = document.querySelector(".greetings > p:first-child");
    const nameEl = document.querySelector(".greetings .username");
    const profileBtn = document.getElementById("openMenu");

    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    if (greetingEl) greetingEl.textContent = `${greeting},`;
    if (nameEl) nameEl.textContent = name;
    if (profileBtn) profileBtn.textContent = getInitials(name);
  } catch (err) {
    console.warn("Fehler beim Parsen des Benutzers:", err);
  }
}

async function updateSummary() {
  try {
    const { data: tasks } = await requestData("GET", "/tasks/");
    if (!tasks) return;

    const allTasks = Object.values(tasks);

    setText(".todoTaskAmount", countByStatus(allTasks, "todo"));
    setText(".doneTaskAmount", countByStatus(allTasks, "done"));
    setText(".taskInProgress", countByStatus(allTasks, "in-progress"));
    setText(".awaitingFeedback", countByStatus(allTasks, "await"));
    setText(".taskInBoard", allTasks.length);
    setText(".urgentTaskAmount", countByPriority(allTasks, "High"));

    const earliestUrgentDate = getEarliestUrgentDueDate(allTasks);
    setText(".urgentTaskDate", earliestUrgentDate || "No deadline");
  } catch (err) {
    console.error("Fehler beim Laden der Summary:", err);
  }
}

function countByStatus(tasks, status) {
  return tasks.filter((t) => t.status === status).length;
}

function countByPriority(tasks, prio) {
  return tasks.filter(
    (t) => (t.prio || "").toLowerCase() === prio.toLowerCase()
  ).length;
}

function getEarliestUrgentDueDate(tasks) {
  const urgentTasks = tasks
    .filter((t) => (t.prio || "").toLowerCase() === "high" && t.dueDate)
    .map((t) => new Date(t.dueDate))
    .sort((a, b) => a - b);

  if (urgentTasks.length === 0) return null;

  const options = { year: "numeric", month: "long", day: "numeric" };
  return urgentTasks[0].toLocaleDateString("en-US", options);
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
