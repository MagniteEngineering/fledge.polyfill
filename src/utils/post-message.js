import {
	NAMESPACE,
	VERSION,
} from '../types.js';

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

function sendToPort (port) {
	const message = getMessage(port, () => true);
	port.start();
	return message;
}

async function getFramePort (iframe, expectedOrigin) {
	const { data, ports, origin } = await getMessage(window, ({ source }) => source === iframe.contentWindow);

	if (origin !== expectedOrigin) {
		throw new Error(`Message origins are mismatched! Expected ${expectedOrigin}, received ${origin}`);
	}
	if (data[NAMESPACE] !== VERSION) {
		throw new Error(`Message versions are mismatched! Expected ${VERSION}, but received ${data[NAMESPACE]}`);
	}
	if (ports.length !== 1) {
		throw new Error(`Message ports are mismatched! Expected 1 port, received ${ports.length}`);
	}

	return ports[0];
}

export default {
	getFramePort,
	sendToPort,
};
