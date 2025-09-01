/**
 * Stores a value in the browser's localStorage under the specified key.
 *
 * localStorage is a built-in browser feature that lets you save data in the user's browser.
 * The data stays even after the page is reloaded or the browser is closed and reopened.
 * This function converts your value to a JSON string before saving, so you can store objects, arrays, numbers, and more.
 *
 * @function
 * @param {string} key - The name you want to use to identify the stored value. Must be a non-empty string.
 * @param {object|array} value - The data you want to store. Cannot be undefined. Can be any type that can be converted to JSON (like an object, array, string, or number).
 * @throws {Error} Throws an error if the key is not a non-empty string or if the value is undefined.
 * @returns {void} This function does not return anything.
 * @example
 * // Store an object in localStorage
 * LocalStorageService.setItem('user', { name: 'Alice', age: 30 });
 */
function setItem(key, value) {
    if (typeof key !== "string" || !key.length) {
        throw new Error("[LocalStorageService] key must be a non-empty string");
    }
    if (value === undefined) {
        throw new Error("[LocalStorageService] value cannot be undefined");
    }
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("[LocalStorageService] Failed to set item:", e);
    }
}

/**
 * Gets a value from the browser's localStorage by its key.
 *
 * This function looks up the value for the given key and converts it back from a JSON string to its original form.
 * If the key does not exist, it returns null.
 *
 * @function
 * @param {string} key - The name of the value to get. Must be a non-empty string.
 * @returns {object|null} The value that was stored (for example, an object or array), or null if the key does not exist or an error occurs.
 * @throws {Error} Throws an error if the key is not a non-empty string.
 * @example
 * // Retrieve an object from localStorage
 * const user = LocalStorageService.getItem('user');
 * if (user) {
 *   user.name); // 'Alice'
 * }
 */
function getItem(key) {
    if (typeof key !== "string" || !key.length) {
        throw new Error("[LocalStorageService] key must be a non-empty string");
    }
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.error("[LocalStorageService] Failed to get item:", e);
        return null;
    }
}

/**
 * Removes a value from the browser's localStorage by its key.
 *
 * After calling this function, the value for the given key will be deleted from localStorage.
 *
 * @function
 * @param {string} key - The name of the value to remove. Must be a non-empty string.
 * @throws {Error} Throws an error if the key is not a non-empty string.
 * @returns {void} This function does not return anything.
 * @example
 * // Remove an item from localStorage
 * LocalStorageService.clearItem('user');
 */
function clearItem(key) {
    if (typeof key !== "string" || !key.length) {
        throw new Error("[LocalStorageService] key must be a non-empty string");
    }
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error("[LocalStorageService] Failed to clear item:", e);
    }
}

/**
 * LocalStorageService is an object that gives you easy-to-use functions to work with the browser's localStorage.
 *
 * You can use it to save, get, and remove data. It handles errors for you and automatically converts data to and from JSON.
 *
 * @namespace LocalStorageService
 * @property {function(string, *):void} setItem - Stores a value by key.
 * @property {function(string):object|null} getItem - Gets a value by key (returns an object or null).
 * @property {function(string):void} clearItem - Removes a value by key.
 * @example
 * // Store a string
 * LocalStorageService.setItem('theme', 'dark');
 *
 * // Get a string
 * const theme = LocalStorageService.getItem('theme');
 *
 * // Remove a value
 * LocalStorageService.clearItem('theme');
 */
export const LocalStorageService = {
    setItem,
    getItem,
    clearItem
}