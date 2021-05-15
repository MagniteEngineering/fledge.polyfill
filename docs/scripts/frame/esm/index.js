/* eslint-disable no-console, compat/compat */

let queue = [];
const TOKEN = {};
const RESET_INPUT = '%c ';
const RESET_CSS = '';

// Attach formatting utility method.
function alertFormatting (value) {
	queue.push({
		value,
		css: 'display: inline-block; background-color: #dc3545; color: #ffffff; font-weight: bold; padding: 3px 7px 3px 7px; border-radius: 3px 3px 3px 3px;',
	});

	return (TOKEN);
}

function infoFormatting (value) {
	queue.push({
		value,
		css: 'color: #0366d6; font-weight: bold;',
	});

	return (TOKEN);
}

function processFormatting (value) {
	queue.push({
		value: `${value}…`,
		css: 'color: #8c8c8c; font-style: italic;',
	});

	return (TOKEN);
}

function successFormatting (value) {
	queue.push({
		value,
		css: 'color: #289d45; font-weight: bold;',
	});

	return (TOKEN);
}

// Attach formatting utility method.
function warningFormatting (value) {
	queue.push({
		value,
		css: 'display: inline-block; background-color: #ffc107; color: black; font-weight: bold; padding: 3px 7px 3px 7px; border-radius: 3px 3px 3px 3px;',
	});

	return (TOKEN);
}

// I provide an echo-based proxy to the given Console Function. This uses an
// internal queue to aggregate values before calling the given Console
// Function with the desired formatting.
function using (consoleFunction) {
	function consoleFunctionProxy (...args) {
		// As we loop over the arguments, we're going to aggregate a set of
		// inputs and modifiers. The Inputs will ultimately be collapsed down
		// into a single string that acts as the first console.log parameter
		// while the modifiers are then SPREAD into console.log as 2...N.
		// --
		// NOTE: After each input/modifier pair, I'm adding a RESET pairing.
		// This implicitly resets the CSS after every formatted pairing.
		const inputs = [];
		const modifiers = [];
		args.forEach(arg => {
			// When the formatting utility methods are called, they return
			// a special token. This indicates that we should pull the
			// corresponding value out of the QUEUE instead of trying to
			// output the given argument directly.
			if (arg === TOKEN) {
				const item = queue.shift();

				inputs.push((`%c${item.value}`), RESET_INPUT);
				modifiers.push(item.css, RESET_CSS);

				// For every other argument type, output the value directly.
			} else {
				if ((typeof (arg) === 'object') || (typeof (arg) === 'function')) {
					inputs.push('%o', RESET_INPUT);
					modifiers.push(arg, RESET_CSS);
				} else {
					inputs.push((`%c${arg}`), RESET_INPUT);
					modifiers.push(RESET_CSS, RESET_CSS);
				}
			}
		});

		consoleFunction(inputs.join(''), ...modifiers);

		// Once we output the aggregated value, reset the queue. This should have
		// already been emptied by the .shift() calls; but the explicit reset
		// here acts as both a marker of intention as well as a fail-safe.
		queue = [];
	}

	return (consoleFunctionProxy);
}

const echo = {
	// Console(ish) functions.
	assert: using(console.assert),
	clear: using(console.clear),
	count: using(console.count),
	countReset: using(console.countReset),
	debug: using(console.debug),
	dir: using(console.dir),
	error: using(console.error),
	group: using(console.group),
	groupCollapsed: using(console.groupCollapsed),
	groupEnd: using(console.groupEnd),
	info: using(console.info),
	log: using(console.log),
	table: using(console.table),
	time: using(console.time),
	timeEnd: using(console.timeEnd),
	timeLog: using(console.timeLog),
	trace: using(console.trace),
	warn: using(console.warn),

	// Formatting functions.
	asAlert: alertFormatting,
	asInfo: infoFormatting,
	asProcess: processFormatting,
	asSuccess: successFormatting,
	asWarning: warningFormatting,
};

const VERSION = 1;

function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
        // @ts-ignore - file size hacks
        request.oncomplete = request.onsuccess = () => resolve(request.result);
        // @ts-ignore - file size hacks
        request.onabort = request.onerror = () => reject(request.error);
    });
}
function createStore(dbName, storeName) {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    const dbp = promisifyRequest(request);
    return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
let defaultGetStoreFunc;
function defaultGetStore() {
    if (!defaultGetStoreFunc) {
        defaultGetStoreFunc = createStore('keyval-store', 'keyval');
    }
    return defaultGetStoreFunc;
}
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function get(key, customStore = defaultGetStore()) {
    return customStore('readonly', (store) => promisifyRequest(store.get(key)));
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function set(key, value, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.put(value, key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Update a value. This lets you see the old value and update it as an atomic operation.
 *
 * @param key
 * @param updater A callback that takes the old value and returns a new value.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function update(key, updater, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => 
    // Need to create the promise manually.
    // If I try to chain promises, the transaction closes in browsers
    // that use a promise polyfill (IE10/11).
    new Promise((resolve, reject) => {
        store.get(key).onsuccess = function () {
            try {
                store.put(updater(this.result), key);
                resolve(promisifyRequest(store.transaction));
            }
            catch (err) {
                reject(err);
            }
        };
    }));
}
/**
 * Delete a particular key from the store.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function del(key, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.delete(key);
        return promisifyRequest(store.transaction);
    });
}
function eachCursor(customStore, callback) {
    return customStore('readonly', (store) => {
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // And openKeyCursor isn't supported by Safari.
        store.openCursor().onsuccess = function () {
            if (!this.result)
                return;
            callback(this.result);
            this.result.continue();
        };
        return promisifyRequest(store.transaction);
    });
}
/**
 * Get all entries in the store. Each entry is an array of `[key, value]`.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function entries(customStore = defaultGetStore()) {
    const items = [];
    return eachCursor(customStore, (cursor) => items.push([cursor.key, cursor.value])).then(() => items);
}

const customStore = createStore('fledge.v1', 'interest-groups');

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
const getIGKey = (owner, name) => `${owner}-${name}`;

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
 *   joinAdInterestGroup({ owner: 'foo', name: 'bar', biddingLogicUrl: 'http://example.com/bid' }, 2592000000);
 */
async function joinAdInterestGroup (options, expiry, debug) {
	debug && echo.groupCollapsed('Fledge API: joinAdInterest');
	const id = getIGKey(options.owner, options.name);
	const group = await get(id, customStore);
	debug && echo.log(echo.asInfo('checking for an existing interest group:'), group);
	if (group) {
		debug && echo.log(echo.asProcess('updating an interest group'));
		await update(id, old => ({
			...old,
			...options,
			_expired: Date.now() + expiry,
		}), customStore);
	} else {
		debug && echo.log(echo.asProcess('creating a new interest group'));
		await set(id, {
			_created: Date.now(),
			_expired: Date.now() + expiry,
			_updated: Date.now(),
			...options,
		}, customStore);
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
 *   leaveAdInterestGroup({ owner: 'foo', name: 'bar', biddingLogicUrl: 'http://example.com/bid' });
 */
async function leaveAdInterestGroup (group, debug) {
	debug && echo.groupCollapsed('Fledge API: leaveAdInterest');
	debug && echo.log(echo.asProcess('deleting an existing interest group'));
	await del(getIGKey(group.owner, group.name), customStore);
	debug && echo.log(echo.asSuccess('interest group deleted'));
	debug && echo.groupEnd();

	return true;
}

/*
 * @function
 * @name getEligible
 * @description filter all buyers by their owner field to ensure they're eligible to bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} groups - an array of objects containing interest group buyers
 * @param {array<String>} eligibility - a list of eligible owners to check against
 * @return {Array<Object> | null} an array of objects; null if none found;
 */
const getEligible = (groups, eligibility, debug) => {
	debug && echo.groupCollapsed('auction utils: getEligible');
	if (eligibility === '*') {
		debug && echo.info(`using the wildcard yields all groups`);
		debug && echo.groupEnd();
		return groups;
	}

	const eligible = groups.filter(([ key, value ]) => eligibility.includes(value.owner));
	if (eligible.length) {
		debug && echo.info(`found some eligible buyers`);
		debug && echo.groupEnd();
		return eligible;
	}

	debug && echo.log(echo.asWarning(`No groups were eligible!`));
	debug && echo.groupEnd();
	return null;
};

/*
 * @function
 * @name getBids
 * @description given a set of bidders, grab their bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bidders - a list of bidders (also referred to as interest groups)
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} an array of objects containing bids; null if none found
 */
const getBids = async (bidders, conf, debug) => Promise.all(
	bidders.map(async ([ key, bidder ]) => {
		debug && echo.groupCollapsed(`auction utils: getBids => ${key}`);
		const time0 = performance.now();
		const { generateBid } = await import(bidder.biddingLogicUrl);

		// check if there is even a generateBid function
		// if not, removed bidder from elibility
		if (!generateBid && typeof generateBid !== 'function') {
			debug && echo.log(echo.asWarning(`No 'generateBid' function found!`));
			debug && echo.groupEnd();
			return null;
		}

		const trustedSignals = await getTrustedSignals(bidder?.trustedBiddingSignalsUrl, bidder?.trustedBiddingSignalsKeys, debug);

		// generate a bid by providing all of the necessary information
		let bid;
		try {
			debug && echo.log(echo.asProcess(`generating a bid`));
			debug && echo.groupCollapsed(`generateBid params:`);
			debug && echo.log(echo.asInfo(`bidder:`), bidder);
			debug && echo.log(echo.asInfo(`auction signals:`), conf?.auctionSignals);
			debug && echo.log(echo.asInfo(`per buyer signals:`), conf?.perBuyerSignals?.[bidder.owner]);
			debug && echo.log(echo.asInfo(`trusted bidding signals:`), trustedSignals);
			debug && echo.groupEnd();
			bid = generateBid(bidder, conf?.auctionSignals, conf?.perBuyerSignals?.[bidder.owner], trustedSignals, {
				topWindowHostname: window.top.location.hostname,
				seller: conf.seller,
			});
			debug && echo.log(echo.asInfo('bid:'), bid);
		} catch (err) {
			debug && echo.log(echo.asAlert(`There was an error in the 'generateBid' function:`));
			debug && echo.log(err);
			return null;
		}

		// check if generateBid function returned the necessary parts to score
		// if not, removed bidder from elibility
		if (!(
			(bid.ad && typeof bid.ad === 'object') &&
			(bid.bid && typeof bid.bid === 'number') &&
			(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
		)) {
			debug && echo.log(echo.asWarning(`No bid found!`));
			debug && echo.groupEnd();
			return null;
		}

		const time1 = performance.now();
		debug && echo.groupEnd();
		return {
			...bidder,
			...bid,
			duration: time1 - time0,
		};
	}),
);

/*
 * @function
 * @name getScores
 * @description given a set of bids, grab their score
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bids - a list of bids to score
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} a sorted, filtered array of objects containing scores
 */
const getScores = async (bids, conf, debug) => {
	debug && echo.groupCollapsed(`auction utils: getScores`);
	const { scoreAd } = await import(conf.decisionLogicUrl);

	// check if there is even a scoreAd function
	// if not, return null
	if (!scoreAd && typeof scoreAd !== 'function') {
		debug && echo.log(echo.asWarning(`No 'scoreAd' function was found!`));
		return null;
	}

	return Promise.all(bids.map(async bid => {
		debug && echo.groupCollapsed(`auction utils: getScores => ${bid.name}`);
		echo.log(echo.asInfo('bid:'), bid);

		let trustedSignalsKeys;
		if (bid.ad && bid.ad.length > 0) {
			trustedSignalsKeys = bid?.ad?.map(({ renderUrl }) => renderUrl);
		}
		echo.log(echo.asInfo('trusted scoring signals keys:'), trustedSignalsKeys);
		const trustedSignals = await getTrustedSignals(conf?.trustedScoringSignalsUrl, trustedSignalsKeys, debug);

		let score;
		try {
			debug && echo.log(echo.asProcess(`scoring a bid`));
			debug && echo.groupCollapsed(`scoreAd params:`);
			debug && echo.log(echo.asInfo(`ad:`), bid?.ad);
			debug && echo.log(echo.asInfo(`bid:`), bid?.bid);
			debug && echo.log(echo.asInfo(`conf:`), conf);
			debug && echo.log(echo.asInfo(`trusted scoring signals:`), trustedSignals);
			debug && echo.groupEnd();
			score = scoreAd(bid?.ad, bid?.bid, conf, trustedSignals, {
				topWindowHostname: window.top.location.hostname,
				interestGroupOwner: bid.owner,
				interestGroupName: bid.name,
				biddingDurationMsec: bid.duration,
			});
			debug && echo.log(echo.asInfo(`score:`), score);
		} catch (err) {
			debug && echo.log(echo.asAlert(`There was an error in the 'scoreAd' function:`));
			debug && echo.log(err);
			score = -1;
		}
		debug && echo.groupEnd();

		debug && echo.groupEnd();
		return {
			bid,
			score,
		};
	}));
};

/*
 * @function
 * @name uuid
 * @description create a UUID per v4 spec
 * @author broofa <https://stackoverflow.com/users/109538>
 * @link https://stackoverflow.com/a/2117523
 * @return {string} a UUID string
 */
const uuid = () => ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11)
	.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/*
 * @function
 * @name getTrustedSignals
 * @description grab the data from trusted bidding signals URL and keys
 * @author Newton <cnewton@magnite.com>
 * @param {string} a valid URL in the form of a string
 * @param {array<String>} an array of strings
 * @return {object} a JSON response
 */
const getTrustedSignals = async (url, keys, debug) => {
	debug && echo.groupCollapsed('auction utils: getTrustedSignals');
	const hostname = `hostname=${window.top.location.hostname}`;

	if (!(url && keys)) {
		debug && echo.log(echo.asWarning(`No 'url' or 'keys' found!`));
		debug && echo.groupEnd();
		return undefined;
	}

	const isJSON = response => /\bapplication\/json\b/.test(response?.headers?.get('content-type'));

	debug && echo.log(echo.asProcess(`fetching keys from trusted signals url: ${url}`));
	let data;
	try {
		const response = await fetch(`${url}?${hostname}&keys=${keys.join(',')}`);
		echo.log(echo.asInfo('response:'), response);
		if (!response.ok) {
			debug && echo.log(echo.asWarning(`Something went wrong! The response returned was not ok.`));
			debug && echo.log({ response });
			// throw new Error('Something went wrong! The response returned was not ok.');
			return null;
		}

		if (!isJSON(response)) {
			debug && echo.log(echo.asWarning(`Response was not in the format of JSON. Response was: ${response?.headers?.get('content-type')}`));
			// throw new Error('Response was not in the format of JSON.');
			return null;
		}
		data = await response.json();
	} catch (error) {
		debug && echo.log(echo.asAlert('There was a problem with your fetch operation:'));
		debug && echo.log(error);
		return null;
	}
	debug && echo.log(echo.asSuccess('response:'), data);

	const signals = {};
	for (const key in data) {
		if (keys.includes(key)) {
			signals[key] = data[key];
		}
	}
	debug && echo.log(signals);
	debug && echo.log(Object.keys(signals).length === 0);
	debug && echo.log(signals.constructor !== Object);
	if (!signals || Object.keys(signals).length === 0 || signals.constructor !== Object) {
		debug && echo.log(echo.asWarning(`No signals found!`));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.log(echo.asSuccess('signals:'), signals);
	debug && echo.groupEnd();
	return signals;
};

/*
 * @function
 * @name runAdAuction
 * @description run an auction
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to configure an auction
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {null | Promise<Token>}
 *
 * @example
 *   runAdAuction({ seller: 'foo', decisionLogicUrl: 'http://example.com/auction', interestGroupBuyers: [ 'www.buyer.com' ] });
 */
async function runAdAuction (conf, debug) {
	debug && echo.groupCollapsed('Fledge API: runAdAuction');
	const interestGroups = await entries(customStore);
	debug && echo.log(echo.asInfo('all interest groups:'), interestGroups);

	const eligible = getEligible(interestGroups, conf.interestGroupBuyers, debug);
	debug && echo.log(echo.asInfo('eligible buyers based on "interestGroupBuyers":'), eligible);
	if (!eligible) {
		debug && echo.log(echo.asAlert('No eligible interest group buyers found!'));
		return null;
	}

	const bids = await getBids(eligible, conf, debug);
	debug && echo.log(echo.asInfo('all bids from each buyer:'), bids);

	const filteredBids = bids.filter(item => item);
	debug && echo.log(echo.asInfo('filtered bids:'), filteredBids);
	if (!filteredBids.length) {
		debug && echo.log(echo.asAlert('No bids found!'));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.log(echo.asProcess('getting all scores, filtering and sorting'));
	const winners = await getScores(filteredBids, conf, debug);
	const [ winner ] = winners
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
	debug && echo.log(echo.asInfo('winner:'), winner);
	if (!winner) {
		debug && echo.log(echo.asAlert('No winner found!'));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.log(echo.asProcess('creating an entry in the auction store'));
	const token = uuid();
	sessionStorage.setItem(token, JSON.stringify({
		origin: `${window.top.location.origin}${window.top.location.pathname}`,
		timestamp: Date.now(),
		conf,
		...winner,
	}));
	debug && echo.log(echo.asSuccess('auction token:'), token);

	debug && echo.groupEnd();
	return token;
}

async function fledgeAPI ({ data, ports }) {
	try {
		if (!Array.isArray(data)) {
			throw new Error(`The API expects the data to be in the form of an array, with index 0 set to the action, and index 1 set to the data.  A ${typeof data} was passed instead.`);
		}

		switch (data[0]) {
			case 'joinAdInterestGroup': {
				const [ , request ] = data;
				const [ options, expiry, debug ] = request;

				await joinAdInterestGroup(options, expiry, debug);

				return true;
			}
			case 'leaveAdInterestGroup': {
				const [ , request ] = data;
				const [ group, debug ] = request;

				await leaveAdInterestGroup(group, debug);

				return true;
			}
			case 'runAdAuction': {
				const [ , request ] = data;
				const [ conf, debug ] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [ port ] = ports;
				const token = await runAdAuction(conf, debug);
				const response = [ true, token ];
				port.postMessage(response);
				port.close();

				return true;
			}
			default: {
				return false;
			}
		}
	} catch (error) {
		const response = [ false ];
		for (const port of ports) {
			port.postMessage(response);
		}
		throw error;
	}
}

async function frame () {
	const { searchParams } = new URL(window.location);
	const debug = searchParams.get('debug') || false;
	debug && echo.group('Fledge: Storage Frame');

	const admin = searchParams.get('admin') || false;

	if (!admin) {
		// check whenever the document is being framed by a site which you don’t expect it to be framed by
		const [ parentOrigin ] = window.location.ancestorOrigins;
		if (parentOrigin === undefined) {
			debug && echo.log(echo.asWarning('It appears your attempting to access this from the top-level document'));
			debug && echo.log({ origin: parentOrigin, location: window.location });
			throw new Error(`Can't call 'postMessage' on the Frame window when run as a top-level document`);
		}

		// connect to the storage iframe and send a message
		const { port1: receiver, port2: sender } = new MessageChannel();
		debug && echo.log('message channel receiver:', receiver);
		debug && echo.log('message channel sender:', sender);
		receiver.onmessage = fledgeAPI;
		window.parent.postMessage({
			'fledge.polyfill': VERSION,
		}, parentOrigin, [ sender ]);
	}
	debug && echo.groupEnd();
}

export default frame;
