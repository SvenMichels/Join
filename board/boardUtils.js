/**
 * @fileoverview Utility functions for task rendering, priority and category handling,
 * user chip generation, subtask progress calculation and user cleanup in task assignments.
 */

import { toArray } from "../scripts/utils/taskUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Mapping of available category icons.
 * @constant
 * @type {Object<string, string>}
 */
const AVAILABLE_CATEGORY_ICONS = {
  User_Story: "propertyuserstory.svg",
  Technical_Task: "propertytechnicaltask.svg",
};

/**
 * Priority level icons for board view.
 * @constant
 * @type {Object<string, string>}
 */
const PRIORITY_LEVEL_ICONS = {
  urgent: "../assets/icons/urgent_red.svg",
  medium: "../assets/icons/medium_yellow.svg",
  low: "../assets/icons/low_green.svg",
};

/**
 * Returns the icon path for a given task category.
 * @param {string} categoryType - The category type (e.g., "User_Story").
 * @returns {string} The path to the corresponding icon file.
 */
export function getCategoryIcon(categoryType) {
  const defaultIcon = "defaulticon.svg";
  const iconFileName = AVAILABLE_CATEGORY_ICONS[categoryType] || defaultIcon;
  return `../assets/icons/${iconFileName}`;
}

/**
 * Returns the icon path for a given priority level.
 * @param {string} priorityLevel - The priority level (e.g., "low", "medium", "urgent").
 * @returns {string} The path to the corresponding icon file.
 */
export function getPriorityIconPath(priorityLevel) {
  const normalizedPriority = (priorityLevel || "medium").toLowerCase();
  const fallbackIcon = PRIORITY_LEVEL_ICONS.medium;
  return PRIORITY_LEVEL_ICONS[normalizedPriority] || fallbackIcon;
}

/**
 * Generates HTML chips for assigned users.
 * @param {Array<string|Object>} assignedUsersList - List of assigned user names or objects.
 * @param {Array<Object>} [allSystemUsers=[]] - List of all users in the system.
 * @returns {string} HTML string with contact chips.
 */
export function generateAssignedChips(assignedUsersList, allSystemUsers = []) {
  const assignedUsersArray = toArray(assignedUsersList);
  if (assignedUsersArray.length === 0) return "";

  const chipElements = [];

  for (const userEntry of assignedUsersArray) {
    const userName = extractUserName(userEntry);
    const userRecord = findUserByName(allSystemUsers, userName);
    if (!userRecord) continue;

    const chip = createUserChip(userRecord);
    chipElements.push(chip);
  }

  return chipElements.join("");
}

/**
 * Extracts the full name from a user entry (string or object).
 * @param {string|Object} userEntry - User name string or object with userFullName.
 * @returns {string} User full name.
 */
function extractUserName(userEntry) {
  return typeof userEntry === "string" ? userEntry : userEntry.userFullName;
}

/**
 * Creates a single contact chip HTML string.
 * @param {Object} userRecord - The user object.
 * @returns {string} HTML chip element string.
 */
function createUserChip(userRecord) {
  const userInitials = getInitials(userRecord.userFullName);
  const userColorClass = userRecord.userColor || "color-1";

  return `<div class="contact-chip ${userColorClass}">${userInitials}</div>`;
}

/**
 * Finds a user by full name in the given user list.
 * @param {Array<Object>} usersList - Array of user objects.
 * @param {string} searchName - Full name to search.
 * @returns {Object|null} Matching user object or null if not found.
 */
function findUserByName(usersList, searchName) {
  if (!Array.isArray(usersList) || !searchName) return null;

  return usersList.find(user => {
    const userFullName = user.userFullName?.toLowerCase();
    const searchNameLower = searchName.toLowerCase();
    return userFullName === searchNameLower;
  });
}

/**
 * Returns the HTML img tag for a given priority level (task detail modal).
 * @param {string} priorityLevel - The task's priority.
 * @returns {string} HTML string for priority icon.
 */
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

/**
 * Calculates the completion percentage of subtasks.
 * @param {Array<boolean>} completedSubtasks - Array indicating which subtasks are done.
 * @param {Array<any>} allSubtasks - Array of all subtask items.
 * @returns {number} Percentage of completed subtasks (0–100).
 */
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

/**
 * Removes a deleted user from all task assignments.
 * @param {Object} tasks - Object of tasks keyed by task ID.
 * @param {string} deletedUserName - Full name of the user to remove.
 * @returns {Object} New task object with updated user assignments.
 */
export function removeUserFromTaskAssignments(tasks, deletedUserName) {
  const updatedTasks = {};

  Object.entries(tasks).forEach(([taskId, task]) => {
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
