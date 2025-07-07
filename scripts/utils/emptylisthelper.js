const listConfigs = [
  {
    listId: 'todoList',
    headerPlaceholder: '[data-status="todo"] .empty-placeholder',
    msg: 'Kein „To Do“-Task vorhanden.'
  },
  {
    listId: 'inProgressList',
    headerPlaceholder: '[data-status="in-progress"] .empty-placeholder',
    msg: 'Kein „In Progress“-Task vorhanden.'
  },
  {
    listId: 'awaitList',
    headerPlaceholder: '[data-status="await"] .empty-placeholder',
    msg: 'Kein „Await Feedback“-Task vorhanden.'
  },
  {
    listId: 'doneList',
    headerPlaceholder: '[data-status="done"] .empty-placeholder',
    msg: 'Kein „Done“-Task vorhanden.'
  },
];

export function updateEmptyLists() {
  listConfigs.forEach(({ listId, headerPlaceholder, msg }) => {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const headerPH = document.querySelector(headerPlaceholder);
    const dynamicPH = listEl.querySelector('.empty-placeholder');
    const hasRealTasks = [...listEl.children].some(el => !el.classList.contains('empty-placeholder'));

    if (hasRealTasks) {
     updeateEmptyListsTrue();
    } else {
     updateEmptyListsFalse()
    }
  });
}

function updeateEmptyListsTrue(){
   if (headerPH) headerPH.style.display = 'none';
      if (dynamicPH) dynamicPH.remove();
}

function updateEmptyListsFalse() {
   if (headerPH) headerPH.style.display = '';
      if (!headerPH && !dynamicPH) {
        const ph = document.createElement('div');
        ph.className = 'empty-placeholder';
        ph.textContent = msg;
        listEl.appendChild(ph);
      }
}