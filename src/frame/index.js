import VERSION from '../version';
import fledgeAPI from './api';

export default async function frame () {
	// check whenever the document is being framed by a site which you don’t expect it to be framed by
	const [ parentOrigin ] = window.location.ancestorOrigins;
	if (parentOrigin === undefined) {
		throw new Error(`Can't call 'postMessage' on the Frame window when run as a top-level document`);
	}

	// connect to the storage iframe and send a message
	const { port1: receiver, port2: sender } = new MessageChannel();
	receiver.onmessage = fledgeAPI;
	window.parent.postMessage({
		'fledge.polyfill': VERSION,
	}, parentOrigin, [ sender ]);
}
