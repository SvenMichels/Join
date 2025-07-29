/**
 * @fileoverview Shared constants used across the project.
 */

/**
 * Icon paths for task priority levels used in modals.
 * Each priority has two variants: default and white.
 *
 * @constant
 * @type {Object<string, string[]>}
 * @property {string[]} urgent - [defaultIcon, whiteIcon] for 'urgent' priority
 * @property {string[]} medium - [defaultIcon, whiteIcon] for 'medium' priority
 * @property {string[]} low - [defaultIcon, whiteIcon] for 'low' priority
 */
export const PRIORITY_ICONS_MODAL = {
  urgent: [
    "../assets/icons/urgent_red.svg",
    "../assets/icons/urgent_white.svg",
  ],
  medium: [
    "../assets/icons/medium_yellow.svg",
    "../assets/icons/medium_white.svg",
  ],
  low: [
    "../assets/icons/low_green.svg",
    "../assets/icons/low_white.svg",
  ],
};
