export function setupDropdown(triggerSelector, menuSelector) {
  const trigger = document.querySelector(triggerSelector)
  const menu = document.querySelector(menuSelector)

  function onTriggerClick(e) {
    e.stopPropagation()
    menu.classList.toggle('dp-none')
  }

  function onMenuClick(e) {
    e.stopPropagation()
  }

  function onDocumentClick() {
    menu.classList.add('dp-none')
  }

  trigger.addEventListener('click', onTriggerClick)
  menu.addEventListener('click', onMenuClick)
  document.addEventListener('click', onDocumentClick)
}