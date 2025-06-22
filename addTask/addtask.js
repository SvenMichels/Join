import { requestData } from "../scripts/firebase.js";

let currentActivePriority = "";
// const assignedBtnImg = document.getElementById("assignedBtnImg");
// const userList = document.getElementById("assignedUserList");
const subtaskInput = document.getElementById("subtask");
const subtaskList = document.getElementById("subtaskList");
let subtask = [];
let allUsers = [];

const priorityIcons = {
  urgent: [
    "../assets/icons/urgent_red.svg",
    "../assets/icons/urgent_white.svg",
  ],
  medium: [
    "../assets/icons/medium_yellow.svg",
    "../assets/icons/medium_white.svg",
  ],
  low: ["../assets/icons/low_green.svg", "../assets/icons/low_white.svg"],
};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("openMenu").addEventListener("click", closeOpenMenu);
  initForm();
  eventHandleSearch();

  const dateInput = document.getElementById("taskDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }
});

function initForm() {
  loadAndRenderUsers();
  document
    .getElementById("taskForm")
    .addEventListener("submit", handleFormSubmit);

  ["urgent", "medium", "low"].forEach((priority) => {
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
  selectPriority("medium");
}

function selectPriority(priority) {
  currentActivePriority = priority;

  const priorityMap = {
    urgent: "urgent-task",
    medium: "medium-task",
    low: "low-task",
  };

  Object.entries(priorityMap).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    const img = document.getElementById(`${key}-task-img`);
    if (btn) {
      btn.classList.remove(
        "prioUrgentBtnActive",
        "prioMediumBtnActive",
        "prioLowBtnActive"
      );
    }
    if (img) img.src = priorityIcons[key][0];
  });

  const activeBtn = document.getElementById(priorityMap[priority]);
  const activeImg = document.getElementById(`${priority}-task-img`);

  if (activeBtn) {
    const className = {
      urgent: "prioUrgentBtnActive",
      medium: "prioMediumBtnActive",
      low: "prioLowBtnActive",
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
    assigned: collectAssignedUsers().join(", "),
    subtask: form.subtasks,
    status: "todo",
  };
}

function isTaskValid(task) {
  if (
    !task.title ||
    !task.description ||
    !validateDate() ||
    !task.category ||
    task.category.trim() === ""
  ) {
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

function closeOpenMenu() {
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
    document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
}
// Neue Funktionen für Benutzerzuweisung (Checkbox-Logik)

async function loadAndRenderUsers() {
  try {
    const response = await requestData("GET", "/users");
    const usersData = response.data;

    allUsers = Object.entries(usersData || {}).map(([id, user]) => ({
      id,
      ...user,
    }));

    renderUserCheckboxes(allUsers);
  } catch (error) {
    console.error("Fehler beim Laden der Nutzer:", error);
  }
}

function renderUserCheckboxes(users) {
  const container = document.getElementById("assignedUserList");
  container.innerHTML = "";

  users.forEach((user) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `user-${user.id}`;
    checkbox.value = user.userName;
    checkbox.className = "user-checkbox";

    const initialsDiv = document.createElement("div");
    initialsDiv.className = "selected-contact-chip";
    initialsDiv.textContent = getInitials(user.userName);
    initialsDiv.style.backgroundColor = getRandomColor();

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = user.userName;
    
    label.addEventListener("click", (e) => e.preventDefault());

    const namesDiv = document.createElement("div");
    namesDiv.className = "userInfoWrapper";
    namesDiv.appendChild(initialsDiv);
    namesDiv.appendChild(label);

    const wrapper = document.createElement("div");
    wrapper.className = "user-checkbox-wrapper";
    wrapper.appendChild(namesDiv);
    wrapper.appendChild(checkbox);

    container.appendChild(wrapper);

    checkbox.addEventListener("change", updateSelectedUserDisplay);

    wrapper.addEventListener("click", function (e) {
      if (e.target.tagName !== "INPUT") {
        checkbox.checked = !checkbox.checked;
      }
        wrapper.classList.toggle("active");
        updateSelectedUserDisplay();
    });

    updateSelectedUserDisplay(); // Initial leer
  });
}

function collectAssignedUsers() {
  const checkboxes = document.querySelectorAll(
    ".user-checkbox-wrapper .user-checkbox"
  );
  const selected = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  return selected;
}

function updateSelectedUserDisplay() {
  const selectedContainer = document.getElementById("selectedUser");
  selectedContainer.innerHTML = "";

  const selected = collectAssignedUsers();

  selected.forEach((name) => {
    const initials = getInitials(name);
    const color = getRandomColor();
    const chip = document.createElement("div");
    chip.className = "selected-contact-chip";
    chip.textContent = initials;
    chip.style.backgroundColor = color;
    selectedContainer.appendChild(chip);
  });
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

subtaskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && subtaskInput.value.trim() !== "") {
    e.preventDefault();
    const taskText = subtaskInput.value.trim();
    subtask.push(taskText);
    subtaskInput.value = "";
    renderSubtasks();
  }
});

function renderSubtasks() {
  subtaskList.innerHTML = "";

  subtask.forEach((task, index) => {
    const taskItem = document.createElement("div");
    taskItem.className = "subtaskItem";
    taskItem.textContent = `• ${task}`;
    subtaskList.appendChild(taskItem);
  });
}

function validateDate() {
  const dateInput = document.getElementById("taskDate");
  const selectedDate = new Date(dateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert("Set valid Date");
    return false;
  }
  return true;
}

document
  .querySelector(".assignUserListBtn", "assignedBtnImg")
  .addEventListener("click", function (e) {
    e.preventDefault();

    const userList = document.getElementById("assignedUserList");
    const arrow = document.getElementById("assignedBtnImg");
    const isVisible = userList.classList.toggle("visible");

    if (isVisible) {
      arrow.classList.add("rotated");
    } else {
      arrow.classList.remove("rotated");
    }
  });

document
  .querySelector(".subtaskAddButton")
  .addEventListener("click", function (e) {
    e.preventDefault();
    // add subtask input data to subtaskList
  });

function eventHandleSearch() {
  let searchBar = document.getElementById("searchUser");
  searchBar.addEventListener("input", function () {
    let searchTerm = searchBar.value.toLowerCase();
    filteredUsers(searchTerm);
  });
}

function handleEmptySearch(searchTerm) {
  if (searchTerm.length === 0) {
    renderUserCheckboxes(allUsers);
  }
}

function filteredUsers(searchTerm) {
  handleEmptySearch(searchTerm);
  if (searchTerm.length < 3) {
    return;
  } else {
    document.getElementById("assignedUserList").classList.add("visible");
  }
  console.log(allUsers);
  const filtered = allUsers.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm)
  );
  renderUserCheckboxes(filtered);
}
