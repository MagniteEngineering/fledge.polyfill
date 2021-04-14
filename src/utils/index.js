/* eslint-disable compat/compat */

export const validateTypes = {
	array: arr => arr !== 'undefined' && Array.isArray(arr),
	number: num => num !== 'undefined' && typeof str === 'number',
	object: obj => obj !== 'undefined' && typeof obj === 'object' && obj !== null,
	string: str => str !== 'undefined' && typeof str === 'string',
	url: url => {
		try {
			return Boolean(new URL(url));
		} catch (e) {
			return false;
		}
	},
};

export const validateParam = (param, type) => {
	if (validateTypes[type](param)) {
		throw new Error(`Must be of type "${type}"! ${typeof param} was provided.`);
	}

	return false;
};

export const printInvalidOptionTypes = (options, types) => types.forEach(item => `'${item}' requires a type of "${types[item]}"! A type of ${typeof options[item]} was provided instead.`);

export const hasInvalidOptionTypes = (options, types) => {
	const invalid = Object
		.entries(options)
		.filter(([ key, value ]) => !validateTypes[types[key]](value))
		.flatMap(([ key ]) => key);

	if (invalid.length) {
		throw new Error(printInvalidOptionTypes(options, invalid).join('. '));
	}

	return false;
};

export const isMissingRequiredOptions = (obj, keys) => {
	const missing = keys.filter(key => !obj.hasOwnProperty(key));

	if (missing.length) {
		throw new Error(`Required options are missing! You must provide an 'object' of options with all of the following required options: ${missing.join(', ')}.`);
	}

	return false;
};
