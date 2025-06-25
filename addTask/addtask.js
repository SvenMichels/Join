import { requestData } from "../scripts/firebase.js";

let currentActivePriority = "";
const subtaskInput = document.getElementById("subtask");

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

  document.getElementById('taskDate').min = new Date().toISOString().split('T')[0];
  loadUserInitials();
});

function initForm() {
  loadAndRenderUsers();
  let form = document.getElementById('taskForm');
  form.addEventListener('submit', (event) => {
    console.log('listener click');
    handleFormSubmit(event);
  });
  // document
  //   .getElementById("taskForm")
  //   .addEventListener("submit", handleFormSubmit);

  ["urgent", "medium", "low"].forEach((priority) => {
    const button = document.getElementById(`${priority}-task`);
    if (button) {
      button.addEventListener("click", (event) => {
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
  console.log('click');
  const form = event.target;
  const task = collectTaskData(form);
  let valid = isTaskValid(task);
  if (valid) {
    saveTask(task);
    // showUserFeedback();
  }else;
  isTaskValid(task);
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
    subtasks: form.subtasks,
    status: "todo",
  };
}

function isTaskValid(task) {
  let isValid = true;
 console.log('check', task, 'valid:', isValid);
  const titleAlert = document.getElementById('titleAlert');
  if (!task.title || task.title.trim() === '') {
    titleAlert.style.display = 'inline';
    isValid = false;
  } else {
    titleAlert.style.display = 'none';
  }

  const dateAlert = document.getElementById('dateAlert');
  if (!task.dueDate) {
    dateAlert.style.display = 'inline';
    isValid = false;
  } else {
    dateAlert.style.display = 'none';
  }

  const categoryAlert = document.getElementById('categoryAlert');
  if (!task.category) {
    categoryAlert.style.display = 'inline';
    isValid = false;
  } else {
    categoryAlert.style.display = 'none';
  }
  return isValid;
}

async function saveTask(task) {
  try {
    const path = `/tasks/${task.id}`;
    await requestData("PUT", path, task);
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

let subtasks = [];

document.querySelector(".subtaskAddButton").addEventListener("click", () => {
  const input = document.getElementById("subtask");
  const value = input.value.trim();
  if (value) {
    subtasks.push(value);
    input.value = "";
    renderSubtasks(subtasks);
  }
});

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

    updateSelectedUserDisplay();
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
    subtasks.push(taskText);
    subtaskInput.value = "";
    renderSubtasks();
  }
});

function renderSubtasks() {
  const subtaskList = document.getElementById("subtaskList");
  subtaskList.innerHTML = "";

  subtasks.forEach((subtask, index) => {
    const container = document.createElement("list");
    container.className = "subtaskContainer";

    const textElement = document.createElement("list");
    textElement.textContent = subtask;
    textElement.className = "subtaskDisplayText";

    textElement.addEventListener("click", () => {
    renderEditableSubtask(container, index);
    });

    const controls = document.createElement("div");
    controls.className = "subtaskControls";

    const editElement = document.createElement("button");
    editElement.innerHTML =
      '<img class="subtaskEditBtnImg" src="../assets/icons/edit.svg" alt="edit"> ';
    editElement.className = "subtaskEditBtn";

    editElement.addEventListener("click", (e) => {
      e.preventDefault();
      renderEditableSubtask(container, index);
    });

    const spacer = document.createElement("div");
    spacer.innerHTML = "";
    spacer.className = "subtaskSpacerSecond";

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML =
      '<img class="subtaskDeleteBtnImgSecond" src="../assets/icons/delete.svg" alt="Delete"> ';
    deleteBtn.className = "subtaskDeleteBtnSecond";

    deleteBtn.addEventListener("click", () => {
      subtasks.splice(index, 1);
      renderSubtasks();
    });
    controls.appendChild(editElement);
    controls.appendChild(spacer);
    controls.appendChild(deleteBtn);

    container.appendChild(textElement);
    container.appendChild(controls);
    subtaskList.appendChild(container);
  });
}

function renderEditableSubtask(container, index) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "subtaskEditWrapper";

  const input = document.createElement("input");
  input.type = "text";
  input.value = subtasks[index];
  input.className = "subtaskTextInput";

  const saveBtn = document.createElement("button");
  saveBtn.innerHTML =
    '<img class="subtaskSaveBtnImg" src="../assets/icons/check.svg" alt="Save"> ';
  saveBtn.className = "subtaskSaveBtn";

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML =
    '<img class="subtaskDeleteBtnImg" src="../assets/icons/delete.svg" alt="Delete"> ';
  deleteBtn.className = "subtaskDeleteBtn";

  const spacer = document.createElement("div");
  spacer.innerHTML = "";
  spacer.className = "subtaskSpacer";

  saveBtn.addEventListener("click", () => {
    subtasks[index] = input.value.trim();
    renderSubtasks();
  });

  deleteBtn.addEventListener("click", () => {
    subtasks.splice(index, 1);
    renderSubtasks();
  });

  wrapper.appendChild(input);
  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(spacer);
  wrapper.appendChild(saveBtn);
  container.appendChild(wrapper);
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

function loadUserInitials() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const user = JSON.parse(userString);
  const name = user.userName || "Guest";
  const profileBtn = document.getElementById("openMenu");
  if (profileBtn) profileBtn.textContent = getInitials(name);
}

// function showUserFeedback() {
//   const feedback = document.getElementById("userFeedback");
//   if (!feedback) return;

//   feedback.classList.remove("d_none");
//   feedback.classList.add("centerFeedback");

//   feedback.addEventListener("animationend", () => {
//     setTimeout(() => {
//       feedback.classList.add("d_none");
//       feedback.classList.remove("centerFeedback");
//     }, 1500);
//   });
// }
