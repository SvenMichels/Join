// Lädt Templates dynamisch in das Haupt-Target

import { getLoginTemplate } from './templates/loginTemplate.js';
import { getMenuTemplate } from './templates/menuTemplate.js';
import { getBoardTemplate } from './templates/boardTemplate.js';
import { getAddTaskTemplate } from './templates/addTaskTemplate.js';

export const loadTemplates = (view = 'login') => {
  const container = document.getElementById('app');
  switch (view) {
    case 'login':
      container.innerHTML = getLoginTemplate();
      break;
    case 'menu':
      container.innerHTML = getMenuTemplate();
      break;
    case 'board':
      container.innerHTML = getBoardTemplate();
      break;
    case 'add-task':
      container.innerHTML = getAddTaskTemplate();
      break;
    default:
      container.innerHTML = '<p>404 – Template nicht gefunden</p>';
  }
};
