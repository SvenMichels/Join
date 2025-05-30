  function allowDrop(event) {
    event.preventDefault();
  }

  function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
  }

  function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    const task = document.getElementById(taskId);
    const targetList = event.currentTarget;
    targetList.appendChild(task);
  }

  // Demo: Add sample task on load
  window.addEventListener('DOMContentLoaded', () => {
    const task = document.createElement('article');
    task.id = 'task-1';
    task.className = 'task';
    task.draggable = true;
    task.ondragstart = drag;
    task.textContent = 'Log In erstellen';
    document.querySelector('[data-status="todo"] .task-list').appendChild(task);
  });