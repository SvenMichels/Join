import { requestData } from "../scripts/firebase.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveLinks } from "../scripts/utils/navUtils.js";
import { ensureUserHasColor } from "../scripts/utils/colors.js";

let currentActivePriority = "medium";
let allUsers = [];
let subtasks = [];

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

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  initForm();
  loadUserInitials();
  eventHandleSearch();
  setupDropdown('#openMenu', '#dropDownMenu');
  highlightActiveLinks();
});

const $ = {};

function cacheDom() {
  $.openMenuBtn = document.getElementById("openMenu");
  $.form = document.getElementById("taskForm");
  $.taskDate = document.getElementById("taskDate");
  $.subtaskInput = document.getElementById("subtask");
  $.subtaskAddBtn = document.querySelector(".subtask-add-button");
  $.assignUserListBtn = document.querySelector(".assignUserListBtn");
  $.assignedBtnImg = document.getElementById("assignedBtnImg");

  document.getElementById("task-date").min = new Date()
    .toISOString()
    .split("T")[0];
  $.form?.addEventListener("submit", handleFormSubmit);
  $.subtaskAddBtn?.addEventListener("click", addSubtask);
  $.subtaskInput?.addEventListener("keydown", addSubtaskOnEnter);
  $.assignUserListBtn?.addEventListener("click", toggleUserList);
  document.getElementById("createBtn").addEventListener("click", showUserFeedback)
}

function toggleUserList(e) {
  e.preventDefault();
  const list = document.getElementById("assignedUserList");
  const arrow = $.assignedBtnImg;
  const visible = list.classList.toggle("visible");
  arrow?.classList.toggle("rotated", visible);
}

function selectPriority(priority) {
  currentActivePriority = priority;
  const map = {
    urgent: "urgent-task",
    medium: "medium-task",
    low: "low-task",
  };

  Object.entries(map).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    const img = document.getElementById(`${key}-task-img`);
    btn?.classList.remove(
      "prioUrgentBtnActive",
      "prioMediumBtnActive",
      "prioLowBtnActive"
    );
    if (img) img.src = priorityIcons[key][0];
  });

  const activeBtn = document.getElementById(map[priority]);
  const activeImg = document.getElementById(`${priority}-task-img`);
  activeBtn?.classList.add(
    {
      urgent: "prioUrgentBtnActive",
      medium: "prioMediumBtnActive",
      low: "prioLowBtnActive",
    }[priority]
  );
  if (activeImg) activeImg.src = priorityIcons[priority][1];
}

function initForm() {
  loadAndRenderUsers();
  selectPriority("medium");

  const categorySelect = document.getElementById("category");
  const submitButton = document.querySelector(".create-button");
  submitButton.disabled = true;
  categorySelect.addEventListener("change", () => {
    submitButton.disabled = categorySelect.value.trim() === "";
  });

  ["urgent", "medium", "low"].forEach((prio) => {
    document
      .getElementById(`${prio}-task`)
      ?.addEventListener("click", () => selectPriority(prio));
  });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const task = collectTaskData(event.target);
  if (!isTaskValid(task)) return;

  saveTask(task)
    .then(() => {
      showUserFeedback();
      event.target.reset();
      selectPriority("medium");
      subtasks = [];
      renderSubtasks();
      event.target.removeAttribute("data-task-id");
    })
    .catch((err) => console.error(err));
}

function collectTaskData(form) {
  const existingId = form.getAttribute("data-task-id");
  return {
    id: existingId || Date.now(),
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentActivePriority,
    assigned: collectAssignedUsers(),
    subtasks: [...subtasks],
    status: "todo",
  };
}

function isTaskValid(task) {
  let valid = true;
  const show = (id, condition) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = condition ? "inline" : "none";
    if (condition) valid = false;
  };

  show("titleAlert", !task.title);
  show("dateAlert", !task.dueDate);
  show("categoryAlert", !task.category);

  return valid;
}

async function saveTask(task) {
  try {
    await requestData("PUT", `/tasks/${task.id}`, task);
  } catch (error) {
    alert("Fehler beim Speichern des Tasks.");
    throw error;
  }
}

async function loadAndRenderUsers() {
  const { data = {} } = await requestData("GET", "/users");
  allUsers = Object.entries(data).map(([id, u]) => ({ id, ...u }));

  allUsers = allUsers.filter((user, index, self) =>
    index === self.findIndex(u => u.userName === user.userName)
  );

  renderUserCheckboxes(allUsers);
}

async function renderUserCheckboxes(users) {
  const container = document.getElementById("assignedUserList");
  if (!container) return;

  container.innerHTML = "";
  const unique = new Set();

  for (let user of users) {
    user = await ensureUserHasColor(user);
    if (unique.has(user.userName)) continue;
    unique.add(user.userName);

    const wrap = document.createElement("div");
    wrap.className = "user-checkbox-wrapper";
    wrap.innerHTML = `
      <div class="user-info-wrapper">
        <div class="selected-contact-chip ${user.colorClass}">${getInitials(user.userName)}</div>
        <label>${user.userName}</label>
      </div>
      <input type="checkbox" class="user-checkbox" value="${user.userName}">
    `;
    const cb = wrap.querySelector("input");
    wrap.addEventListener("click", (e) => {
      if (e.target !== cb) cb.checked = !cb.checked;
      wrap.classList.toggle("active", cb.checked);
      updateSelectedUserDisplay();
    });
    container.appendChild(wrap);
  }

  updateSelectedUserDisplay();
}

function collectAssignedUsers() {
  return Array.from(
    document.querySelectorAll(".user-checkbox-wrapper .user-checkbox:checked")
  ).map((cb) => cb.value);
}

function updateSelectedUserDisplay() {
  const selectedContainer = document.getElementById("selectedUser");
  selectedContainer.innerHTML = "";
  collectAssignedUsers().forEach((name) => {
    const user = allUsers.find((u) => u.userName === name);
    const chip = document.createElement("div");
    chip.className = `selected-contact-chip ${user?.colorClass || "color-1"}`;
    chip.textContent = getInitials(name);
    selectedContainer.appendChild(chip);
  });
}

function addSubtask(element) {
  element.preventDefault();
  const value = $.subtaskInput.value.trim();
  if (!value) return;
  subtasks.push(value);
  $.subtaskInput.value = "";
  renderSubtasks();
}

function addSubtaskOnEnter(element) {
  if (element.key === "Enter") {
    element.preventDefault();
    addSubtask(element);
  }
}

function renderSubtasks() {
  const list = document.getElementById("subtaskList");
  list.innerHTML = "";

  subtasks.forEach((text, index) => {
    const container = document.createElement("div");
    container.className = "subtask-container";

    const textElement = document.createElement("span");
    textElement.className = "subtask-display-text";
    textElement.textContent = text;
    textElement.addEventListener("click", () => makeSubtaskEditable(index));

    const controls = document.createElement("div");
    controls.className = "subtask-controls";
    controls.innerHTML = `
      <button class="subtask-edit-button"><img class="subtask-edit-buttonImg" src="../assets/icons/edit.svg" alt="edit"></button>
      <div class="subtask-spacer-second"></div>
      <button class="subtask-delete-buttonSecond"><img class="subtask-delete-buttonImgSecond" src="../assets/icons/delete.svg" alt="delete"></button>`;

    const [editBtn, , deleteBtn] = controls.children;
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      makeSubtaskEditable(index);
    });
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      subtasks.splice(index, 1);
      renderSubtasks();
    });

    container.append(textElement, controls);
    list.appendChild(container);
  });
}

function makeSubtaskEditable(index) {
  const list = document.getElementById("subtaskList");
  const container = list.children[index];
  container.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = subtasks[index];
  input.className = "subtask-text-input";

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "subtask-button-wrapper";

  const saveBtn = document.createElement("button");
  saveBtn.innerHTML = `<img class="subtask-save-buttonImg" src="../assets/icons/check.svg" alt="save">`;
  saveBtn.className = "subtask-save-button";

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `<img class="subtask-delete-buttonImg" src="../assets/icons/delete.svg" alt="delete">`;
  deleteBtn.className = "subtask-delete-button";

  const spacer = document.createElement("div");
  spacer.className = "subtask-spacer";

  saveBtn.addEventListener("click", () => {
    subtasks[index] = input.value.trim();
    renderSubtasks();
  });
  deleteBtn.addEventListener("click", () => {
    subtasks.splice(index, 1);
    renderSubtasks();
  });

  buttonWrapper.append(deleteBtn, spacer, saveBtn);
  container.appendChild(input);
  container.appendChild(buttonWrapper);
}

function getInitials(name) {
  if (typeof name !== "string") return "";

  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts.at(-1)?.[0] || "")).toUpperCase();
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
}

function loadUserInitials() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const { userName = "Guest" } = JSON.parse(userString);
  document.getElementById("openMenu").textContent = getInitials(userName);
}

function eventHandleSearch() {
  const searchBar = document.getElementById("searchUser");
  searchBar.addEventListener("input", () => {
    const term = searchBar.value.toLowerCase();
    if (term.length < 3) {
      if (!term.length) renderUserCheckboxes(allUsers);
      return;
    }
    document.getElementById("assignedUserList").classList.add("visible");
    renderUserCheckboxes(
      allUsers.filter((u) => u.userName.toLowerCase().includes(term))
    );
  });
}

function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("d_none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("d_none");
      feedback.classList.remove("centerFeedback");
    }, 1500);
  });
}
