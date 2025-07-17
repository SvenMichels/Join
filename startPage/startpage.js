import { fetchTasks } from './startpageService.js'
import { renderSummary } from './startpageRerender.js'
import { highlightActiveLinks } from "../scripts/utils/navUtils.js";
import { $, on, setText, getInitials } from './startpageUtils.js'
import { setupDropdown } from '../scripts/ui/dropdown.js';

/**
 * Initializes the start page by binding the DOMContentLoaded event.
 */
function initStartPage() {
  on(document, 'DOMContentLoaded', () => {
    updateUserGreeting()
    updateSummary()
    handleMobileGreetingFade()
    setupDropdown('#openMenu', '#dropDownMenu')
    highlightActiveLinks();
  })
}

/**
 * Reads the current user from localStorage and updates the greeting.
 */
function updateUserGreeting() {
  const raw = localStorage.getItem('currentUser')
  if (!raw) return
  let user
  try {
    user = JSON.parse(raw)
  } catch {
    return
  }
  const name = user.userName || 'Guest'
  renderGreeting(name)
}

/**
 * Renders a greeting message based on the current hour and the user's name.
 * @param {string} name - The user's name.
 */
function renderGreeting(name) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  $('.greetings > p:first-child').textContent = `${greeting},`
  $('.greetings .username').textContent = name
  $('#openMenu').textContent = getInitials(name)
}

/**
 * Fetches tasks and renders the summary, catching any errors.
 * @async
 */
async function updateSummary() {
  try {
    const tasks = await fetchTasks()
    renderSummary(tasks)
  } catch (err) {
    console.error("Fehler beim Laden der Summary:", err);
  }
}

/**
 * Hides the greeting message on mobile screens and updates visibility on window resize.
 */
function handleMobileGreetingFade() {
  const el = $('.greetings')
  const hide = () => window.innerWidth < 767 && el.classList.add('hidden')
  hide()
  on(window, 'resize', hide)
}

window.fetchTasks      = fetchTasks
window.updateSummary   = updateSummary
initStartPage()

