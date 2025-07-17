import { setText } from './startpageUtils.js'
import { countBy, earliestDate } from './startpageService.js'

/**
 * Schreibt die zusammengefassten Task-Daten in die entsprechenden DOM-Elemente.
 * @param {Array<Object>} tasks - Das Array von Task-Objekten.
 */
export function renderSummary(tasks) {
  setText('.todoTaskAmount', countBy(tasks, 'status', 'todo'))
  setText('.doneTaskAmount', countBy(tasks, 'status', 'done'))
  setText('.taskInProgress', countBy(tasks, 'status', 'in-progress'))
  setText('.awaitingFeedback', countBy(tasks, 'status', 'await'))
  setText('.taskInBoard', tasks.length)
  setText('.urgentTaskAmount', countBy(tasks, 'prio', 'high'))
  const date = earliestDate(tasks, 'high')
  setText(
    '.urgentTaskDate',
    date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline'
  )
}
