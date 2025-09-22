export function getElementConfigsForAssignedTo() {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const options = document.getElementById("assignedUserList");
    const arrow = document.getElementById("assignedBtnImg");
    const select = document.getElementById("searchUser");
    const titleInput = document.getElementById("task-title");
    const dateInput = document.getElementById("task-date");
    const createButton = document.querySelector(".create-button");
    const prioContainer = document.querySelector(".prio-category-container");
    const clearBtn = document.getElementById("clearBtn");
    return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

export function getElementConfigsForAssignedToModal() {
    const wrapper = document.querySelector(".assigned-input-wrapper");
    const options = document.getElementById("assignedUserList-modal");
    const arrow = document.getElementById("#assignedBtnImg-modal");
    const select = document.querySelector("#searchUser-modal");
    const titleInput = document.querySelector("#task-title-modal");
    const dateInput = document.querySelector("#task-date-modal");
    const createButton = document.querySelector(".create-button");
    const prioContainer = document.querySelector(".prio-category-container");
    const clearBtn = document.getElementById("clearBtn");
    return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

export function getElementConfigsForAddTaskModal() {
    const wrapper = document.querySelector("#formWrapper");
    const select = document.querySelector("#category-modal");
    const options = document.querySelector("#categoryOptions-modal");
    const titleInput = document.querySelector("#task-title-modal");
    const dateInput = document.querySelector("#task-date-modal");
    const createButton = document.querySelector(".create-button");
    const arrow = document.querySelector("#categoryBtnImg-modal");
    const prioContainer = document.querySelector(".prio-category-container");
    const clearBtn = document.getElementById("clearBtn-modal");
    return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}

export function getElementConfigsForAddTask() {
    const wrapper = document.querySelector(".form-wrapper");
    const select = document.querySelector("#categorySelect");
    const options = document.querySelector("#categoryOptions");
    const titleInput = document.querySelector("#task-title");
    const dateInput = document.querySelector("#task-date");
    const createButton = document.querySelector(".create-button");
    const arrow = document.getElementById("categoryBtnImg");
    const prioContainer = document.querySelector(".prio-category-container");
    const clearBtn = document.getElementById("clearBtn");
    return { wrapper, options, arrow, select, prioContainer, createButton, dateInput, titleInput, clearBtn };
}