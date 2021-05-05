import { echo } from '../utils/index.js';
import fledgeAPI from './api.js';

const VERSION = 1;
const VERSION_KEY = 'fledge.polyfill';

export default async function frame (debug = false) {
	// check whenever the document is being framed by a site which you don’t expect it to be framed by
	const [ parentOrigin ] = window.location.ancestorOrigins;
	if (parentOrigin === undefined) {
		echo.warn(`Frame cannot run as a top-level document`);
	}

	// connect to the storage iframe and send a message
	const { port1: receiver, port2: sender } = new MessageChannel();
	debug && echo.log('message channel receiver:', receiver);
	debug && echo.log('message channel sender:', sender);
	receiver.onmessage = fledgeAPI;
	window.parent.postMessage({
		[VERSION_KEY]: VERSION,
	}, parentOrigin, [ sender ]);
}
