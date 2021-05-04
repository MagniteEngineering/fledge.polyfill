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
export const createFrame = ({ source, target = document.body, props = {}, style = {} }) => {
	if (!source) {
		throw new Error(`Something went wrong! No URL was found.`);
	}
	const src = new URL(source, document.baseURI);
	const iframe = document.createElement('iframe');
	const _props = {
		src,
		scrolling: 'no',
		...props,
	};
	const _style = {
		'border-width': 0,
		...style,
	};
	Object.entries(_props).map(([ key, value ]) => iframe.setAttribute(key, value));
	Object.entries(_style).map(([ key, value ]) => iframe.style.setProperty(key, value));

	target.appendChild(iframe);

	return {
		iframe,
		origin: src.origin,
	};
};

export default {
	create: createFrame,
};
