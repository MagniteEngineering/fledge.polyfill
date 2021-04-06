import { openDB } from '../../node_modules/idb/with-async-ittr.js';

const hoursPerDay = 24;
const minsPerHour = 60;
const secsPerMinute = 60;
const msPerSeconds = 1000;
const msPerDay = hoursPerDay * minsPerHour * secsPerMinute * msPerSeconds;
const expiry = 30 * msPerDay;
console.log(msPerDay);

async function demo() {
	/*
	const db = await openDB('Interest Groups', 1, {
		upgrade(db) {
			// Create a store of objects
			const store = db.createObjectStore('interest-groups', {
				// The 'id' property of the object will be the key.
				keyPath: 'id',
				// If it isn't explicitly set, create a value by auto incrementing.
				autoIncrement: true,
			});
			// Create an index on the 'date' property of the objects.
			store.createIndex('owner', 'owner');
		},
	});

	// Add an article:
	await db.add('interest-groups', {
		owner: 'www.magnite.com',
		name: "womens-running-shoes",
		date: Date.now(),
		expire: Date.now() + (30 * 86400000),
	});

	// Add multiple articles in one transaction:
	{
		const tx = db.transaction('interest-groups', 'readwrite');
		await Promise.all([
			tx.store.add({
				owner: 'www.magnite.com',
				name: "mens-running-shoes",
				date: Date.now(),
				expire: Date.now() + (30 * 86400000),
			}),
			tx.store.add({
				owner: 'www.ssp.com',
				name: "running-shoes",
				date: Date.now(),
				expire: Date.now() + (30 * 86400000),
			}),
			tx.done,
		]);
	}

	// Get all the articles in date order:
	console.log(await db.getAllFromIndex('interest-group', 'owner'));

	// Add 'And, happy new year!' to all articles on 2019-01-01:
	{
		const tx = db.transaction('interest-group', 'readwrite');
		const index = tx.store.index('owner');

		for await (const cursor of index.iterate(new Date('2019-01-01'))) {
			const group = { ...cursor.value };
			group.body += ' And, happy new year!';
			cursor.update(article);
		}

		await tx.done;
	}
	*/
}

// await demo();

export async function joinAdInterestGroup(options, expiry) {
	const db = await openDB('Interest Groups', 1, {
		upgrade(db) {
			// Create a store of objects
			const store = db.createObjectStore('interest-groups', {
				// The 'id' property of the object will be the key.
				keyPath: '_key',
				// If it isn't explicitly set, create a value by auto incrementing.
				autoIncrement: true,
			});
			// Create an index on the 'date' property of the objects.
			store.createIndex('owner', 'owner', { unique: false });
			store.createIndex('name', 'name', { unique: false });
			store.createIndex('_expires', '_expires', { unique: false });
		},
	});

	const ig = await db.get('interest-groups', `${options.owner}-${options.name}`);
	console.log(ig);
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

	if (options.update) {
		ig.name = "an-updated-value";
		await db.put("interest-groups", ig);
	}
}
