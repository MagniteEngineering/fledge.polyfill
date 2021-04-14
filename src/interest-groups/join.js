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

/*
 * @function
 * @name joinAdInterestGroup
 * @description join an interest group inserting into IndexedDB
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @param {number} expiry - A number of the days (in milliseconds) an interest group should exist, not to exceed 30 days
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {true}
 *
 * @example
 *   joinAdInterestGroup({ owner: 'foo', name: 'bar', bidding_logic_url: 'http://example.com/bid' }, 2592000000);
 */
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
