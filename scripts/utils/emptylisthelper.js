const taskStatusConfigurationsList = [
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
  for (let configIndex = 0; configIndex < taskStatusConfigurationsList.length; configIndex++) {
    const currentConfiguration = taskStatusConfigurationsList[configIndex];
    const { listId, headerPlaceholder, msg } = currentConfiguration;
    
    const targetListElement = document.getElementById(listId);
    if (!targetListElement) continue;

    const headerPlaceholderElement = document.querySelector(headerPlaceholder);
    const dynamicPlaceholderElement = targetListElement.querySelector(".empty-placeholder");

    const allChildElementsInList = [];
    for (let childIndex = 0; childIndex < targetListElement.children.length; childIndex++) {
      allChildElementsInList.push(targetListElement.children[childIndex]);
    }
    
    let hasActualTaskElements = false;
    for (let elementIndex = 0; elementIndex < allChildElementsInList.length; elementIndex++) {
      const currentChildElement = allChildElementsInList[elementIndex];
      if (!currentChildElement.classList.contains("empty-placeholder")) {
        hasActualTaskElements = true;
        break;
      }
    }

    if (hasActualTaskElements) {
      updateEmptyListsTrue(headerPlaceholderElement, dynamicPlaceholderElement);
    } else {
      updateEmptyListsFalse(headerPlaceholderElement, dynamicPlaceholderElement, targetListElement, msg);
    }
  }
}

function updateEmptyListsTrue(headerPlaceholderElement, dynamicPlaceholderElement) {
  if (headerPlaceholderElement) headerPlaceholderElement.style.display = "none";
  if (dynamicPlaceholderElement) dynamicPlaceholderElement.remove();
}

function updateEmptyListsFalse(headerPlaceholderElement, dynamicPlaceholderElement, targetListElement, emptyMessage) {
  if (headerPlaceholderElement) headerPlaceholderElement.style.display = "";

  if (!dynamicPlaceholderElement) {
    const newPlaceholderElement = document.createElement("div");
    newPlaceholderElement.className = "empty-placeholder";
    newPlaceholderElement.textContent = emptyMessage;
    targetListElement.appendChild(newPlaceholderElement);
  }
}