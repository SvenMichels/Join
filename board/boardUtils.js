import { toArray } from "../scripts/utils/taskUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";

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

// Create HTML chips for assigned users
export function generateAssignedChips(assignedUsersList, allSystemUsers = []) {
  const assignedUsersArray = toArray(assignedUsersList);
  if (assignedUsersArray.length === 0) return "";

  const chipElements = [];
  
  for (const userEntry of assignedUsersArray) {
    const userName = extractUserName(userEntry);
    const userRecord = findUserByName(allSystemUsers, userName);
    
    // Skip if user was deleted (not found in system users)
    if (!userRecord) continue;
    
    const chip = createUserChip(userRecord);
    chipElements.push(chip);
  }

  return chipElements.join("");
}

function extractUserName(userEntry) {
  return typeof userEntry === "string" ? userEntry : userEntry.userFullName;
}

function createUserChip(userRecord) {
  const userInitials = getInitials(userRecord.userFullName);
  const userColorClass = userRecord.userColor || "color-1";
  
  return `<div class="contact-chip ${userColorClass}">${userInitials}</div>`;
}

// Look up user record by name
function findUserByName(usersList, searchName) {
  if (!Array.isArray(usersList) || !searchName) return null;

  return usersList.find(user => {
    const userFullName = user.userFullName?.toLowerCase();
    const searchNameLower = searchName.toLowerCase();
    return userFullName === searchNameLower;
  });
}

// Create priority icon for task detail view
export function getPriorityIcon(priorityLevel) {
  const priorityIconMapping = {
    low: "prio_overlay_low.svg",
    medium: "prio_overlay_medium.svg",
    urgent: "prio_overlay_urgent.svg",
  };

  const normalizedPriority = priorityLevel?.toLowerCase();
  const iconFileName =
    priorityIconMapping[normalizedPriority] || priorityIconMapping.low;

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

// Remove deleted user from task assignments
export function removeUserFromTaskAssignments(tasks, deletedUserName) {
  const updatedTasks = {};
  
  Object.entries(tasks).forEach(([taskId, task]) => {
    // Nur noch neues Format: assignedUsers
    const assignedUsers = toArray(task.assignedUsers || []);
    const filteredUsers = assignedUsers.filter(user => {
      const userName = extractUserName(user);
      return userName !== deletedUserName;
    });
    
    updatedTasks[taskId] = {
      ...task,
      assignedUsers: filteredUsers
    };
  });
  
  return updatedTasks;
}
