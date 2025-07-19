/**
 * Search functionality for tasks
 */

/**
 * Sets up search functionality
 * @param {Object} loadedTasksRef - Reference to loaded tasks
 */
export function setupSearch(loadedTasksRef) {
  const inputIcon = document.getElementById("inputIcon");
  if (inputIcon) {
    inputIcon.addEventListener("click", () => searchTasks(loadedTasksRef));
  }
}

/**
 * Searches tasks based on input field
 * @param {Object} loadedTasksRef - Reference to loaded tasks
 */
function searchTasks(loadedTasksRef) {
  const searchInput = document.getElementById("searchFieldInput");
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  Object.values(loadedTasksRef).forEach((task) => {
    const taskElement = document.getElementById(`task-${task.id}`);
    if (!taskElement) return;
    
    const isVisible = taskMatchesSearchTerm(task, searchTerm);
    taskElement.style.display = isVisible ? "flex" : "none";
  });
}

/**
 * Checks if task matches search term
 * @param {Object} task - Task object
 * @param {string} searchTerm - Search term
 * @returns {boolean} True if task matches
 */
function taskMatchesSearchTerm(task, searchTerm) {
  const matchesTitle = task.title.toLowerCase().includes(searchTerm);
  const matchesDescription = task.description.toLowerCase().includes(searchTerm);
  return matchesTitle || matchesDescription;
}
