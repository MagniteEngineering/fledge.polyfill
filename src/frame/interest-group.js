import * as idb from 'idb-keyval';

export const customStore = idb.createStore('fledge.v1', 'interest-groups');

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
 * @return {Promise<void>}
 *
 * @example
 *   joinAdInterestGroup({ owner: 'foo', name: 'bar', biddingLogicUrl: 'http://example.com/bid' }, 2592000000);
 */
export function joinAdInterestGroup (options, expiry) {
	const id = getIGKey(options.owner, options.name);
	const group = idb.get(id, customStore);
	if (group) {
		return idb.update(id, old => ({
			...old,
			...options,
			_expired: Date.now() + expiry,
		}), customStore);
	}

	return idb.set(id, {
		_created: Date.now(),
		_expired: Date.now() + expiry,
		_updated: Date.now(),
		...options,
	}, customStore);
}

/*
 * @function
 * @name leaveAdInterestGroup
 * @description leave an interest group removing from IndexedDB
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {Promise<void>}
 *
 * @example
 *   leaveAdInterestGroup({ owner: 'foo', name: 'bar', biddingLogicUrl: 'http://example.com/bid' });
 */
export const leaveAdInterestGroup = group =>
	idb.del(getIGKey(group.owner, group.name), customStore);
