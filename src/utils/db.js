import { openDB } from '../../node_modules/idb/build/esm/index.js';

/*
 * @const {number}
 * @summary the name of the Interest Group store within IndexedDB
 * @description Milliseconds occuring per day multiplied by the maximum number of days (maximum dayus (30) * hours per day (24) * minutes per hour (60) * seconds per minute (60) * milliseconds per second (1000))
 */
const IG_STORE = 'interest-groups';

/*
 * @function
 * @name getKey
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
const getKey = (owner, name) => `${owner}-${name}`;

/*
 * @function
 * @name db
 * @description create an Indexed dB
 * @author Newton <cnewton@magnite.com>
 * @return {promise} a promise
 *
 * @example
 *   getKey('foo', 'bar');
 *   // 'foo-bar'
 */
const db = openDB('Fledge', 1, {
	upgrade (db) {
		// Create a store of objects
		const store = db.createObjectStore(IG_STORE, {
			// The '_key' property of the object will be the key.
			keyPath: '_key',
		});

		// Create an index on the a few properties of the objects.
		[ 'owner', 'name', '_expired' ].forEach(index => {
			store.createIndex(index, index, { unique: false });
		});
	},
});

/*
 * @function
 * @name getInterestGroup
 * @description retrieve the key for an interest group form the store
 * @author Newton <cnewton@magnite.com>
 * @param {string} owner - owner of the interest group
 * @param {string} name - name of the interest group
 * @return {object} an object representing an interest group
 *
 * @example
 *   db.read('foo', 'bar');
 *   // 'foo-bar'
 */
async function getInterestGroup (owner, name) {
	const group = (await db).get(IG_STORE, getKey(owner, name));

	if (group) {
		return group;
	}

	return null;
}

/*
 * @function
 * @name updateInterestGroup
 * @description update an interest groups values
 * @author Newton <cnewton@magnite.com>
 * @param {object} group - An existing interest group
 * @param {object} options - An object of options to create an interest group {@link types}
 * @param {number} expiry - A number of the days (in milliseconds) an interest group should exist, not to exceed 30 days
 * @return {string} the key of the interest group
 *
 * @example
 *   db.update({ bidding_logic_url: '://v2/bid' }, { owner: 'foo', name: 'bar' }, 1234);
 *   // 'foo-bar'
 */
async function updateInterestGroup (group, options, expiry) {
	const updated = {
		...group,
		...options,
		_expired: expiry,
		_updated: Date.now(),
	};

	return (await db).put(IG_STORE, updated);
}

/*
 * @function
 * @name createInterestGroup
 * @description create a interest group in the Indexed dB
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @param {number} expiry - A number of the days (in milliseconds) an interest group should exist, not to exceed 30 days
 * @return {string} the key of the interest group
 *
 * @example
 *   db.create({ owner: 'foo', name: 'bar' }, 1234);
 *   // { owner: 'foo', name: 'bar', ... }
 */
async function createInterestGroup (options, expiry) {
	return (await db).add(IG_STORE, {
		_key: getKey(options.owner, options.name),
		_created: Date.now(),
		_updated: Date.now(),
		_expired: Date.now() + expiry,
		...options,
	});
}

/*
 * @function
 * @name deleteInterestGroup
 * @description delete a record from Indexed dB
 * @author Newton <cnewton@magnite.com>
 * @param {string} key - a key made of the owner and name separated by a hyphen
 * @return {string}
 *
 * @example
 *   db.delete('owner-name');
 */
async function deleteInterestGroup (group) {
	return (await db).delete(IG_STORE, getKey(group.owner, group.name));
}

export default {
	create: createInterestGroup,
	read: getInterestGroup,
	update: updateInterestGroup,
	delete: deleteInterestGroup,
};
