import echo from '../utils/console.js';
import db, { IG_STORE } from '../utils/db.js';
import validate from '../utils/validation.js';
import types from './types.js';
import {
	getIGKey,
} from './utils.js';

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
export default async function joinAdInterestGroup (options, expiry, debug = false) {
	debug && echo.group('Fledge: Join an Interest Group');
	debug && echo.log('interest group options:', options);
	debug && echo.log('interest group expiration:', expiry);
	validate.param(options, 'object');
	validate.param(expiry, 'number');
	validate.hasRequiredKeys(options, [ 'owner', 'name', 'bidding_logic_url' ]);
	validate.hasInvalidOptionTypes(options, types);

	if (expiry > MAX_EXPIRATION) {
		throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
	}

	debug && echo.info('checking for an existing interest group');
	const group = await db.store.get(IG_STORE, getIGKey(options.owner, options.name));
	debug && echo.table(group);
	let id;
	if (group) {
		debug && echo.info('updating a new interest group');
		id = await db.store.put(IG_STORE, group, {
			_expired: Date.now() + expiry,
			...options,
		});
	} else {
		debug && echo.info('creating a new interest group');
		id = await db.store.add(IG_STORE, {
			_key: getIGKey(options.owner, options.name),
			_expired: Date.now() + expiry,
			...options,
		});
	}
	debug && echo.log('interest group id:', id);
	debug && echo.groupEnd();

	return true;
}
