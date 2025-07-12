import { requestData } from "../scripts/firebase.js";

function toArray(val) {
  if (Array.isArray(val))             return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string")        return val.split(",").map(s => s.trim());
  return [];
}

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
let subtaskDoneModal = [];

window.subtasksModal = subtasksModal;
window.subtaskDoneModal = subtaskDoneModal;

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

  const task = {
    id,
    title: form.taskTitle.value.trim(),
    description: form.taskDescription.value.trim(),
    dueDate: form.taskDate.value,
    category: form.category.value,
    prio: currentPrioModal,
    assigned: getChecked(".user-checkbox-modal"),
    subtasks: [...subtasksModal],
    subtaskDone: [...subtaskDoneModal],
    status,
  };

  return task;
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
  try {
    const { data = {} } = await requestData("GET", "/users");
    const listObj = data && typeof data === "object" ? data : {};

    allUsersModal = Object.entries(listObj).map(([id, u]) => ({ id, ...u }));

    if (allUsersModal.length === 0) {
      const me = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (me.userName) allUsersModal.push({ id: me.id || "me", userName: me.userName });
    }

    renderUserCheckboxesModal(allUsersModal);
  } catch (err) {
    console.error("Fehler beim Laden der Nutzer (Modal):", err);
  }
}

function renderUserCheckboxesModal(arr) {
  const list = document.getElementById("assignedUserList-modal");
  if (!list) return;

  list.innerHTML = "";

  const seen = new Set();

  arr.forEach(({ userName }) => {
    if (seen.has(userName)) return;
    seen.add(userName);

    const wrap = document.createElement("div");
    wrap.className = "user-checkbox-wrapper-modal";
    wrap.innerHTML = `
      <div class="user-info-wrapper">
        <div class="selected-contact-chip" style="background:${rndColor()}">${initials(userName)}</div>
        <label>${userName}</label>
      </div>
      <input type="checkbox" class="user-checkbox-modal" value="${userName}">
    `;
    const cb = wrap.querySelector("input");
    wrap.addEventListener("click", (ev) => {
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
  subtaskDoneModal.push(false);

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
  list.innerHTML = "";

  subtasksModal.forEach((t, i) => {
    const isChecked = subtaskDoneModal[i] ? "checked" : "";

    list.insertAdjacentHTML("beforeend", `
      <div class="subtask-container-modal">
        <input type="checkbox" class="subtask-checkbox-modal" data-index="${i}" ${isChecked}>
        <p class="subtask-display-text-modal">${t}</p>
        <div class="subtask-controls-modal">
          <button class="subtask-edit-button-modal" data-edit="${i}"><img class="subtask-edit-button-images-modal" src="../assets/icons/edit.svg" /></button>
          <div class="subtask-spacer-second-modal"></div>
          <button class="subtask-delete-button-second-modal" data-del="${i}"><img class="subtask-edit-button-images-modal" src="../assets/icons/delete.svg" /></button>
        </div>
      </div>
    `);
  });

  list.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => {
      subtasksModal.splice(+b.dataset.del, 1);
      subtaskDoneModal.splice(+b.dataset.del, 1);
      renderSubtasksModal();
    })
  );

  list.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () =>
      makeSubtaskEditableModal(+b.dataset.edit)
    )
  );

  list.querySelectorAll(".subtask-checkbox-modal").forEach((cb) =>
    cb.addEventListener("change", (e) => {
      const idx = +e.target.dataset.index;
      subtaskDoneModal[idx] = e.target.checked;
    })
  );
}

function makeSubtaskEditableModal(idx) {
  const list = document.getElementById("subtaskList-modal");
  const item = list.children[idx];
  item.innerHTML = `
    <input type="text" class="subtask-text-input-modal" value="${subtasksModal[idx]}">
    <div class="subtask-button-wrapper-modal">
    <button class="subtask-delete-button-modal" data-del><img class="subtask-delete-button-images-modal" src="../assets/icons/delete.svg" /></button>
    <div class="subtask-spacer-modal"></div>
    <button class="subtask-save-button-modal" data-save><img class="subtask-delete-button-images-modal" src="../assets/icons/check.svg" /></button>
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
  const modal = document.getElementById("taskDetailModal");
  const overlay = document.getElementById("modal-overlay");
  if (modal?.close) modal.close();
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

function prefillModalWithTaskData(task) {
  document.getElementById("task-title-modal").value = task.title;
  document.getElementById("task-description-modal").value = task.description;
  document.getElementById("task-date-modal").value = task.dueDate;
  document.getElementById("category-modal").value = task.category;
  selectPriorityModal((task.prio || "medium").toLowerCase());

  document.querySelectorAll(".user-checkbox-modal").forEach(cb => cb.checked = false);
  toArray(task.assigned).forEach(name => {
    const cb = [...document.querySelectorAll(".user-checkbox-modal")].find(c => c.value === name);
    if (cb) {
      cb.checked = true;
      cb.closest(".user-checkbox-wrapper-modal")?.classList.add("active");
    }
  });
  updateSelectedModal();

  window.subtasksModal = [...(task.subtasks || [])];
  window.subtaskDoneModal = [...(task.subtaskDone || new Array(window.subtasksModal.length).fill(false))];

  subtasksModal = window.subtasksModal;
  subtaskDoneModal = window.subtaskDoneModal;

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


let pendingTaskUpdates = {};

document.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("modal-subtask-checkbox")) return;

  const index = parseInt(e.target.dataset.index);
  const taskId = e.target.dataset.taskId;
  const checked = e.target.checked;

  if (!taskId || isNaN(index)) return;

  if (!pendingTaskUpdates[taskId]) {
    try {
      const { data: task } = await requestData("GET", `/tasks/${taskId}`);
      task.subtaskDone = task.subtaskDone || new Array(task.subtasks.length).fill(false);
      pendingTaskUpdates[taskId] = task;
    } catch (err) {
      console.error("Fehler beim Laden des Tasks:", err);
      return;
    }
  }

  pendingTaskUpdates[taskId].subtaskDone[index] = checked;
});

const modal = document.getElementById("taskDetailModal");
if (modal) {
  modal.addEventListener("close", async () => {
    for (const [taskId, updatedTask] of Object.entries(pendingTaskUpdates)) {
      try {
        await requestData("PATCH", `/tasks/${taskId}`, {
          subtaskDone: updatedTask.subtaskDone,
        });
      } catch (err) {
        console.error("Fehler beim Speichern des Tasks:", err);
      }
    }
    pendingTaskUpdates = {};

    if (typeof window.renderBoard === "function") {
      window.renderBoard();
    } else {
      location.reload();
    }
  });
}

document.addEventListener("click", (event) => {
  const detailModal = document.getElementById("taskDetailModal");
  const formModal = document.querySelector(".form-wrapper-modal");
  const overlay = document.getElementById("modal-overlay");

  const isSubtaskButtonClick =
    event.target.closest(".subtask-edit-button-modal") ||
    event.target.closest(".subtask-delete-button-second-modal") ||
    event.target.closest(".subtask-save-button-modal") ||
    event.target.closest(".subtask-delete-button-modal") ||
    event.target.closest(".subtask-text-input-modal");

  if (isSubtaskButtonClick) return;

  const clickedOutsideDetail =
    detailModal?.open && !detailModal.contains(event.target) &&
    !event.composedPath().includes(detailModal);

  const clickedOutsideForm =
    formModal &&
    getComputedStyle(formModal).display !== "none" &&
    !formModal.contains(event.target);

  if (clickedOutsideDetail || clickedOutsideForm) {
    if (detailModal?.open && typeof detailModal.close === "function") {
      detailModal.close();
    }

    if (formModal) formModal.style.display = "none";

    if (overlay) {
      overlay.classList.add("d_none");
      overlay.innerHTML = "";
    }

    window.isEditMode = false;
    window.editingTaskId = null;

    const form = document.getElementById("taskForm");
    form?.reset();
    form?.removeAttribute("data-task-id");
    form?.removeAttribute("data-task-status");

    window.subtasksModal = [];
    window.subtaskDoneModal = [];
  }
});