import { requestData } from "../scripts/firebase.js";

export function initTaskFloat() {
  cacheDom();
  if (!$.modal) return Promise.resolve();

  loadUserInitialsModal();
  eventHandleSearchModal();

  return initFormModal();
}
window.initTaskFloat = initTaskFloat;

const $ = {};
document.addEventListener("DOMContentLoaded", initTaskFloat);

function cacheDom() {
  $.modal = document.querySelector(".form-wrapper-modal");
  if (!$.modal) return;

  $.closeBtn = $.modal?.querySelector(".task-h1-container-modal button");
  $.form = document.getElementById("taskForm-modal");
  $.date = document.getElementById("task-date-modal");
  $.subInput = document.getElementById("subtask-modal");
  $.subAddBtn = $.modal?.querySelector(".subtask-add-button-modal");
  $.assignBtn = $.modal?.querySelector(".assigned-userlist-button-modal");
  $.assignImg = document.getElementById("assignedBtnImg-modal");

  if ($.date) {
    $.date.min = new Date().toISOString().split("T")[0];
  }

  $.closeBtn?.addEventListener("click", closeModal);
  $.form?.addEventListener("submit", handleSubmitModal);
  $.subAddBtn?.addEventListener("click", addSubtaskModal);
  $.subInput?.addEventListener("keydown", addSubtaskOnEnterModal);
  $.assignBtn?.addEventListener("click", toggleUserListModal);
}

let currentPrioModal = "medium";
let allUsersModal = [];
let subtasksModal = [];

window.selectPriorityModal = selectPriorityModal;
window.updateSelectedModal = updateSelectedModal;
window.renderSubtasksModal = renderSubtasksModal;

const priorityIconsModal = {
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

function selectPriorityModal(prio) {
  currentPrioModal = prio;

  const ids = {
    urgent: "urgent-task-modal",
    medium: "medium-task-modal",
    low: "low-task-modal",
  };

  Object.entries(ids).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    const img = document.getElementById(`${key}-task-img-modal`);
    btn?.classList.remove(
      "prioUrgentBtnActive",
      "prioMediumBtnActive",
      "prioLowBtnActive"
    );
    if (img) img.src = priorityIconsModal[key][0];
  });

  const activeBtn = document.getElementById(ids[prio]);
  const activeImg = document.getElementById(`${prio}-task-img-modal`);
  activeBtn?.classList.add(
    {
      urgent: "prioUrgentBtnActive",
      medium: "prioMediumBtnActive",
      low: "prioLowBtnActive",
    }[prio]
  );
  if (activeImg) activeImg.src = priorityIconsModal[prio][1];
}

export async function initFormModal() {
  await loadAndRenderUsersModal();
  selectPriorityModal("medium");

  const cat = document.getElementById("category-modal");
  const submit = $.form?.querySelector(".create-button");
  const toggle = () => (submit.disabled = cat.value.trim() === "");
  toggle();
  cat.addEventListener("change", toggle);

  ["urgent", "medium", "low"].forEach((p) =>
    document
      .getElementById(`${p}-task-modal`)
      ?.addEventListener("click", () => selectPriorityModal(p))
  );
}

async function handleSubmitModal(e) {
  e.preventDefault();
  const task = collectTaskDataModal(e.target);
  if (!validateTaskModal(task)) return;

  try {
    await saveTaskModal(task);

    $.form.removeAttribute("data-task-id");
    $.form.removeAttribute("data-task-status");

    window.dispatchEvent(
      new CustomEvent(window.isEditMode ? "taskUpdated" : "taskCreated", {
        detail: task,
      })
    );

    window.editingTaskId = null;
    window.isEditMode = false;
    subtasksModal = [];
    $.form.reset();
    selectPriorityModal("medium");
    closeModal();
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
  }
}

function collectTaskDataModal(form) {
  const id = form.dataset.taskId || Date.now();
  const status = form.dataset.taskStatus || "todo";

  return {
    id,
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentPrioModal,
    assigned: getChecked(".user-checkbox-modal"),
    subtasks: [...subtasksModal],
    status,
  };
}

function validateTaskModal(task) {
  let valid = true;
  const show = (id, condition) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = condition ? "inline" : "none";
    if (condition) valid = false;
  };

  show("titleAlert-modal", !task.title);
  show("dateAlert-modal", !task.dueDate);
  show("categoryAlert-modal", !task.category);

  return valid;
}

const saveTaskModal = (task) => requestData("PUT", `/tasks/${task.id}`, task);

async function loadAndRenderUsersModal() {
  const { data = {} } = await requestData("GET", "/users");
  allUsersModal = Object.entries(data).map(([id, u]) => ({ id, ...u }));
  renderUserCheckboxesModal(allUsersModal);
}

function renderUserCheckboxesModal(arr) {
  const list = document.getElementById("assignedUserList-modal");
  if (!list) return;
  list.innerHTML = "";
  arr.forEach((u) => {
    const wrap = document.createElement("div");
    wrap.className = "user-checkbox-wrapper-modal";
    wrap.innerHTML = `
      <div class="user-info-wrapper">
        <div class="selected-contact-chip" style="background:${rndColor()}">${initials(
      u.userName
    )}</div>
        <label>${u.userName}</label>
      </div>
      <input type="checkbox" class="user-checkbox-modal" value="${u.userName}">
    `;
    wrap.addEventListener("click", (ev) => {
      const cb = wrap.querySelector("input");
      if (ev.target !== cb) cb.checked = !cb.checked;
      wrap.classList.toggle("active", cb.checked);
      updateSelectedModal();
    });
    list.appendChild(wrap);
  });
  updateSelectedModal();
}

function toggleUserListModal(e) {
  e.preventDefault();
  const list = document.getElementById("assignedUserList-modal");
  list.classList.toggle("visible");
  $.assignImg?.classList.toggle("rotated", list.classList.contains("visible"));
}

function getChecked(sel) {
  return [...document.querySelectorAll(sel + ":checked")].map((c) => c.value);
}

function updateSelectedModal() {
  const tgt = document.getElementById("selectedUser-modal");
  tgt.innerHTML = "";
  getChecked(".user-checkbox-modal").forEach((n) => {
    tgt.insertAdjacentHTML(
      "beforeend",
      `<div class="selected-contact-chip" style="background:${rndColor()}">${initials(
        n
      )}</div>`
    );
  });
}

function addSubtaskModal(ev) {
  ev.preventDefault();
  const v = $.subInput.value.trim();
  if (!v) return;
  subtasksModal.push(v);
  $.subInput.value = "";
  renderSubtasksModal();
}

function addSubtaskOnEnterModal(ev) {
  if (ev.key === "Enter") {
    ev.preventDefault();
    addSubtaskModal(ev);
  }
}

function renderSubtasksModal() {
  const list = document.getElementById("subtaskList-modal");
  list.innerHTML = subtasksModal
    .map(
      (t, i) => `
      <div class="subtask-container">
        <span class="subtask-display-text" data-idx="${i}">${t}</span>
        <div class="subtask-controls">
          <button data-edit="${i}"><img src="../assets/icons/edit.svg" /></button>
          <div class="subtask-spacer-second"></div>
          <button data-del="${i}"><img src="../assets/icons/delete.svg" /></button>
        </div>
      </div>
    `
    )
    .join("");

  list.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => {
      subtasksModal.splice(+b.dataset.del, 1);
      renderSubtasksModal();
    })
  );

  list
    .querySelectorAll("[data-edit]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        makeSubtaskEditableModal(+b.dataset.edit)
      )
    );
}

function makeSubtaskEditableModal(idx) {
  const list = document.getElementById("subtaskList-modal");
  const item = list.children[idx];
  item.innerHTML = `
    <input type="text" class="subtask-text-input" value="${subtasksModal[idx]}">
    <div class="subtask-button-wrapper">
      <button data-save><img src="../assets/icons/check.svg" /></button>
      <div class="subtask-spacer"></div>
      <button data-del><img src="../assets/icons/delete.svg" /></button>
    </div>
  `;
  const inp = item.querySelector("input");
  item.querySelector("[data-save]").addEventListener("click", () => {
    subtasksModal[idx] = inp.value.trim();
    renderSubtasksModal();
  });
  item.querySelector("[data-del]").addEventListener("click", () => {
    subtasksModal.splice(idx, 1);
    renderSubtasksModal();
  });
}

const initials = (n) =>
  (n || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
const rndColor = () => `hsl(${Math.random() * 360},70%,80%)`;

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.add("d_none");
    overlay.innerHTML = "";
  }
}

function loadUserInitialsModal() {
  const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const btn = $.modal?.querySelector(".profile-button-modal");
  if (btn && u.userName) btn.textContent = initials(u.userName);
}

function eventHandleSearchModal() {
  const search = document.getElementById("searchUser-modal");
  search?.addEventListener("input", () => {
    const t = search.value.toLowerCase();
    renderUserCheckboxesModal(
      !t
        ? allUsersModal
        : allUsersModal.filter((u) => u.userName.toLowerCase().includes(t))
    );
  });
}

export function prefillModalWithTaskData(task) {
  document.getElementById("task-title-modal").value = task.title;
  document.getElementById("task-description-modal").value = task.description;

  document.getElementById("task-date-modal").value = task.dueDate;
  document.getElementById("category-modal").value = task.category;
  selectPriorityModal((task.prio || "medium").toLowerCase());

  document
    .querySelectorAll(".user-checkbox-modal")
    .forEach((cb) => (cb.checked = false));

  (task.assigned || []).forEach((name) => {
    const cb = [...document.querySelectorAll(".user-checkbox-modal")].find(
      (c) => c.value === name
    );
    if (cb) {
      cb.checked = true;
      cb.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
    }
  });
  updateSelectedModal();

  subtasksModal = [...(task.subtasks || [])];
  renderSubtasksModal();
}

window.prefillModalWithTaskData = prefillModalWithTaskData;

window.initTaskFloat = initTaskFloat;

window.selectPriorityModal = selectPriorityModal;
window.updateSelectedModal = updateSelectedModal;
window.renderSubtasksModal = renderSubtasksModal;
window.editingTaskId = null;
window.isEditMode = false;

window.setSubtaskState = (arr) => {
  subtasksModal = [...arr];
};
window.getSubtaskState = () => subtasksModal;
