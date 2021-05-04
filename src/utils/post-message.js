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
		throw new Error(`Origin mismatch during handshake: expected ${expectedOrigin}, but received ${origin}`);
	}
	if (data['fledge.polyfill'] !== 1) {
		throw new Error(`Version mismatch during handshake: expected v1, but received ${JSON.stringify(data)}`);
	}
	if (ports.length !== 1) {
		throw new Error(`Port transfer mismatch during handshake: expected 1 port, but received ${ports.length}`);
	}

	return ports[0];
}

export default {
	getFramePort,
	sendToPort,
};
