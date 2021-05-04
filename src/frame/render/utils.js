/*
 * @function
 * @name getTarget
 * @description grab a DOM node based on a CSS style selector passed in
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a CSS style selector
 * @throws {Error} if no target is found based on the selector provided
 * @return {DOM Node} a DOM node found on the page
 */
export const getTarget = selector => document.querySelector(selector);
