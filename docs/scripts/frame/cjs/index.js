'use strict';

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			}
		});
	}
	n['default'] = e;
	return Object.freeze(n);
}

const VERSION = 1;

/*
 * @function
 * @name call
 * @description wrap a promise in a reliable api, similar to Go-style
 * @author Newton <cnewton@magnite.com>
 * @param {promise} promise - a promise
 * @return {Promise<Array>} a promise that resolves to data as the first index in an array, and/or an error in the second index
 */
const call$1 = promise => promise
	.then(data => ([ data, undefined ]))
	.catch(error => Promise.resolve([ undefined, error ]));

/*
 * @function
 * @name dynamicImport
 * @description dynamically imports a function
 * @author Newton <cnewton@magnite.com>
 * @param {URL} url - a fully qualified URL to an ES6 module
 * @param {string} fn - a function name that exists at the URL
 * @param {nargs} args - any level of arguments/parameters that the function takes
 * @return {any} any set of data that the function returns
 */
const dynamicImport$1 = async (url, fn, ...args) => {
	const [ module, moduleErr ] = await call$1(Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(url)); }));

	if (moduleErr) {
		return null;
	}

	if (!module[fn] || typeof module[fn] !== 'function') {
		return null;
	}

	try {
		return module[fn](...args);
	} catch (err) {
		return null;
	}
};

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
 * @return {Promise<void>}
 *
 * @example
 *   joinAdInterestGroup({ owner: 'foo', name: 'bar', biddingLogicUrl: 'http://example.com/bid' }, 2592000000);
 */
function joinAdInterestGroup (options, expiry) {
	const id = getIGKey(options.owner, options.name);
	const group = get(id, customStore);
	if (group) {
		return update(id, old => ({
			...old,
			...options,
			_expired: Date.now() + expiry,
		}), customStore);
	}

	return set(id, {
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
const leaveAdInterestGroup = group =>
	del(getIGKey(group.owner, group.name), customStore);

const call = promise => promise
	.then(data => ([ data, undefined ]))
	.catch(error => Promise.resolve([ undefined, error ]));

const dynamicImport = async (url, fn, ...args) => {
	const [ module, moduleErr ] = await call(Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(url)); }));

	if (moduleErr) {
		return null;
	}

	if (!module[fn] || typeof module[fn] !== 'function') {
		return null;
	}

	try {
		return module[fn](...args);
	} catch (err) {
		return null;
	}
};

/*
 * @function
 * @name getBid
 * @description grab a bid
 * @author Newton <cnewton@magnite.com>
 * @param {Object} bidder - a bidders (also referred to as interest groups)
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} an array of objects containing bids; null if none found
 */
const getBid = async (bidder, conf) => {
	const startTime = performance.now();
	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const trustedSignals = await getTrustedSignals(bidder?.trustedBiddingSignalsUrl, bidder?.trustedBiddingSignalsKeys);
	const bid = await dynamicImport(bidder.biddingLogicUrl, 'generateBid', bidder, conf?.auctionSignals, conf?.perBuyerSignals?.[bidder.owner], trustedSignals, {
		topWindowHostname: hostname,
		seller: conf.seller,
	});

	// check if generateBid function returned the necessary parts to score
	// if not, removed bidder from elibility
	if (!(
		(bid.ad && typeof bid.ad === 'object') &&
		(bid.bid && typeof bid.bid === 'number') &&
		(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
	)) {
		return false;
	}

	const endTime = performance.now();
	return {
		...bidder,
		...bid,
		duration: endTime - startTime,
	};
};

/*
 * @function
 * @name getScores
 * @description given a set of bids, grab their score
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bids - a list of bids to score
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} a sorted, filtered array of objects containing scores
 */
const getScores = async (bids, conf) => Promise.all(bids.map(async bid => {
	let trustedSignalsKeys;
	if (bid.ad && bid.ad.length > 0) {
		trustedSignalsKeys = bid?.ad?.map(({ renderUrl }) => renderUrl);
	}
	const trustedSignals = await getTrustedSignals(conf?.trustedScoringSignalsUrl, trustedSignalsKeys);

	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const score = await dynamicImport(conf.decisionLogicUrl, 'scoreAd', bid?.ad, bid?.bid, conf, trustedSignals, {
		topWindowHostname: hostname,
		interestGroupOwner: bid.owner,
		interestGroupName: bid.name,
		biddingDurationMsec: bid.duration,
	});

	return {
		bid,
		score,
	};
}));

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
const getTrustedSignals = async (url, keys) => {
	if (!(url && keys)) {
		return undefined;
	}

	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const isJSON = response => /\bapplication\/json\b/.test(response?.headers?.get('content-type'));

	const [ response, responseErr ] = await call(fetch(`${url}?hostname=${hostname}&keys=${keys.join(',')}`));
	if (responseErr || !response.ok || !isJSON(response)) {
		return null;
	}

	const data = await response.json();

	const signals = {};
	for (const key in data) {
		if (keys.includes(key)) {
			signals[key] = data[key];
		}
	}
	if (!signals || Object.keys(signals).length === 0 || signals.constructor !== Object) {
		return null;
	}

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
async function runAdAuction (conf) {
	const entries$1 = await entries(customStore);
	const interestGroups = entries$1
		.flatMap(([ key, value ]) => value) // flatten the two-dimensional array ([igKey, igKeyProps]) to only igKeyProps
		.filter(item => conf.interestGroupBuyers !== '*' ? conf.interestGroupBuyers.includes(item.owner) : item); // check owner of ig is allowed per conf.interestGroupBuyers
	if (!interestGroups || !Array.isArray(interestGroups) || interestGroups.length === 0) {
		return null;
	}

	const bids = await Promise
		.all(interestGroups
			.map(bidder => getBid(bidder, conf))
			.filter(item => item),
		);
	if (!bids.length) {
		return null;
	}

	const winners = await getScores(bids, conf);
	const [ winner ] = winners
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
	if (!winner) {
		return null;
	}

	const token = uuid();
	sessionStorage.setItem(token, JSON.stringify({
		timestamp: Date.now(),
		conf,
		winner,
	}));

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
				const [ options, expiry ] = request;

				await joinAdInterestGroup(options, expiry);

				return true;
			}
			case 'leaveAdInterestGroup': {
				const [ , request ] = data;
				const [ group ] = request;

				await leaveAdInterestGroup(group);

				return true;
			}
			case 'runAdAuction': {
				const [ , request ] = data;
				const [ conf ] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [ port ] = ports;
				const token = await runAdAuction(conf);
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

function mainFrame () {
	// check whenever the document is being framed by a site which you don’t expect it to be framed by
	const [ parentOrigin ] = window.location.ancestorOrigins;
	if (parentOrigin === undefined) {
		throw new Error(`Can't call 'postMessage' on the Frame window when run as a top-level document`);
	}

	const { hash } = window.location;
	if (hash) {
		const { conf, winner } = JSON.parse(sessionStorage.getItem(hash.substring(1)));
		const { hostname } = new URL(parentOrigin);
		if (!winner) {
			throw new Error(`A token was not found! Token provided: ${hash}`);
		}

		const iframe = window.document.createElement('iframe');
		iframe.src = winner.bid.render;
		iframe.style['border-width'] = 0;
		iframe.style.width = winner.bid?.ad?.size?.width || '100%';
		iframe.style.height = winner.bid?.ad?.size?.height || '100%';
		window.document.body.style.margin = '0';
		window.document.body.appendChild(iframe);

		// get the sellers report
		dynamicImport$1(conf.decisionLogicUrl, 'reportResult', conf, {
			topWindowHostname: hostname,
			interestGroupOwner: winner.bid.owner,
			interestGroupName: winner.bid.name,
			renderUrl: winner.bid.render,
			bid: winner.bid.bid,
		}).then(report => {
			// get the buyers report
			dynamicImport$1(winner.bid.biddingLogicUrl, 'reportWin', conf?.auctionSignals, conf?.perBuyerSignals?.[winner.bid.owner], report, {
				topWindowHostname: hostname,
				interestGroupOwner: winner.bid.owner,
				interestGroupName: winner.bid.name,
				renderUrl: winner.bid.render,
				bid: winner.bid.bid,
			});
		});
	} else {
		// connect to the storage iframe and send a message
		const { port1: receiver, port2: sender } = new MessageChannel();
		receiver.onmessage = fledgeAPI;
		window.parent.postMessage({
			'fledge.polyfill': VERSION,
		}, parentOrigin, [ sender ]);
	}
}

mainFrame();
