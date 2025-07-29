/**
 * @fileoverview Initializes the login and signup event listeners on application start.
 */

import { loginListeners, signupListeners } from "./events/loginevents.js";

/**
 * Initializes the application by binding login and signup event handlers.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 */
export async function init() {
  loginListeners();
  signupListeners();
}

// Start application initialization
init();
