/**
 * Priority icons
 */
export const PRIORITY_ICONS = {
  urgent: "../assets/icons/urgent_red.svg",
  medium: "../assets/icons/medium_yellow.svg", 
  low: "../assets/icons/low_green.svg"
};

/**
 * White variants for dark themes
 */
export const PRIORITY_ICONS_WHITE = {
  urgent: "../assets/icons/urgent_white.svg",
  medium: "../assets/icons/medium_white.svg",
  low: "../assets/icons/low_white.svg"
};

/**
 * Modal priority icons (normal + white variants)
 */
export const PRIORITY_ICONS_MODAL = {
  urgent: [
    "../assets/icons/urgent_red.svg",
    "../assets/icons/urgent_white.svg",
  ],
  medium: [
    "../assets/icons/medium_yellow.svg", 
    "../assets/icons/medium_white.svg",
  ],
  low: [
    "../assets/icons/low_green.svg", 
    "../assets/icons/low_white.svg"
  ],
};

/**
 * Task category icons
 */
export const CATEGORY_ICONS = {
  User_Story: "propertyuserstory.svg",
  Technical_Task: "propertytechnicaltask.svg",
};

/**
 * Task status columns
 */
export const STATUS_MAP = {
  todo: "todoList",
  "in-progress": "inProgressList", 
  await: "awaitList",
  done: "doneList",
};

/**
 * Priority button CSS classes
 */
export const PRIORITY_CLASSES = {
  urgent: "prioUrgentBtnActive",
  medium: "prioMediumBtnActive", 
  low: "prioLowBtnActive"
};

// Get priority icon based on type and color
export function getPriorityIcon(priority, isWhite = false) {
  const iconSet = isWhite ? PRIORITY_ICONS_WHITE : PRIORITY_ICONS;
  return iconSet[priority] || iconSet.medium;
}

// Get category icon with fallback
export function getCategoryIcon(category) {
  return `../assets/icons/${CATEGORY_ICONS[category] || "defaulticon.svg"}`;
}
