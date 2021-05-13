import { echo } from '@theholocron/klaxon';
import render from './render';
import {
	AuctionConf,
	InterestGroup,
} from './types';
import {
	frame,
	message,
	validate,
} from './utils';

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

export default class Fledge {
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
	*   joinAdInterestGroup({ owner: 'foo', name: 'bar', bidding_logic_url: 'http://example.com/bid' }, 2592000000);
	*/
	async joinAdInterestGroup (options, expiry) {
		this._debug && echo.group('Fledge: Join an Interest Group');
		this._debug && echo.log(echo.asInfo('interest group options:'), options);
		this._debug && echo.log(echo.asInfo('interest group expiration:'), `${expiry}: (human-readable: ${new Date(Date.now() + expiry).toLocaleString()})`);
		validate.param(options, 'object');
		validate.param(expiry, 'number');
		validate.hasRequiredKeys(options, [ 'owner', 'name', 'bidding_logic_url' ]);
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
	*   leaveAdInterestGroup({ owner: 'foo', name: 'bar', bidding_logic_url: 'http://example.com/bid' });
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
	*   runAdAuction({ seller: 'foo', decision_logic_url: 'http://example.com/auction', interst_group_buyers: [ 'www.buyer.com' ] });
	*/
	async runAdAuction (conf) {
		this._debug && echo.group('Fledge: Auction');
		this._debug && echo.log(echo.asInfo('auction config:'), conf);
		validate.param(conf, 'object');
		validate.hasRequiredKeys(conf, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
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

		await render(selector, token, this._debug);
		this._debug && echo.log(echo.asSuccess('winning ad rendered'));
		this._debug && echo.groupEnd();
		return true;
	}
}
