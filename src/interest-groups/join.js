import db from '../utils/db.js';
import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import types from './types.js';

/*
 * @const {number}
 * @summary Maximum expiration allowed for an Interest Group to exist
 * @description Milliseconds occuring per day multiplied by the maximum number of days (maximum dayus (30) * hours per day (24) * minutes per hour (60) * seconds per minute (60) * milliseconds per second (1000))
 */
const MAX_EXPIRATION = 2592000000;

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
export default async function joinAdInterestGroup (options, expiry) {
	validateParam(options, 'object');
	validateParam(expiry, 'number');
	isMissingRequiredOptions(options, [ 'owner', 'name', 'bidding_logic_url' ]);
	hasInvalidOptionTypes(options, types);

	if (expiry > MAX_EXPIRATION) {
		throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
	}

	console.info('checking for an existing interest group');
	const group = await db.read(options.owner, options.name);
	if (group) {
		console.info('updating a new interest group');
		await db.update(group, options, expiry);
	} else {
		console.info('creating a new interest group');
		await db.create(options, expiry);
	}

	return true;
}
