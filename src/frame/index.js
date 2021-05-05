import {
	NAMESPACE,
	VERSION,
} from '../types.js';
import { echo } from '../utils/index.js';
import fledgeAPI from './api.js';

export default async function frame () {
	const { searchParams } = new URL(window.location);
	const debug = searchParams.get('debug') || false;
	debug && echo.group('Fledge: Storage Frame');

	const admin = searchParams.get('admin') || false;

	if (!admin) {
		// check whenever the document is being framed by a site which you don’t expect it to be framed by
		const [ parentOrigin ] = window.location.ancestorOrigins;
		if (parentOrigin === undefined) {
			debug && echo.warn('It appears your attempting to access this from the top-level', parentOrigin, window.location);
			throw new Error(`Can't call 'postMessage' on the Frame window when run as a top-level document`);
		}

		// connect to the storage iframe and send a message
		const { port1: receiver, port2: sender } = new MessageChannel();
		debug && echo.log('message channel receiver:', receiver);
		debug && echo.log('message channel sender:', sender);
		receiver.onmessage = fledgeAPI;
		window.parent.postMessage({
			[NAMESPACE]: VERSION,
		}, parentOrigin, [ sender ]);
	}
	debug && echo.groupEnd();
}
