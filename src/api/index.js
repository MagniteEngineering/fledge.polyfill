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

export class Fledge {
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
			const msg = JSON.parse(JSON.stringify([ 'runAdAuction', [
				conf,
			] ]));
			port.postMessage(msg, [ sender ]);
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
