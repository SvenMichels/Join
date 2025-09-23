import { handleSearchInput } from "../taskfloatdata/userAssignmentManager.js";
import { setupUserSearch } from "./userAssignmentHandler.js";
import { clearFormState } from "./formManagerState.js";
import { setupGlobalOutsideClick } from "./formManagerHandler.js";
import { ensureUsersIfVisible, ensureAssignedUsersLoaded, updateCreateButtonState } from "./formManager.js";
import { toggleDropdown, handleOptionClick } from "./formManager.js";
import { getElementConfigsForAddTaskModal, getElementConfigsForAssignedToModal, getElementConfigsForAddTask, getElementConfigsForAssignedTo } from "./formManagerConfig.js";

/**
 * Initializes the add task flow for the main (non-modal) form.
 * Sets up element references, event handlers, button state and user search.
 */
export function initAddTaskFlow() {
    const elements = getElementConfigsForAddTask();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
    setupUserSearch();
}

/**
 * Initializes the add task flow inside a modal.
 * Attaches events, updates button state and activates inline search.
 */
export function initAddTaskModalFlow() {
    const elements = getElementConfigsForAddTaskModal();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
    handleSearchInput();
}

/**
 * Initializes the "Assigned To" list in non-modal context,
 * ensuring users are loaded before attaching handlers.
 */
export function initAssignedToFlow() {
    const elements = getElementConfigsForAssignedTo();
    ensureAssignedUsersLoaded(elements.options);
    attachCoreEvents(elements);
}

/**
 * Initializes the "Assigned To" list inside a modal,
 * ensuring users are loaded before attaching handlers.
 */
export function initAssignedToModalFlow() {
    const elements = getElementConfigsForAssignedToModal();
    ensureAssignedUsersLoaded(elements.options);
    attachCoreEvents(elements);
}

/**
 * Detects wrapper element type and dispatches to the correct init routine.
 * Silently returns if wrapper not found.
 * @param {string} wrapperElementId - DOM id of the container element.
 */
export function initFormAndButtonHandlers(wrapperElementId) {
    const wrapper = document.getElementById(wrapperElementId);
    if (!wrapper) return;

    if (wrapper.id === "form-wrapper") {
        initAddTaskFlow();
    } else if (wrapper.id === "formWrapper") {
        initAddTaskModalFlow();
    } else if (wrapper.id === "assignedUserList" || wrapper.id === "assignedUserList-modal") {
        initAssignedToFlow();
    } else if (wrapper.id === "assignedUserList-modal") {
        initAssignedToModalFlow();
    }
}

/**
 * Attaches core event handlers for dropdown, validation and clear actions.
 * Ensures handlers bind only once per options element.
 * @param {Object} ctx - Context object with DOM references.
 * @param {HTMLElement} ctx.wrapper
 * @param {HTMLElement} ctx.select
 * @param {HTMLElement} ctx.options
 * @param {HTMLInputElement} ctx.titleInput
 * @param {HTMLInputElement} ctx.dateInput
 * @param {HTMLButtonElement} ctx.createButton
 * @param {HTMLElement} ctx.arrow
 * @param {HTMLElement} ctx.prioContainer
 * @param {HTMLElement} [ctx.clearBtn]
 * @returns {Object|undefined} Basic reference bundle or undefined if already bound.
 */
export function attachCoreEvents(ctx) {
    const { wrapper, select, options, titleInput, dateInput, createButton, arrow, prioContainer, clearBtn } = ctx;
    if (bindOnce(options)) return;

    attachClearHandler(clearBtn, ctx);
    attachToggleHandlers({ arrow, select, options, wrapper, prioContainer });
    attachOptionsHandler({ options, select, wrapper, titleInput, dateInput, createButton, arrow, prioContainer });
    attachValidationInputs({ titleInput, dateInput, createButton, prioContainer, select });
    ensureUsersIfVisible(options);
    setupGlobalOutsideClick(options);

    return { wrapper, select, options, titleInput, dateInput, createButton };
}

/**
 * Prevents duplicate event binding on an options element.
 * Uses a data attribute flag.
 * @param {HTMLElement} options - Options element to check.
 * @returns {boolean} True if already bound.
 */
export function bindOnce(options) {
    if (options?.dataset.listenerBound === "true") return true;
    if (options) options.dataset.listenerBound = "true";
    return false;
}

/**
 * Wires the clear/reset button to reset the form state.
 * @param {HTMLElement} clearBtn - Clear button element.
 * @param {Object} ctx - Context object passed through.
 */
export function attachClearHandler(clearBtn, ctx) {
    clearBtn?.addEventListener("click", () =>
        clearFormState(ctx.wrapper, ctx.select, ctx.options, ctx.titleInput, ctx.dateInput, ctx.arrow)
    );
}

/**
 * Attaches click handlers to the arrow and select surfaces to toggle dropdown.
 * Ensures user list is loaded before opening.
 * @param {Object} params - Parameter object.
 * @param {HTMLElement} params.arrow
 * @param {HTMLElement} params.select
 * @param {HTMLElement} params.options
 * @param {HTMLElement} params.wrapper
 * @param {HTMLElement} params.prioContainer
 */
export function attachToggleHandlers({ arrow, select, options, wrapper, prioContainer }) {
    const toggle = async (e) => {
        e.stopPropagation();
        await ensureAssignedUsersLoaded(options);
        toggleDropdown(options, wrapper, arrow, prioContainer);
    };

    arrow?.addEventListener("click", toggle);
    select?.addEventListener("click", async (e) => {
        await toggle(e);
    });
}

/**
 * Adds click delegation on options container to handle selection changes.
 * @param {Object} params - Parameter object.
 * @param {HTMLElement} params.options
 * @param {HTMLElement} params.select
 * @param {HTMLElement} params.wrapper
 * @param {HTMLInputElement} params.titleInput
 * @param {HTMLInputElement} params.dateInput
 * @param {HTMLButtonElement} params.createButton
 * @param {HTMLElement} params.arrow
 * @param {HTMLElement} params.prioContainer
 */
export function attachOptionsHandler({ options, select, wrapper, titleInput, dateInput, createButton, arrow, prioContainer }) {
    options?.addEventListener("click", (event) =>
        handleOptionClick(event, select, options, wrapper, { titleInput, dateInput, createButton }, arrow, prioContainer)
    );
}

/**
 * Adds input listeners for title and date fields to update create button state.
 * Skips if required elements missing.
 * @param {Object} params - Parameter object.
 * @param {HTMLInputElement} params.titleInput
 * @param {HTMLInputElement} params.dateInput
 * @param {HTMLButtonElement} params.createButton
 * @param {HTMLElement} params.prioContainer
 * @param {HTMLElement} params.select
 */
export function attachValidationInputs({ titleInput, dateInput, createButton, prioContainer, select }) {
    if (!(titleInput && dateInput && createButton && prioContainer && select)) return;

    [titleInput, dateInput].forEach((input) =>
        input.addEventListener("input", () =>
            updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton })
        )
    );
}