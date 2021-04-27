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

/*
 * @function
 * @name renderFrame
 * @description renders an iFrame when given a target and source URL
 * @author Newton <cnewton@magnite.com>
 * @param {DOM Node} target - a valid DOM node with which to append an iframe
 * @param {object} source - a valid winning ad object to render within the iframe
 * @throws {Error} if no source URL is found based on the selector provided
 * @return {void}
 */
export const renderFrame = (target, source) => {
	if (!source.bid?.render) {
		throw new Error(`Something went wrong! No rendering URL was found.`);
	}

	const iframe = document.createElement('iframe');
	iframe.id = `fledge-auction-${source.id}`;
	iframe.src = source.bid?.render;
	iframe.style.borderWidth = 0;
	target.appendChild(iframe);
};
