import {
	frame,
	message,
} from './utils/index.js';

export default class Fledge {
	constructor () {
		const { iframe, origin } = frame.create({
			source: 'http://localhost:3000/docs/iframe',
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

	async joinAdInterestGroup (options, expiry) {
		const port = await this.props.port;
		port.postMessage([ 'joinAdInterestGroup', [
			options,
			expiry,
		] ]);
	}

	async leaveAdInterestGroup (group) {
		const port = await this.props.port;
		port.postMessage([ 'leaveAdInterestGroup', [
			group,
		] ]);
	}

	async runAdAuction (conf) {
		const port = await this.props.port;
		console.log({ port });
		const { port1: receiver, port2: sender } = new MessageChannel();
		console.log({ receiver, sender });

		try {
			port.postMessage([ 'runAdAuction', [
				conf,
			] ], [ sender ]);
			const { data } = await message.sendToPort(receiver);
			if (!data[0]) {
				throw new Error('Error occurred in frame; see console for details');
			}
			const [ , token ] = data;
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
		] ]);
	}
}
