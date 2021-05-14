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

/* eslint-disable no-cond-assign */

/*
 * @function
 * @name getSellerReport
 * @description given the results of an auction, grab the report from the seller
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @return {object} an object of data to pass back to the buyers report
 */
const getSellerReport = async (conf, results, debug) => {
	debug && echo.groupCollapsed('render utils: getSellerReport');
	const { reportResult } = await import(conf.decisionLogicUrl);

	// check if there is even a function
	if (!reportResult || typeof reportResult !== 'function') {
		debug && echo.log(echo.asWarning(`No 'reportResult' function found!`));
		debug && echo.groupEnd();
		return null;
	}

	let report;
	// generate a report by providing all of the necessary information
	try {
		debug && echo.log(echo.asProcess('fetching seller reporting'));
		report = reportResult(conf, {
			topWindowHostname: window.top.location.hostname,
			interestGroupOwner: results.bid.owner,
			interestGroupName: results.bid.name,
			renderUrl: results.bid.render,
			bid: results.bid.bid,
		});
		debug && echo.log(echo.asSuccess('report found'));
	} catch (err) {
		echo.log(echo.asAlert(err));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.groupEnd();
	return report;
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
const getBuyerReport = async (conf, results, sellersReport, debug) => {
	debug && echo.groupCollapsed('render utils: getBuyerReport');
	const wins = import(results.bid.biddingLogicUrl)
		.then(({ reportWin }) => {
			// check if there is even a function
			if (!reportWin || typeof reportWin !== 'function') {
				debug && echo.log(echo.asWarning(`No 'reportWin' function found!`));
				return null;
			}

			let report;

			try {
				debug && echo.log(echo.asProcess('fetching buyer reporting'));
				// generate a report by providing all of the necessary information
				report = reportWin(conf?.auctionSignals, conf?.perBuyerSignals?.[results.bid.owner], sellersReport, {
					topWindowHostname: window.top.location.hostname,
					interestGroupOwner: results.bid.owner,
					interestGroupName: results.bid.name,
					renderUrl: results.bid.render,
					bid: results.bid.bid,
				});
				debug && echo.log(echo.asSuccess('report found'));
			} catch (err) {
				echo.log(echo.asAlert(`There was an error in the 'reportWin' function:`));
				echo.log(err);
				report = null;
			}

			return report;
		})
		.catch(err => {
			echo.log(echo.asAlert(err));
			return null;
		});

	debug && echo.groupEnd();
	return wins;
};

const VERSION = 1;

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

const getMessage = (target, filter) => new Promise((resolve, reject) => {
	const messageListener = event => {
		if (filter(event)) {
			target.removeEventListener('message', messageListener);
			target.removeEventListener('messageerror', messageErrorListener);
			resolve(event);
		}
	};
	const messageErrorListener = event => {
		if (filter(event)) {
			target.removeEventListener('message', messageListener);
			target.removeEventListener('messageerror', messageErrorListener);
			reject(new Error('Message deserialization error'));
		}
	};

	target.addEventListener('message', messageListener);
	target.addEventListener('messageerror', messageErrorListener);
});

function getFromFrame (port, debug) {
	debug && echo.groupCollapsed('message utils: getFromFrame');
	debug && echo.log(echo.asProcess('getting message from iframe'));
	const message = getMessage(port, () => true);
	port.start();
	debug && echo.log(echo.asSuccess('grabbed message from iframe, started port'));
	debug && echo.groupEnd();
	return message;
}

async function getFramePort (iframe, expectedOrigin, debug) {
	debug && echo.groupCollapsed('message utils: getFromPort');
	debug && echo.log(echo.asProcess('getting message from iframe'));
	const { data, ports, origin } = await getMessage(window, ({ source }) => source === iframe.contentWindow);

	if (origin !== expectedOrigin) {
		throw new Error(`Message origins are mismatched! Expected ${expectedOrigin}, received ${origin}`);
	}
	if (data['fledge.polyfill'] !== VERSION) {
		throw new Error(`Message versions are mismatched! Expected ${VERSION}, but received ${data['fledge.polyfill']}`);
	}
	if (ports.length !== 1) {
		throw new Error(`Message ports are mismatched! Expected 1 port, received ${ports.length}`);
	}

	debug && echo.groupEnd();
	return ports[0];
}

const frame = {
	create: createFrame,
};

const message = {
	getFramePort,
	getFromFrame,
	get: getMessage,
};

const validate = {
	hasInvalidOptionTypes,
	hasRequiredKeys,
	printInvalidOptionTypes,
	type: validateType,
	param: validateParam,
};

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
async function renderAd (selector, token, debug) {
	debug && echo.groupCollapsed('Fledge API: renderAd');
	const target = document.querySelector(selector);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}
	debug && echo.log(echo.asInfo('target:'), target);

	const winner = JSON.parse(sessionStorage.getItem(token));
	if (!winner) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}
	debug && echo.log(echo.asInfo('winner data:'), winner);

	debug && echo.log(echo.asProcess('checking that winner to be rendered is on the same hostname as the auction'));
	if (winner?.origin !== `${window.top.location.origin}${window.top.location.pathname}`) {
		debug && echo.error(`Attempting to render the winner on a location that doesn't match the auctions hostname`, { winner: winner.origin, auction: `${window.top.location.origin}${window.top.location.pathname}` });
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.log(echo.asSuccess('winner is on the same hostname as the auction'));

	debug && echo.log(echo.asProcess('rendering an iframe with the winning ad'));
	frame.create({
		source: winner.bid.render,
		target,
		props: {
			id: `fledge-auction-${token}`,
		},
	});
	const ad = document.querySelector(`#fledge-auction-${token}`);
	if (!ad) {
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.log(echo.asSuccess('iframe with winning ad has rendered'));
	debug && echo.log(echo.asInfo('ads target:'), ad);
	debug && echo.groupEnd();

	debug && echo.groupCollapsed('Fledge API: Reporting');
	const sellersReport = await getSellerReport(winner.conf, winner, debug);
	debug && echo.log(echo.asSuccess('sellers report:'), sellersReport);
	const buyersReport = await getBuyerReport(winner.conf, winner, sellersReport, debug);
	debug && echo.log(echo.asSuccess('buyers report:'), buyersReport);
	debug && echo.groupEnd();

	return true;
}

const AuctionConf = {
	seller: 'string',
	decisionLogicUrl: 'url',
	interestGroupBuyers: 'mixed',
	trustedScoringSignalsUrl: 'url',
	additionalBids: 'array',
	auctionSignals: 'object',
	sellerSignals: 'object',
	perBuyerSignals: 'object',
};

const InterestGroup = {
	owner: 'string',
	name: 'string',
	biddingLogicUrl: 'url',
	dailyUpdateUrl: 'url', // @TODO: support this potentially on the auction, grabbing the latest interest group data, and updating the IDB store with it
	trustedBiddingSignalsUrl: 'url',
	trustedBiddingSignalsKeys: 'array',
	userBiddingSignals: 'object',
	ads: 'array',
};

/*
* @const {number}
* @summary Maximum expiration allowed for an Interest Group to exist
* @description Milliseconds occuring per day multiplied by the maximum number of days (maximum dayus (30) * hours per day (24) * minutes per hour (60) * seconds per minute (60) * milliseconds per second (1000))
*/
const MAX_EXPIRATION = 2592000000;

/*
* @const {URL}
* @description The source URL for the hosted iframe
*/
const IFRAME_HOST = 'http://localhost:8000';

class Fledge {
	constructor (url, debug) {
		this.url = url || `${IFRAME_HOST}/iframe.html`;
		this._debug = debug;

		const query = this._debug ? '?debug=true' : '';
		const { iframe, origin } = frame.create({
			source: `${this.url}${query}`,
			style: { display: 'none' },
		});
		// iframe.sandbox.add('allow-same-origin', 'allow-scripts');
		const port = message.getFramePort(iframe, origin);

		this._props = {
			iframe,
			port,
		};
	}

	set props (props) {
		this._props = props;
	}

	get props () {
		return this._props;
	}

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
	async joinAdInterestGroup (options, expiry) {
		this._debug && echo.group('Fledge: Join an Interest Group');
		this._debug && echo.log(echo.asInfo('interest group options:'), options);
		this._debug && echo.log(echo.asInfo('interest group expiration:'), `${expiry}: (human-readable: ${new Date(Date.now() + expiry).toLocaleString()})`);
		validate.param(options, 'object');
		validate.param(expiry, 'number');
		validate.hasRequiredKeys(options, [ 'owner', 'name', 'biddingLogicUrl' ]);
		validate.hasInvalidOptionTypes(options, InterestGroup);

		if (expiry > MAX_EXPIRATION) {
			throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
		}

		this._debug && echo.groupCollapsed('message channel');
		const port = await this.props.port;
		this._debug && echo.log(echo.asInfo('message port:'), port);
		this._debug && echo.groupEnd();
		this._debug && echo.log(echo.asProcess(`sending 'joinAdInterestGroup' message to iframe`));
		port.postMessage([ 'joinAdInterestGroup', [
			options,
			expiry,
			this._debug,
		] ]);
		this._debug && echo.groupEnd();
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
	async leaveAdInterestGroup (group) {
		this._debug && echo.group('Fledge: Leave an Interest Group');
		this._debug && echo.log(echo.asInfo('interest group:'), group);
		validate.param(group, 'object');
		validate.hasRequiredKeys(group, [ 'owner', 'name' ]);
		validate.hasInvalidOptionTypes(group, InterestGroup);

		this._debug && echo.groupCollapsed('message channel');
		const port = await this.props.port;
		this._debug && echo.log(echo.asInfo('message port:'), port);
		this._debug && echo.groupEnd();
		this._debug && echo.log(echo.asProcess(`sending 'leaveAdInterestGroup' message to iframe`));
		port.postMessage([ 'leaveAdInterestGroup', [
			group,
			this._debug,
		] ]);
		this._debug && echo.groupEnd();
		return true;
	}

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
	*   runAdAuction({ seller: 'foo', decisionLogicUrl: 'http://example.com/auction', interstGroupBuyers: [ 'www.buyer.com' ] });
	*/
	async runAdAuction (conf) {
		this._debug && echo.group('Fledge: Auction');
		this._debug && echo.log(echo.asInfo('auction config:'), conf);
		validate.param(conf, 'object');
		validate.hasRequiredKeys(conf, [ 'seller', 'decisionLogicUrl', 'interestGroupBuyers' ]);
		validate.hasInvalidOptionTypes(conf, AuctionConf);

		this._debug && echo.groupCollapsed('message channel');
		const port = await this.props.port;
		this._debug && echo.log(echo.asInfo('message port:'), port);
		const { port1: receiver, port2: sender } = new MessageChannel();
		this._debug && echo.log(echo.asInfo('message channel receiver:'), receiver);
		this._debug && echo.log(echo.asInfo('message channel sender:'), sender);
		this._debug && echo.groupEnd();

		try {
			this._debug && echo.log(echo.asProcess(`sending 'runAdAuction' message to iframe`));
			port.postMessage([ 'runAdAuction', [
				conf,
				this._debug,
			] ], [ sender ]);
			const { data } = await message.getFromFrame(receiver, this._debug);
			if (!data[0]) {
				throw new Error('No data found!');
			}
			this._debug && echo.log(echo.asInfo('message data:'), data);
			const [ , token ] = data;
			this._debug && echo.log(echo.asSuccess('auction token:'), token);
			return token;
		} finally {
			receiver.close();
			this._debug && echo.groupEnd();
		}
	}

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
	async renderAd (selector, token) {
		this._debug && echo.group('Fledge: Render an Ad');
		this._debug && echo.log(echo.asInfo('ad slot selector:'), selector);
		this._debug && echo.log(echo.asInfo('winning ad token:'), token);
		validate.param(selector, 'string');
		validate.param(token, 'string');

		await renderAd(selector, token, this._debug);
		this._debug && echo.log(echo.asSuccess('winning ad rendered'));
		this._debug && echo.groupEnd();
		return true;
	}
}

export default Fledge;
