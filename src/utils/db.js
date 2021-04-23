import { openDB } from 'idb';

/*
 * @const {string}
 * @summary the name of the Auction store within IndexedDB
 */
export const AUCTION_STORE = 'auction';

/*
 * @const {string}
 * @summary the name of the Interest Group store within IndexedDB
 */
export const IG_STORE = 'interest-groups';

/*
 * @function
 * @name db
 * @description create an Indexed dB
 * @author Newton <cnewton@magnite.com>
 * @return {promise} a promise
 */
const db = openDB('Fledge', 1, {
	upgrade (db) {
		// Create a store of objects
		const igStore = db.createObjectStore(IG_STORE, {
			// The '_key' property of the object will be the key.
			keyPath: '_key',
		});

		// Create an index on the a few properties of the objects.
		[ 'owner', 'name', '_expired' ].forEach(index => {
			igStore.createIndex(index, index, { unique: false });
		});

		db.createObjectStore(AUCTION_STORE, {
			// The 'id' property of the object will be the key.
			keyPath: 'id',
		});
	},
});

/*
 * @function
 * @name getItemFromStore
 * @description retrieve an item from an IDB store
 * @author Newton <cnewton@magnite.com>
 * @param {string} store - the name of the store from which to retreive
 * @param {string} id - the id; typically matches the keyPath of a store
 * @return {object} an object representing an interest group
 *
 * @example
 *   store.get('someStore', 'foo');
 */
async function getItemFromStore (store, id) {
	const item = (await db).get(store, id);

	if (item) {
		return item;
	}

	return null;
}

/*
 * @function
 * @name getAllFromStore
 * @description retrieve all items from an IDB store
 * @author Newton <cnewton@magnite.com>
 * @param {string} store - the name of the store from which to retreive
 * @return {array<Object>} an array of objects representing all items from a store
 *
 * @example
 *   store.getAll('someStore');
 */
async function getAllFromStore (store) {
	const items = (await db).getAll(store);

	if (items) {
		return items;
	}

	return null;
}

/*
 * @function
 * @name updateItemInStore
 * @description update an item in an IDB store
 * @author Newton <cnewton@magnite.com>
 * @param {string} store - the name of the store from which to retreive
 * @param {object} item - An existing item
 * @param {object} newOptions - a new set of options to merge with the item
 * @return {string} the key of the item updated
 *
 * @example
 *   store.put('someStore', { bidding_logic_url: '://v2/bid' }, { owner: 'foo', name: 'bar' }, 1234);
 */
async function updateItemInStore (store, item, newOptions) {
	const updated = {
		...item,
		...newOptions,
		_updated: Date.now(),
	};

	return (await db).put(store, updated);
}

/*
 * @function
 * @name createItemInStore
 * @description create an item in an IDB store
 * @author Newton <cnewton@magnite.com>
 * @param {string} store - the name of the store from which to retreive
 * @param {object} options - An object of options to make up item
 * @return {string} the key of the item created
 *
 * @example
 *   store.add('someStore', { owner: 'foo', name: 'bar' });
 */
async function createItemInStore (store, options) {
	return (await db).add(store, {
		...options,
		_created: Date.now(),
		_updated: Date.now(),
	});
}

/*
 * @function
 * @name deleteItemFromStore
 * @description delete a record from Indexed dB
 * @author Newton <cnewton@magnite.com>
 * @param {string} store - the name of the store from which to retreive
 * @param {string} id - the id; typically matches the keyPath of a store
 * @return {undefined}
 *
 * @example
 *   store.delete('owner-name');
 */
async function deleteItemFromStore (store, id) {
	return (await db).delete(store, id);
}

export default {
	db,
	store: {
		add: createItemInStore,
		get: getItemFromStore,
		getAll: getAllFromStore,
		put: updateItemInStore,
		delete: deleteItemFromStore,
	},
};
