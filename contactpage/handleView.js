import { currentRenderedContact } from "./contactsMain.js";
import { initializeBackButton, initializeFabMenu } from "../scripts/ui/fabContact.js";

/**
 * Prepares the contact view based on screen size (mobile or desktop).
 *
 * - On desktop: ensures the contact panel is visible
 * - On mobile: shows FAB and back button and sets contact panel visible
 *
 * @param {Object} contact - Contact object to be rendered
 */
export function prepareResponsiveContactView() {
    const panel = document.querySelector('.singleContact');
    if (!panel) return;
    const fab = document.getElementById('fabContainer');
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        updateMobileView(fab, panel, true);
    } else {
        updateDesktopView(fab, panel, true);
    }
}


/**
 * Handles responsive adjustments when window size changes.
 * - Mobile: shows FAB and contact panel only if a contact is open
 * - Desktop: hides FAB, removes slide animations, and shows panel if contact is open
 */
export function handleResize() {
    const singleContact = document.querySelector('.singleContact');
    const fab = document.getElementById('fabContainer');
    if (!singleContact) return;

    const isMobile = window.innerWidth <= 768;
    const hasOpenContact = Boolean(currentRenderedContact);

    if (isMobile) {
        updateMobileView(fab, singleContact, hasOpenContact);
    } else {
        updateDesktopView(fab, singleContact, hasOpenContact);
    }
}

/**
 * Updates contact panel and FAB visibility for mobile view.
 * Adds slide-in animation if a contact is open, otherwise resets panel state.
 *
 * @param {HTMLElement} fab - Floating action button container
 * @param {HTMLElement} panel - Contact detail panel
 * @param {boolean} hasOpenContact - Whether a contact is currently open
 */
function updateMobileView(fab, panel, hasOpenContact) {
    if (fab) fab.style.display = hasOpenContact ? 'block' : 'none';
    if (hasOpenContact) {
        panel.classList.remove('slide-out');
        panel.classList.add('slide-in');
        panel.style.display = 'flex';
        initializeFabMenu(currentRenderedContact);
        initializeBackButton();
    } else {
        panel.classList.remove('slide-in', 'slide-out');
        panel.style.display = '';
    }
}

/**
 * Updates contact panel and FAB visibility for desktop view.
 * Removes any slide animation classes and shows panel if a contact is currently open.
 *
 * @param {HTMLElement} fab - Floating action button container
 * @param {HTMLElement} panel - Contact detail panel
 * @param {boolean} hasOpenContact - Whether a contact is currently open
 */
function updateDesktopView(fab, panel, hasOpenContact) {
    if (fab) fab.style.display = 'none';
    panel.classList.remove('slide-in', 'slide-out');
    panel.style.display = hasOpenContact ? 'flex' : '';
}