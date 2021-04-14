import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import {
	MAX_EXPIRATION,
	REQUIRED_OPTS,
} from './constants.js';
import types from './types.js';

export default function joinAdInterestGroup (options, expiry) {
	validateParam(options, 'object');
	validateParam(expiry, 'number');
	isMissingRequiredOptions(options, REQUIRED_OPTS);
	hasInvalidOptionTypes(options, types);

	if (expiry > MAX_EXPIRATION) {
		throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
	}

	return true;
}
