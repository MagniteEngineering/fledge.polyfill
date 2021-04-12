import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@6.0.0/with-async-ittr.js';

export async function joinAdInterestGroup (options, expiry) {
	const db = await openDB('Interest Groups', 1, {
		upgrade (db) {
			// Create a store of objects
			const store = db.createObjectStore('interest-groups', {
				// The '_key' property of the object will be the key.
				keyPath: '_key',
				// If it isn't explicitly set, create a value by auto incrementing.
				autoIncrement: true,
			});
			// Create an index on the a few properties of the objects.
			store.createIndex('owner', 'owner', { unique: false });
			store.createIndex('name', 'name', { unique: false });
			store.createIndex('_expires', '_expires', { unique: false });
		},
	});

	const ig = await db.get('interest-groups', `${options.owner}-${options.name}`);
	if (!ig) {
		// Add a group:
		await db.add('interest-groups', {
			_key: `${options.owner}-${options.name}`,
			_date: Date.now(),
			_expires: Date.now() + expiry,
			owner: options.owner,
			name: options.name,
		});
	}
}
