import { toArray } from "../scripts/utils/taskUtils.js";

// Available category icons for tasks
const AVAILABLE_CATEGORY_ICONS = {
  User_Story: "propertyuserstory.svg",
  Technical_Task: "propertytechnicaltask.svg",
};

// Priority level icons
const PRIORITY_LEVEL_ICONS = {
  urgent: "../assets/icons/urgent_red.svg",
  medium: "../assets/icons/medium_yellow.svg",
  low: "../assets/icons/low_green.svg",
};

export function getCategoryIcon(categoryType) {
  const defaultIcon = "defaulticon.svg";
  const iconFileName = AVAILABLE_CATEGORY_ICONS[categoryType] || defaultIcon;
  return `../assets/icons/${iconFileName}`;
}

export function getPriorityIconPath(priorityLevel) {
  const normalizedPriority = (priorityLevel || "medium").toLowerCase();
  const fallbackIcon = PRIORITY_LEVEL_ICONS.medium;
  return PRIORITY_LEVEL_ICONS[normalizedPriority] || fallbackIcon;
}

// Get user initials from full name
export function getInitials(fullName) {
  const nameParts = fullName.trim().split(" ");
  const firstNameInitial = nameParts[0]?.[0] || "";
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
  return (firstNameInitial + lastNameInitial).toUpperCase();
}

// Create HTML chips for assigned users
export function generateAssignedChips(assignedUsersList, allSystemUsers = []) {
  const assignedUsersArray = toArray(assignedUsersList);
  if (assignedUsersArray.length === 0) {
    return "";
  }

  const chipElements = [];
  for (const userEntry of assignedUsersArray) {
    const userName = typeof userEntry === "string" ? userEntry : userEntry.userName;
    const userRecord = findUserByName(allSystemUsers, userName);
    const userInitials = getInitials(userName);
    const userColorClass = userRecord?.colorClass || "color-1";
    
    const chipHtml = `<div class="contact-chip ${userColorClass}">${userInitials}</div>`;
    chipElements.push(chipHtml);
  }
  
  return chipElements.join("");
}

// Look up user record by name
function findUserByName(usersList, searchName) {
  if (!Array.isArray(usersList)) {
    return undefined;
  }
  
  for (const userRecord of usersList) {
    const userNameLower = userRecord.userName?.toLowerCase();
    const searchNameLower = searchName?.toLowerCase();
    if (userNameLower === searchNameLower) {
      return userRecord;
    }
  }
  
  return undefined;
}

// Create priority icon for task detail view
export function getPriorityIcon(priorityLevel) {
  const priorityIconMapping = {
    low: "prio_overlay_low.svg",
    medium: "prio_overlay_medium.svg",
    urgent: "prio_overlay_urgent.svg",
  };
  
  const normalizedPriority = priorityLevel?.toLowerCase();
  const iconFileName = priorityIconMapping[normalizedPriority] || priorityIconMapping.low;
  
  return `<img src="../assets/icons/${iconFileName}" alt="${priorityLevel}">`;
}

// Calculate percentage of completed subtasks
export function calculateSubtaskProgress(completedSubtasks, allSubtasks) {
  let completedCount = 0;
  if (Array.isArray(completedSubtasks)) {
    for (const subtaskStatus of completedSubtasks) {
      if (subtaskStatus) {
        completedCount++;
      }
    }
  }
  
  const totalSubtasks = Array.isArray(allSubtasks) ? allSubtasks.length : 0;
  
  if (totalSubtasks === 0) {
    return 0;
  }
  
  return (completedCount / totalSubtasks) * 100;
}
