export function boardTemplate(task) {
    const element = document.createElement("article");
    return `
    <img src="../assets/icons/propertyuserstory.svg" alt="">
    <h3 class="">${task.title}</h3>
    <p>${task.description}</p>
    <div class="meta">
      <span>Fällig: ${task.dueDate}</span>
      <span>Prio: ${task.prio}</span>
    </div>
  `
}