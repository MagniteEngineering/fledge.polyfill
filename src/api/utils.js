import VERSION from '../version';

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

/*
 * @function
 * @name hasRequiredKeys
 * @description Searches an object for required keys
 * @author Newton <cnewton@magnite.com>
 * @param {object} obj - An object to validate that required keys are present
 * @param {array} keys - An array of required keys to validate exist
 * @throws {Error} If required keys are missing
 * @return {false} If no required keys are missing
 *
 * @example
 *   hasRequiredKeys({ foo: 'bar', baz: 'qux' }, [ 'foo' ]));
 */
const hasRequiredKeys = (obj, keys) => {
	const missing = keys.filter(key => !obj.hasOwnProperty(key));

	if (missing.length) {
		throw new Error(`Required options are missing! You must provide an 'object' of options with all of the following required options: ${missing.join(', ')}.`);
	}

	return false;
};

/*
 * @function
 * @name printInvalidOptionTypes
 * @description Provides an array of strings of errors for invalid types for options passed to a function
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options passed to a function
 * @param {array} invalid - An array of options that are invalid based on their type
 * @param {object} types - An object of options with the keys the same as the `options` and values set to data types
 * @return {string[]} An array of strings with messages of invalid types
 *
 * @example
 *   printInvalidOptionTypes({ foo: 0 }, [ 'foo' ], { foo: 'string' }));
 *   // [ `'mock' requires a type of "string"! A type of number was provided instead.` ]
 */
const printInvalidOptionTypes = (options, invalid, types) => invalid.map(item => `'${item}' requires a type of "${types[item]}"! A type of ${typeof options[item]} was provided instead.`);

/*
 * @function
 * @name validateType
 * @description Validates data types
 * @author Newton <cnewton@magnite.com>
 * @param {*}
 * @return {boolean} Whether or not the data type passed in matches
 *
 * @example
 *   validateType.array([ 'foo', 'bar' ]);
 *   validateType.number(0);
 *   validateType.object({ foo: 'bar' });
 *   validateType.string('foo');
 *   validateType.url({ foo: 'bar' });
 */
const validateType = {
	array: arr => arr !== 'undefined' && Array.isArray(arr),
	number: num => num !== 'undefined' && typeof num === 'number',
	object: obj => obj !== 'undefined' && typeof obj === 'object' && obj !== null && !Array.isArray(obj),
	string: str => str !== 'undefined' && typeof str === 'string',
	mixed: type => type !== 'undefined' && (Array.isArray(type) || typeof type === 'string'),
	url: url => {
		try {
			return Boolean(new URL(url));
		} catch (e) {
			return false;
		}
	},
};

/*
 * @function
 * @name validateParam
 * @description Validates parameter types passed into functions
 * @author Newton <cnewton@magnite.com>
 * @see {@link validateType}
 * @param {*} param - A stringed parameter provided to a function
 * @param {string} type - A string representation of a data structure
 * @throws {Error} an Error stating what type was passed and what was expected
 *
 * @example
 *    validateParam('a-string', 'number'));
 */
const validateParam = (param, type) => {
	const valid = validateType[type](param);
	if (!valid) {
		throw new Error(`Must be of type "${type}"! ${typeof param} was provided.`);
	}
};

/*
 * @function
 * @name hasInvalidOptionTypes
 * @description Checks options passed to a function for the valid data types based on a structure
 * @author Newton <cnewton@magnite.com>
 * @see {@link validateType}
 * @see {@link printInvalidOptionTypes}
 * @param {object} obj - An object to validate the types
 * @param {object} types - A matching object with values set to the data type
 * @throws {Error} If data types are invalid
 * @return {false} If data types are valid, return false
 *
 * @example
 *    hasInvalideOptionTypes({ foo: 'bar' }, { 'foo': 'string' }));
 */
const hasInvalidOptionTypes = (options, types) => {
	const invalid = Object
		.entries(options)
		.filter(([ key, value ]) => !validateType[types[key]](value))
		.flatMap(([ key ]) => key);

	if (invalid.length) {
		throw new Error(printInvalidOptionTypes(options, invalid, types).join('. '));
	}

	return false;
};

const getMessage = (target, filter) => new Promise((resolve, reject) => {
	const messageListener = event => {
		if (filter(event)) {
			target.removeEventListener('message', messageListener);
			target.removeEventListener('messageerror', messageErrorListener);
			resolve(event);
		}
	};
	const messageErrorListener = event => {
		if (filter(event)) {
			target.removeEventListener('message', messageListener);
			target.removeEventListener('messageerror', messageErrorListener);
			reject(new Error('Message deserialization error'));
		}
	};

	target.addEventListener('message', messageListener);
	target.addEventListener('messageerror', messageErrorListener);
});

function getFromFrame (port) {
	const message = getMessage(port, () => true);
	port.start();
	return message;
}

async function getFramePort (iframe, expectedOrigin) {
	const { data, ports, origin } = await getMessage(window, ({ source }) => source === iframe.contentWindow);

	if (origin !== expectedOrigin) {
		throw new Error(`Message origins are mismatched! Expected ${expectedOrigin}, received ${origin}`);
	}
	if (data['fledge.polyfill'] !== VERSION) {
		throw new Error(`Message versions are mismatched! Expected ${VERSION}, but received ${data['fledge.polyfill']}`);
	}
	if (ports.length !== 1) {
		throw new Error(`Message ports are mismatched! Expected 1 port, received ${ports.length}`);
	}

	return ports[0];
}

/*
 * @function
 * @name call
 * @description wrap a promise in a reliable api, similar to Go-style
 * @author Newton <cnewton@magnite.com>
 * @param {promise} promise - a promise
 * @return {Promise<Array>} a promise that resolves to data as the first index in an array, and/or an error in the second index
 */
const call = promise => promise
	.then(data => ([ data, undefined ]))
	.catch(error => Promise.resolve([ undefined, error ]));

/*
 * @function
 * @name dynamicImport
 * @description dynamically imports a function
 * @author Newton <cnewton@magnite.com>
 * @param {URL} url - a fully qualified URL to an ES6 module
 * @param {string} fn - a function name that exists at the URL
 * @param {nargs} args - any level of arguments/parameters that the function takes
 * @return {any} any set of data that the function returns
 */
export const dynamicImport = async (url, fn, ...args) => {
	const [ module, moduleErr ] = await call(import(url));

	if (moduleErr) {
		return null;
	}

	if (!module[fn] || typeof module[fn] !== 'function') {
		return null;
	}

	try {
		return module[fn](...args);
	} catch (err) {
		return null;
	}
};

export const frame = {
	create: createFrame,
};

export const message = {
	getFramePort,
	getFromFrame,
	get: getMessage,
};

export const validate = {
	hasInvalidOptionTypes,
	hasRequiredKeys,
	printInvalidOptionTypes,
	type: validateType,
	param: validateParam,
};
