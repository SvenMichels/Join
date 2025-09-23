import { loginAsGuest } from "../scripts/auth/login.js";
import { closeDropdown, subtaskExpander } from "./formManager.js";

/**
 * Determines if a dropdown/list element is currently open/visible.
 * @param {HTMLElement|null} listEl - The element to test.
 * @returns {boolean} True if open or visible.
 */

function isOpen(listEl) {
    return !!listEl && (listEl.classList.contains("open") || listEl.classList.contains("visible"));
}

/**
 * Checks whether a click target is inside a given element (or the element itself).
 * @param {EventTarget} target - The click target.
 * @param {HTMLElement|null} el - The element to test.
 * @returns {boolean} True if target is the element or contained within it.
 */

function clickedInside(target, el) {
    return !!el && (el === target || el.contains(target));
}

/**
 * Handles outside clicks for the non-modal "Assigned To" dropdown.
 * Closes the dropdown if the click is outside both the list and its wrapper.
 * @param {EventTarget} target - The click target.
 * @returns {void}
 */

function handleAssignedOutside(target) {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const list = document.getElementById("assignedUserList");
    const arrow = document.getElementById("assignedBtnImg");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideWrapper = clickedInside(target, wrapper);
    if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

/**
 * Handles outside clicks for the modal "Assigned To" dropdown.
 * Closes the dropdown if the click is outside both the list and its wrapper.
 * @param {EventTarget} target - The click target.
 * @returns {void}
 */

function handleAssignedOutsideModal(target) {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const list = document.getElementById("assignedUserList-modal");
    const arrow = document.getElementById("assignedBtnImg-modal");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideWrapper = clickedInside(target, wrapper);
    if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

/**
 * Handles outside clicks for the non-modal category dropdown.
 * Closes and collapses related layout adjustments if click is outside trigger and list.
 * @param {EventTarget} target - The click target.
 * @param {HTMLElement} options - Reference options element for layout rollback.
 * @returns {void}
 */

function handleCategoryOutside(target, options) {
    const select = document.getElementById("categorySelect");
    const list = document.getElementById("categoryOptions");
    const arrow = document.getElementById("categoryBtnImg");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideTrigger = clickedInside(target, select);
    if (!insideList && !insideTrigger) {
        closeDropdown(list, select?.parentElement, arrow);
        subtaskExpander(false, options);
    }
}

/**
 * Handles outside clicks for the modal category dropdown.
 * Closes and collapses related layout adjustments if click is outside trigger and list.
 * @param {EventTarget} target - The click target.
 * @param {HTMLElement} options - Reference options element for layout rollback.
 * @returns {void}
 */

function handleCategoryOutsideModal(target, options) {
    const select = document.getElementById("category-modal");
    const list = document.getElementById("categoryOptions-modal");
    const arrow = document.getElementById("categoryBtnImg-modal");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideTrigger = clickedInside(target, select);
    if (!insideList && !insideTrigger) {
        closeDropdown(list, select?.parentElement, arrow);
        subtaskExpander(false, options);
    }
}

/**
 * Sets up a single global outside-click listener (idempotent)
 * that closes any open category or assigned-user dropdowns (modal and non-modal).
 * @param {HTMLElement} options - The options element used for subtask expander rollback.
 * @returns {void}
 */

export function setupGlobalOutsideClick(options) {
    if (document.body.dataset.outsideGlobalBound === "true") return;
    document.body.dataset.outsideGlobalBound = "true";

    document.addEventListener("click", (e) => {
        const target = e.target;
        handleAssignedOutside(target);
        handleAssignedOutsideModal(target);
        handleCategoryOutside(target, options);
        handleCategoryOutsideModal(target, options);
    });
}