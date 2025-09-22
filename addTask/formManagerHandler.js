import { closeDropdown, subtaskExpander } from "./formManager.js";

/**
 * Expands or collapses the subtask input area
 * @param {boolean} expand - Whether to expand (true) or collapse (false)
 * @param {HTMLElement|null} options - The subtask options element to toggle
*/

function isOpen(listEl) {
    return !!listEl && (listEl.classList.contains("open") || listEl.classList.contains("visible"));
}

function clickedInside(target, el) {
    return !!el && (el === target || el.contains(target));
}

function handleAssignedOutside(target) {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const list = document.getElementById("assignedUserList");
    const arrow = document.getElementById("assignedBtnImg");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideWrapper = clickedInside(target, wrapper);
    if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

function handleAssignedOutsideModal(target) {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const list = document.getElementById("assignedUserList-modal");
    const arrow = document.getElementById("assignedBtnImg-modal");

    if (!isOpen(list)) return;

    const insideList = clickedInside(target, list);
    const insideWrapper = clickedInside(target, wrapper);
    if (!insideList && !insideWrapper) closeDropdown(list, wrapper, arrow);
}

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