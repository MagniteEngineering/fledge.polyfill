import {
	AuctionConf,
	InterestGroup,
} from './types.js';
import {
	echo,
	frame,
	message,
	validate,
} from './utils/index.js';

/*
* @const {number}
* @summary Maximum expiration allowed for an Interest Group to exist
* @description Milliseconds occuring per day multiplied by the maximum number of days (maximum dayus (30) * hours per day (24) * minutes per hour (60) * seconds per minute (60) * milliseconds per second (1000))
*/
const MAX_EXPIRATION = 2592000000;

export default class Fledge {
	constructor (debug) {
		const { iframe, origin } = frame.create({
			source: 'http://localhost:3000/docs/iframe',
			style: { display: 'none' },
		});
		// iframe.sandbox.add('allow-same-origin', 'allow-scripts');
		const port = message.getFramePort(iframe, origin);

		this.debug = debug;
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

	async joinAdInterestGroup (options, expiry) {
		this.debug && echo.group('Fledge: Join an Interest Group');
		this.debug && echo.log('interest group options:', options);
		this.debug && echo.log('interest group expiration:', expiry);
		validate.param(options, 'object');
		validate.param(expiry, 'number');
		validate.hasRequiredKeys(options, [ 'owner', 'name', 'bidding_logic_url' ]);
		validate.hasInvalidOptionTypes(options, InterestGroup);

		if (expiry > MAX_EXPIRATION) {
			throw new Error(`'expiry' is set past the allowed maximum value. You must provide an expiration that is less than or equal to ${MAX_EXPIRATION}.`);
		}

		const port = await this.props.port;
		this.debug && echo.log('message port:', port);
		port.postMessage([ 'joinAdInterestGroup', [
			options,
			expiry,
			this.debug,
		] ]);
	}

	async leaveAdInterestGroup (group) {
		this.debug && echo.group('Fledge: Leave an Interest Group');
		this.debug && echo.log('interest group:', group);
		validate.param(group, 'object');
		validate.hasRequiredKeys(group, [ 'owner', 'name' ]);
		validate.hasInvalidOptionTypes(group, InterestGroup);

		const port = await this.props.port;
		this.debug && echo.log('message port:', port);
		port.postMessage([ 'leaveAdInterestGroup', [
			group,
			this.debug,
		] ]);
	}

	async runAdAuction (conf) {
		this.debug && echo.group('Fledge: Auction');
		this.debug && echo.log('auction config:', conf);
		validate.param(conf, 'object');
		validate.hasRequiredKeys(conf, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
		validate.hasInvalidOptionTypes(conf, AuctionConf);

		const port = await this.props.port;
		this.debug && echo.log('message port:', port);
		const { port1: receiver, port2: sender } = new MessageChannel();
		this.debug && echo.log('message channel receiver', receiver);
		this.debug && echo.log('message channel sender', sender);

		try {
			port.postMessage([ 'runAdAuction', [
				conf,
				this.debug,
			] ], [ sender ]);
			const { data } = await message.sendToPort(receiver);
			if (!data[0]) {
				throw new Error('No data found!');
			}
			this.debug && echo.log('message data', data);
			const [ , token ] = data;
			this.debug && echo.log('auction token', token);
			return token;
		} finally {
			receiver.close();
		}
	}

	async renderAd (selector, token) {
		const port = await this.props.port;
		port.postMessage([ 'renderAd', [
			selector,
			token,
			this.debug,
		] ]);
	}
}
