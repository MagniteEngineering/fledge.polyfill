'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function getFromFrame (port) {
	const message = getMessage(port, () => true);
	port.start();
	return message;
}

async function getFramePort (iframe, expectedOrigin) {
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
	constructor (url) {
		this.url = url || `${IFRAME_HOST}/iframe.html`;

		const { iframe, origin } = frame.create({
			source: this.url,
			style: { display: 'none' },
		});
		iframe.sandbox.add('allow-same-origin', 'allow-scripts');
		const port = message.getFramePort(iframe, origin);

		this._props = {
			url,
			port,
		};
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
		validate.param(options, 'object');
		validate.param(expiry, 'number');
		validate.hasRequiredKeys(options, [ 'owner', 'name', 'biddingLogicUrl' ]);
		validate.hasInvalidOptionTypes(options, InterestGroup);

		if (expiry > MAX_EXPIRATION) {
			throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
		}

		const port = await this.props.port;
		port.postMessage([ 'joinAdInterestGroup', [
			options,
			expiry,
		] ]);
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
		validate.param(group, 'object');
		validate.hasRequiredKeys(group, [ 'owner', 'name' ]);
		validate.hasInvalidOptionTypes(group, InterestGroup);

		const port = await this.props.port;
		port.postMessage([ 'leaveAdInterestGroup', [
			group,
		] ]);
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
	*   runAdAuction({ seller: 'foo', decisionLogicUrl: 'http://example.com/auction', interestGroupBuyers: [ 'www.buyer.com' ] });
	*/
	async runAdAuction (conf) {
		validate.param(conf, 'object');
		validate.hasRequiredKeys(conf, [ 'seller', 'decisionLogicUrl', 'interestGroupBuyers' ]);
		validate.hasInvalidOptionTypes(conf, AuctionConf);

		const { url } = this.props;
		const port = await this.props.port;
		const { port1: receiver, port2: sender } = new MessageChannel();

		try {
			port.postMessage([ 'runAdAuction', [
				conf,
			] ], [ sender ]);
			const { data } = await message.getFromFrame(receiver);
			if (!data[0]) {
				throw new Error('No response from the iframe was found!');
			}
			const [ , token ] = data;
			return token === null ? null : `${url}#${token}`;
		} finally {
			receiver.close();
		}
	}
}

exports.Fledge = Fledge;
