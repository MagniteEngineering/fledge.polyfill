/* eslint-disable compat/compat */

/*
 * @function
 * @name isMissingRequiredOptions
 * @description Searches an object for required keys
 * @author Newton <cnewton@magnite.com>
 * @param {object} obj - An object to validate that required keys are present
 * @param {array} keys - An array of required keys to validate exist
 * @throws {Error} If required keys are missing
 * @return {false} If no required keys are missing
 *
 * @example
 *   isMissingRequiredOptions({ foo: 'bar', baz: 'qux' }, [ 'foo' ]));
 */
export const isMissingRequiredOptions = (obj, keys) => {
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
export const printInvalidOptionTypes = (options, invalid, types) => invalid.map(item => `'${item}' requires a type of "${types[item]}"! A type of ${typeof options[item]} was provided instead.`);

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
export const validateType = {
	array: arr => arr !== 'undefined' && Array.isArray(arr),
	number: num => num !== 'undefined' && typeof num === 'number',
	object: obj => obj !== 'undefined' && typeof obj === 'object' && obj !== null && !Array.isArray(obj),
	string: str => str !== 'undefined' && typeof str === 'string',
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
export const validateParam = (param, type) => {
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
export const hasInvalidOptionTypes = (options, types) => {
	const invalid = Object
		.entries(options)
		.filter(([ key, value ]) => !validateType[types[key]](value))
		.flatMap(([ key ]) => key);

	if (invalid.length) {
		throw new Error(printInvalidOptionTypes(options, invalid, types).join('. '));
	}

	return false;
};
