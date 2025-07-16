import { isMobileView } from "../utils/mobileView.js";
import { editContact, deleteContact } from "../../contactPage/contacts.js";

export function initializeBackButton() {
  const singleContactEl = document.querySelector('.singleContact');
  const backBtn = document.getElementById('closeSingleMobile');
  const fabContainer = document.getElementById('fabContainer');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    singleContactEl.classList.remove('slide-in');
    singleContactEl.classList.add('slide-out');

    setTimeout(() => {
      singleContactEl.style.display = 'none';
      if (fabContainer) fabContainer.style.display = 'none';
    }, 300);
  });

}


export function initializeFabMenu(id) {
  const elements = getFabElements();
  if (!elements) return;
  setupFabToggle(elements);
  setupFabActions(elements, id);
}

function getFabElements() {
  const container = document.getElementById('fabContainer');
  if (!container || !isMobileView()) return null;
  return {
    container,
    toggle:  document.getElementById('fabToggle'),
    editBtn:  document.getElementById('fabEdit'),
    delBtn:   document.getElementById('fabDelete'),
  };
}

function setupFabToggle({ container, toggle }) {
    container.classList.remove('open');
    toggle.addEventListener('click', () =>
        container.classList.toggle('open')
    );
}

function setupFabActions({ container, editBtn, delBtn }, id) {
  editBtn.addEventListener('click', () => {
    editContact(id);
    container.classList.remove('open');
  });
  delBtn.addEventListener('click', async () => {
    await deleteContact(id);
    container.classList.remove('open');
  });
}

