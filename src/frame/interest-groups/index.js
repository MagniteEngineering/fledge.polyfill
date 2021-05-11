import { echo } from '@theholocron/klaxon';
import db, { IG_STORE } from '../utils.js';

/*
 * @function
 * @name getIGKey
 * @description retrieve the key for an interest group form the store
 * @author Newton <cnewton@magnite.com>
 * @param {string} owner - owner of the interest group
 * @param {string} name - name of the interest group
 * @return {object} an object representing an interest group
 *
 * @example
 *   getKey('foo', 'bar');
 *   // 'foo-bar'
 */
export const getIGKey = (owner, name) => `${owner}-${name}`;

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
export async function joinAdInterestGroup (options, expiry, debug) {
	debug && echo.groupCollapsed('Fledge API: joinAdInterest');
	const group = await db.store.get(IG_STORE, getIGKey(options.owner, options.name));
	debug && echo.log(echo.asInfo('checking for an existing interest group:'), group);
	let id;
	if (group) {
		debug && echo.log(echo.asProcess('updating an interest group'));
		id = await db.store.put(IG_STORE, group, {
			_expired: Date.now() + expiry,
			...options,
		});
	} else {
		debug && echo.log(echo.asProcess('creating a new interest group'));
		id = await db.store.add(IG_STORE, {
			_key: getIGKey(options.owner, options.name),
			_expired: Date.now() + expiry,
			...options,
		});
	}
	debug && echo.log(echo.asSuccess('interest group id:'), id);
	debug && echo.groupEnd();

	return true;
}

/*
 * @function
 * @name leaveAdInterestGroup
 * @description leave an interest group removing from IndexedDB
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {true}
 *
 * @example
 *   leaveAdInterestGroup({ owner: 'foo', name: 'bar', bidding_logic_url: 'http://example.com/bid' });
 */
export async function leaveAdInterestGroup (group, debug) {
	debug && echo.groupCollapsed('Fledge API: leaveAdInterest');
	debug && echo.log(echo.asProcess('deleting an existing interest group'));
	await db.store.delete(IG_STORE, getIGKey(group.owner, group.name));
	debug && echo.log(echo.asSuccess('interest group deleted'));
	debug && echo.groupEnd();

	return true;
}