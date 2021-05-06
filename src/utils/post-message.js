import {
	NAMESPACE,
	VERSION,
} from '../types.js';
import echo from './console.js';

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
	debug && echo.info('getting message from iframe');
	const message = getMessage(port, () => true);
	port.start();
	debug && echo.log(echo.asSuccess('grabbed message from iframe, started port'));
	debug && echo.groupEnd();
	return message;
}

async function getFramePort (iframe, expectedOrigin, debug) {
	debug && echo.groupCollapsed('message utils: getFromPort');
	debug && echo.info('getting message from iframe');
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

	debug && echo.groupEnd();
	return ports[0];
}

export default {
	getFramePort,
	getFromFrame,
};
