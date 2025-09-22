import { handleSearchInput } from "../taskFloatData/userAssignmentManager.js";
import { setupUserSearch } from "./userAssignmentHandler.js";
import { clearFormState } from "./formManagerState.js";
import { setupGlobalOutsideClick } from "./formManagerHandler.js";
import { ensureUsersIfVisible, ensureAssignedUsersLoaded, updateCreateButtonState } from "./formManager.js";
import { toggleDropdown, handleOptionClick } from "./formManager.js";
import { getElementConfigsForAddTaskModal, getElementConfigsForAssignedToModal, getElementConfigsForAddTask, getElementConfigsForAssignedTo } from "./formManagerConfig.js";

export function initAddTaskFlow() {
    const elements = getElementConfigsForAddTask();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
    setupUserSearch();
}

export function initAddTaskModalFlow() {
    const elements = getElementConfigsForAddTaskModal();
    attachCoreEvents(elements);
    updateCreateButtonState(elements);
    handleSearchInput();
}

export function initAssignedToFlow() {
    const elements = getElementConfigsForAssignedTo();
    ensureAssignedUsersLoaded(elements.options);
    attachCoreEvents(elements);
}

export function initAssignedToModalFlow() {
    const elements = getElementConfigsForAssignedToModal();
    ensureAssignedUsersLoaded(elements.options);
    attachCoreEvents(elements);
}

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

export function bindOnce(options) {
    if (options?.dataset.listenerBound === "true") return true;
    if (options) options.dataset.listenerBound = "true";
    return false;
}

export function attachClearHandler(clearBtn, ctx) {
    clearBtn?.addEventListener("click", () =>
        clearFormState(ctx.wrapper, ctx.select, ctx.options, ctx.titleInput, ctx.dateInput, ctx.arrow)
    );
}

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

export function attachOptionsHandler({ options, select, wrapper, titleInput, dateInput, createButton, arrow, prioContainer }) {
    options?.addEventListener("click", (event) =>
        handleOptionClick(event, select, options, wrapper, { titleInput, dateInput, createButton }, arrow, prioContainer)
    );
}

export function attachValidationInputs({ titleInput, dateInput, createButton, prioContainer, select }) {
    if (!(titleInput && dateInput && createButton && prioContainer && select)) return;

    [titleInput, dateInput].forEach((input) =>
        input.addEventListener("input", () =>
            updateCreateButtonState({ select, titleInput, dateInput, prioContainer, createButton })
        )
    );
}