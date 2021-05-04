/* eslint-disable compat/compat, no-console */

let queue = [];
const TOKEN = {};
const RESET_INPUT = '%c ';
const RESET_CSS = '';

// Attach formatting utility method.
function alertFormatting (value) {
	queue.push({
		value,
		css: 'display: inline-block ; background-color: #e0005a ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px ;',
	});

	return (TOKEN);
}

// Attach formatting utility method.
function warningFormatting (value) {
	queue.push({
		value,
		css: 'display: inline-block ; background-color: gold ; color: black ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px ;',
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

var echo = {
	// Console(ish) functions.
	error: using(console.error),
	info: using(console.info),
	log: using(console.log),
	group: using(console.group),
	groupEnd: using(console.groupEnd),
	table: using(console.table),
	trace: using(console.trace),
	warn: using(console.warn),

	// Formatting functions.
	asAlert: alertFormatting,
	asWarning: warningFormatting,
};

const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then((value) => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking)
            db.addEventListener('versionchange', () => blocking());
    })
        .catch(() => { });
    return openPromise;
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));

/*
 * @const {string}
 * @summary the name of the Auction store within IndexedDB
 */
const AUCTION_STORE = 'auction';

/*
 * @const {string}
 * @summary the name of the Interest Group store within IndexedDB
 */
const IG_STORE = 'interest-groups';

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

var db$1 = {
	db,
	store: {
		add: createItemInStore,
		get: getItemFromStore,
		getAll: getAllFromStore,
		put: updateItemInStore,
		delete: deleteItemFromStore,
	},
};

/*
 * @function
 * @name renderFrame
 * @description renders an iFrame when given a target and source URL
 * @author Newton <cnewton@magnite.com>
 * @param {DOM Node} target - a valid DOM node with which to append an iframe
 * @param {object} source - a valid winning ad object to render within the iframe
 * @throws {Error} if no source URL is found based on the selector provided
 * @return {void}
 */
const createFrame = ({ source, target = document.body, props = {}, style = {} }) => {
	if (!source) {
		throw new Error(`Something went wrong! No URL was found.`);
	}
	const src = new URL(source, document.baseURI);
	const iframe = document.createElement('iframe');
	const _props = {
		src,
		scrolling: 'no',
		...props,
	};
	const _style = {
		'border-width': 0,
		...style,
	};
	Object.entries(_props).map(([ key, value ]) => iframe.setAttribute(key, value));
	Object.entries(_style).map(([ key, value ]) => iframe.style.setProperty(key, value));

	target.appendChild(iframe);

	return {
		iframe,
		origin: src.origin,
	};
};

var frame = {
	create: createFrame,
};

/* eslint-disable compat/compat */

/*
 * @function
 * @name hasRequiredKeys
 * @description Searches an object for required keys
 * @author Newton <cnewton@magnite.com>
 * @param {object} obj - An object to validate that required keys are present
 * @param {array} keys - An array of required keys to validate exist
 * @throws {Error} If required keys are missing
 * @return {false} If no required keys are missing
 *
 * @example
 *   hasRequiredKeys({ foo: 'bar', baz: 'qux' }, [ 'foo' ]));
 */
const hasRequiredKeys = (obj, keys) => {
	const missing = keys.filter(key => !obj.hasOwnProperty(key));

	if (missing.length) {
		throw new Error(`Required options are missing! You must provide an 'object' of options with all of the following required options: ${missing.join(', ')}.`);
	}

	return false;
};

/*
 * @function
 * @name printInvalidOptionTypes
 * @description Provides an array of strings of errors for invalid types for options passed to a function
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options passed to a function
 * @param {array} invalid - An array of options that are invalid based on their type
 * @param {object} types - An object of options with the keys the same as the `options` and values set to data types
 * @return {string[]} An array of strings with messages of invalid types
 *
 * @example
 *   printInvalidOptionTypes({ foo: 0 }, [ 'foo' ], { foo: 'string' }));
 *   // [ `'mock' requires a type of "string"! A type of number was provided instead.` ]
 */
const printInvalidOptionTypes = (options, invalid, types) => invalid.map(item => `'${item}' requires a type of "${types[item]}"! A type of ${typeof options[item]} was provided instead.`);

/*
 * @function
 * @name validateType
 * @description Validates data types
 * @author Newton <cnewton@magnite.com>
 * @param {*}
 * @return {boolean} Whether or not the data type passed in matches
 *
 * @example
 *   validateType.array([ 'foo', 'bar' ]);
 *   validateType.number(0);
 *   validateType.object({ foo: 'bar' });
 *   validateType.string('foo');
 *   validateType.url({ foo: 'bar' });
 */
const validateType = {
	array: arr => arr !== 'undefined' && Array.isArray(arr),
	number: num => num !== 'undefined' && typeof num === 'number',
	object: obj => obj !== 'undefined' && typeof obj === 'object' && obj !== null && !Array.isArray(obj),
	string: str => str !== 'undefined' && typeof str === 'string',
	mixed: type => type !== 'undefined' && (Array.isArray(type) || typeof type === 'string'),
	url: url => {
		try {
			return Boolean(new URL(url));
		} catch (e) {
			return false;
		}
	},
};

/*
 * @function
 * @name validateParam
 * @description Validates parameter types passed into functions
 * @author Newton <cnewton@magnite.com>
 * @see {@link validateType}
 * @param {*} param - A stringed parameter provided to a function
 * @param {string} type - A string representation of a data structure
 * @throws {Error} an Error stating what type was passed and what was expected
 *
 * @example
 *    validateParam('a-string', 'number'));
 */
const validateParam = (param, type) => {
	const valid = validateType[type](param);
	if (!valid) {
		throw new Error(`Must be of type "${type}"! ${typeof param} was provided.`);
	}
};

/*
 * @function
 * @name hasInvalidOptionTypes
 * @description Checks options passed to a function for the valid data types based on a structure
 * @author Newton <cnewton@magnite.com>
 * @see {@link validateType}
 * @see {@link printInvalidOptionTypes}
 * @param {object} obj - An object to validate the types
 * @param {object} types - A matching object with values set to the data type
 * @throws {Error} If data types are invalid
 * @return {false} If data types are valid, return false
 *
 * @example
 *    hasInvalideOptionTypes({ foo: 'bar' }, { 'foo': 'string' }));
 */
const hasInvalidOptionTypes = (options, types) => {
	const invalid = Object
		.entries(options)
		.filter(([ key, value ]) => !validateType[types[key]](value))
		.flatMap(([ key ]) => key);

	if (invalid.length) {
		throw new Error(printInvalidOptionTypes(options, invalid, types).join('. '));
	}

	return false;
};

var validate = {
	hasInvalidOptionTypes,
	hasRequiredKeys,
	printInvalidOptionTypes,
	type: validateType,
	param: validateParam,
};

var types$1 = {
	seller: 'string',
	decision_logic_url: 'url',
	interest_group_buyers: 'mixed',
	trusted_scoring_signals_url: 'url',
	additional_bids: 'array',
	auction_signals: 'object',
	seller_signals: 'object',
	per_buyer_signals: 'object',
};

/* eslint-disable camelcase, compat/compat */

/*
 * @function
 * @name getEligible
 * @description filter all buyers by their owner field to ensure they're eligible to bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} groups - an array of objects containing interest group buyers
 * @param {array<String>} eligibility - a list of eligible owners to check against
 * @return {Array<Object> | null} an array of objects; null if none found;
 */
const getEligible = (groups, eligibility) => {
	if (eligibility === '*') {
		return groups;
	}

	const eligible = groups.filter(({ owner }) => eligibility.includes(owner));
	if (eligible.length) {
		return eligible;
	}

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
	bidders.map(async bidder => {
		const time0 = performance.now();
		const { generate_bid } = await import(bidder.bidding_logic_url);

		// check if there is even a generate_bid function
		// if not, removed bidder from elibility
		if (!generate_bid && typeof generate_bid !== 'function') {
			return null;
		}

		const trustedSignals = await getTrustedSignals(bidder?.trusted_bidding_signals_url, bidder?.trusted_bidding_signals_keys, debug);

		// generate a bid by providing all of the necessary information
		let bid;
		try {
			bid = generate_bid(bidder, conf?.auction_signals, conf?.per_buyer_signals?.[bidder.owner], trustedSignals, {
				top_window_hostname: window.top.location.hostname,
				seller: conf.seller,
			});
		} catch (err) {
			debug && echo.error(err);
			return null;
		}

		// check if generate_bid function returned the necessary parts to score
		// if not, removed bidder from elibility
		if (!(
			(bid.ad && typeof bid.ad === 'object') &&
			(bid.bid && typeof bid.bid === 'number') &&
			(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
		)) {
			return null;
		}

		const time1 = performance.now();
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
	const { score_ad } = await import(conf.decision_logic_url);
	// check if there is even a score_ad function
	// if not, return null
	if (!score_ad && typeof score_ad !== 'function') {
		return null;
	}

	return bids.map(bid => {
		let score;

		try {
			score = score_ad(bid?.ad, bid?.bid, conf, conf?.trusted_scoring_signals, {
				top_window_hostname: window.top.location.hostname,
				interest_group_owner: bid.owner,
				interest_group_name: bid.name,
				bidding_duration_msec: bid.duration,
			});
		} catch (err) {
			debug && echo.error(err);
			score = -1;
		}

		return {
			bid,
			score,
		};
	})
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
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
	const hostname = `hostname=${window.top.location.hostname}`;

	if (!(url && keys)) {
		return undefined;
	}

	const isJSON = response => /\bapplication\/json\b/.test(response?.headers?.get('content-type'));

	const response = await fetch(`${url}?${hostname}&keys=${keys.join(',')}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Something went wrong! The response returned was not ok.');
			}

			if (!isJSON(response)) {
				throw new Error('Response was not in the format of JSON.');
			}

			return response.json();
		})
		.catch(error => {
			debug && echo.error('There was a problem with your fetch operation:', error);
			return null;
		});

	const signals = {};
	for (const [ key, value ] of response) {
		if (keys.includes(key)) {
			signals[key] = value;
		}
	}

	if (!(signals && Object.keys(signals).length === 0 && signals.constructor === Object)) {
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
 *   runAdAuction({ seller: 'foo', decision_logic_url: 'http://example.com/auction', interst_group_buyers: [ 'www.buyer.com' ] });
 */
async function runAdAuction (conf, debug = false) {
	debug && echo.group('Fledge: Auction');
	debug && echo.log('auction config:', conf);
	validate.param(conf, 'object');
	validate.hasRequiredKeys(conf, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
	validate.hasInvalidOptionTypes(conf, types$1);

	debug && echo.info('getting all interest groups');
	const interestGroups = await db$1.store.getAll(IG_STORE);
	debug && echo.table(interestGroups);

	debug && echo.info('checking eligibility of buyers based on "interest_group_buyers"');
	const eligible = getEligible(interestGroups, conf.interest_group_buyers);
	debug && echo.table(eligible);
	if (!eligible) {
		debug && echo.error('No eligible interest group buyers found!');
		return null;
	}

	debug && echo.info('getting all bids from each buyer');
	const bids = await getBids(eligible, conf, debug);
	debug && echo.table(bids);
	debug && echo.info('filtering out invalid bids');
	const filteredBids = bids.filter(item => item);
	debug && echo.table(filteredBids);
	if (!filteredBids.length) {
		debug && echo.error('No bids found!');
		return null;
	}

	debug && echo.info('getting all scores, filtering and sorting');
	const [ winner ] = await getScores(filteredBids, conf, debug);
	debug && echo.log('winner:', winner);
	if (!winner) {
		debug && echo.error('No winner found!');
		return null;
	}

	debug && echo.info('creating an entry in the auction store');
	const token = await db$1.store.add(AUCTION_STORE, {
		id: uuid(),
		origin: `${window.top.location.origin}${window.top.location.pathname}`,
		timestamp: Date.now(),
		conf,
		...winner,
	});
	debug && echo.log('auction token:', token);
	if (!token) {
		debug && echo.error('No auction token found!');
		return null;
	}
	debug && echo.groupEnd();

	return token;
}

var types = {
	owner: 'string',
	name: 'string',
	bidding_logic_url: 'url',
	daily_update_url: 'url', // @TODO: support this potentially on the auction, grabbing the latest interest group data, and updating the IDB store with it
	trusted_bidding_signals_url: 'url',
	trusted_bidding_signals_keys: 'array',
	user_bidding_signals: 'object',
	ads: 'array',
};

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
async function joinAdInterestGroup (options, expiry, debug = false) {
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
	const group = await db$1.store.get(IG_STORE, getIGKey(options.owner, options.name));
	debug && echo.table(group);
	let id;
	if (group) {
		debug && echo.info('updating a new interest group');
		id = await db$1.store.put(IG_STORE, group, {
			_expired: Date.now() + expiry,
			...options,
		});
	} else {
		debug && echo.info('creating a new interest group');
		id = await db$1.store.add(IG_STORE, {
			_key: getIGKey(options.owner, options.name),
			_expired: Date.now() + expiry,
			...options,
		});
	}
	debug && echo.log('interest group id:', id);
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
async function leaveAdInterestGroup (group, debug = false) {
	debug && echo.group('Fledge: Leave an Interest Group');
	debug && echo.log('interest group:', group);
	validate.param(group, 'object');
	validate.hasRequiredKeys(group, [ 'owner', 'name' ]);
	validate.hasInvalidOptionTypes(group, types);

	debug && echo.info('deleting an existing interest group');
	await db$1.store.delete(IG_STORE, getIGKey(group.owner, group.name));
	debug && echo.log('interest group deleted');
	debug && echo.groupEnd();

	return true;
}

/* eslint-disable camelcase, no-cond-assign, compat/compat */

/*
 * @function
 * @name hasRendered
 * @description determine if a DOM element is visibile on a page
 * @param {DOM element} el - a list of bidders (also referred to as interest groups)
 * @return {boolean} whether or not an element is visible on the screen
 */
const hasRendered = el => {
	if (!(el instanceof Element)) { throw Error(`${el} is not a DOM element.`); }

	// check that the element is not hidden by CSS styles
	const { display, opacity, visibility } = getComputedStyle(el);
	if (display === 'none') { return false; }
	if (visibility !== 'visible') { return false; }
	if (opacity < 0.1) { return false; }

	// check that the element is not positioned off the page
	const { left, height, top, width } = el.getBoundingClientRect();
	const { offsetHeight } = el;
	const { offsetWidth } = el;
	if (offsetWidth + offsetHeight + height + width === 0) { return false; }

	// check that the element is not absolutely positioned off the page
	const x = left + offsetWidth / 2;
	if (x < 0) { return false; }
	if (x > (document.documentElement.clientWidth || window.innerWidth)) { return false; }
	const y = top + offsetHeight / 2;
	if (y < 0) { return false; }
	if (y > (document.documentElement.clientHeight || window.innerHeight)) { return false; }

	let pointContainer = document.elementFromPoint(x, y);
	do {
		if (pointContainer === el) { return true; }
	} while (pointContainer = pointContainer.parentNode);

	return false;
};

/*
 * @function
 * @name getSellerReport
 * @description given the results of an auction, grab the report from the seller
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @return {object} an object of data to pass back to the buyers report
 */
const getSellerReport = async (conf, results) => {
	const { report_result } = await import(conf.decision_logic_url);

	// check if there is even a function
	if (!report_result || typeof report_result !== 'function') {
		return null;
	}

	// generate a report by providing all of the necessary information
	try {
		return report_result(conf, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: results.bid.owner,
			interest_group_name: results.bid.name,
			render_url: results.bid.render,
			bid: results.bid.bid,
		});
	} catch (err) {
		echo.error(err);
		return null;
	}
};

/*
 * @function
 * @name getBuyerReport
 * @description given the results of an auction, grab the report from the buyer
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @param {object} report - the report object from the sellers report
 * @return {void} has a side effect of generating a report for the buyer
 */
const getBuyerReport = async (conf, results, report) => {
	const { report_win } = await import(results.bid.bidding_logic_url);

	// check if there is even a function
	if (!report_win || typeof report_win !== 'function') {
		return null;
	}

	// generate a report by providing all of the necessary information
	try {
		return report_win(conf?.auction_signals, conf?.per_buyer_signals?.[results.bid.owner], report, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: results.bid.owner,
			interest_group_name: results.bid.name,
			render_url: results.bid.render,
			bid: results.bid.bid,
		});
	} catch (err) {
		echo.error(err);
		return null;
	}
};

/*
 * @function
 * @name getTarget
 * @description grab a DOM node based on a CSS style selector passed in
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a CSS style selector
 * @throws {Error} if no target is found based on the selector provided
 * @return {DOM Node} a DOM node found on the page
 */
const getTarget = selector => document.querySelector(selector);

/*
 * @function
 * @name renderAd
 * @description render an ad
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a string reprensenting a valid selector to find an element on the page
 * @param {string} token - a string that represents the results from an auction run via the `fledge.runAdAuction` call
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {Promise<null | true>}
 *
 * @example
 *   renderAd('#ad-slot-1', '76941e71-2ed7-416d-9c55-36d07beff786');
 */
async function renderAd (selector, token, debug = false) {
	debug && echo.group('Fledge: Render an Ad');
	debug && echo.log('ad render selector:', selector);
	debug && echo.log('ad render token:', token);
	validate.param(selector, 'string');
	validate.param(token, 'string');

	debug && echo.info('checking that target exists on the page');
	const target = getTarget(selector);
	debug && echo.log('target:', target);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}

	debug && echo.info('checking that winning token exists');
	const winner = await db$1.store.get(AUCTION_STORE, token);
	debug && echo.log('winners token:', winner);
	if (!winner || winner.id !== token) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}

	debug && echo.info('checking that winner to be rendered is on the same hostname as the auction');
	if (winner?.origin !== `${window.top.location.origin}${window.top.location.pathname}`) {
		debug && echo.error(`Attempting to render the winner on a location that doesn't match the auctions hostname`, { winner: winner.origin, auction: `${window.top.location.origin}${window.top.location.pathname}` });
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.info('rendering an iframe with the winning ad');
	frame.create(winner.bid.render, target, {
		id: `fledge-auction-${winner.id}`,
	});

	debug && echo.info('checking that ad iframe actually rendered');
	const ad = getTarget(`#fledge-auction-${token}`);
	debug && echo.log('ads target:', ad);
	if (!ad || !hasRendered(ad)) {
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.groupEnd();

	debug && echo.group('Fledge: Reporting');
	debug && echo.info('sending reports to the seller');
	const sellersReport = await getSellerReport(winner.conf, winner);
	debug && echo.info('sending reports to the buyer', sellersReport);
	await getBuyerReport(winner.conf, winner, sellersReport);
	debug && echo.groupEnd();

	return true;
}

async function fledgeAPI ({ data, ports }) {
	try {
		if (!Array.isArray(data)) {
			throw new Error('data is not what it should be');
		}

		switch (data[0]) {
			case 'joinAdInterestGroup': {
				const [, request] = data;
				const [options, expiry] = request;

				await joinAdInterestGroup(options, expiry);

				return;
			}
			case 'leaveAdInterestGroup': {
				const [, request] = data;
				const [group] = request;

				await leaveAdInterestGroup(group);

				return;
			}
			case 'runAdAuction': {
				const [, request] = data;
				const [conf] = request;

				if (ports.length !== 1) {
					throw new Error(`Port transfer mismatch during request: expected 1 port, but received ${ports.length}`);
				}
				const [port] = ports;
				console.log({ports, port});
				const token = await runAdAuction(conf);
				console.log({token});
				const response = [true, token];
				port.postMessage(response);
				port.close();

				return;
			}
			case 'renderAd': {
				const [, request] = data;
				const [selector, token] = request;

				await renderAd(selector, token);

				return;
			}
			default: {
				return false;
			}
		}
	} catch (error) {
		const response = [false];
		for (const port of ports) {
			port.postMessage(response);
		}
		throw error;
	}
}

const VERSION = 1;
const VERSION_KEY = 'fledge.polyfill';

async function main (debug = false) {
	// check whenever the document is being framed by a site which you don’t expect it to be framed by
	const [ parentOrigin ] = window.location.ancestorOrigins;
	if (parentOrigin === undefined) {
		throw new Error("Frame can't run as a top-level document");
	}

	// connect to the storage iframe and send a message
	const { port1: receiver, port2: sender } = new MessageChannel();
	receiver.onmessage = fledgeAPI;
	window.parent.postMessage({
		[VERSION_KEY]: VERSION
	}, parentOrigin, [sender]);
}

export default main;
