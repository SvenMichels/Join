const listConfigs = [
  {
    listId: 'todoList',
    headerPlaceholder: '[data-status="todo"] .empty-placeholder',
    msg: 'No tasks To do'
  },
  {
    listId: 'inProgressList',
    headerPlaceholder: '[data-status="in-progress"] .empty-placeholder',
    msg: 'No tasks in Progress'
  },
  {
    listId: 'awaitList',
    headerPlaceholder: '[data-status="await"] .empty-placeholder',
    msg: 'No tasks Awaiting'
  },
  {
    listId: 'doneList',
    headerPlaceholder: '[data-status="done"] .empty-placeholder',
    msg: 'No tasks Done'
  },
];

export function updateEmptyLists() {
  listConfigs.forEach(({ listId, headerPlaceholder, msg }) => {
    const listEl    = document.getElementById(listId);
    if (!listEl) return;

    const headerPH  = document.querySelector(headerPlaceholder);
    const dynamicPH = listEl.querySelector(".empty-placeholder");
    const hasRealTasks = [...listEl.children]
      .some(el => !el.classList.contains("empty-placeholder"));

    if (hasRealTasks) {
      updateEmptyListsTrue(headerPH, dynamicPH);
    } else {
      updateEmptyListsFalse(headerPH, dynamicPH, listEl, msg);
    }
  });
}

function updateEmptyListsTrue(headerPH, dynamicPH) {
  if (headerPH)  headerPH.style.display = "none";
  if (dynamicPH) dynamicPH.remove();
}

function updateEmptyListsFalse(headerPH, dynamicPH, listEl, msg) {
  if (headerPH)  headerPH.style.display = "";

  if (!dynamicPH) {
    const ph = document.createElement("div");
    ph.className  = "empty-placeholder";
    ph.textContent = msg;
    listEl.appendChild(ph);
  }
}