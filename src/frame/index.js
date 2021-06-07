import VERSION from '../version';
import { dynamicImport } from '../api/utils';
import fledgeAPI from './api';

function mainFrame () {
	// check whenever the document is being framed by a site which you don’t expect it to be framed by
	const [ parentOrigin ] = window.location.ancestorOrigins;
	if (parentOrigin === undefined) {
		throw new Error(`Can't call 'postMessage' on the Frame window when run as a top-level document`);
	}

	const { hash } = window.location;
	if (hash) {
		const { conf, winner } = JSON.parse(sessionStorage.getItem(hash.substring(1)));
		const { hostname } = new URL(parentOrigin);
		if (!winner) {
			throw new Error(`A token was not found! Token provided: ${hash}`);
		}

		const iframe = window.document.createElement('iframe');
		iframe.src = winner.bid.render;
		iframe.style['border-width'] = 0;
		iframe.style.width = winner.ad?.size?.width || '100%';
		iframe.style.height = winner.ad?.size?.height || '100%';
		window.document.body.style.margin = '0';
		window.document.body.appendChild(iframe);

		// get the sellers report
		dynamicImport(conf.decisionLogicUrl, 'reportResult', conf, {
			topWindowHostname: hostname,
			interestGroupOwner: winner.bid.owner,
			interestGroupName: winner.bid.name,
			renderUrl: winner.bid.render,
			bid: winner.bid.bid,
		}).then(report => {
			// get the buyers report
			dynamicImport(winner.bid.biddingLogicUrl, 'reportWin', conf?.auctionSignals, conf?.perBuyerSignals?.[winner.bid.owner], report, {
				topWindowHostname: hostname,
				interestGroupOwner: winner.bid.owner,
				interestGroupName: winner.bid.name,
				renderUrl: winner.bid.render,
				bid: winner.bid.bid,
			});
		});
	} else {
		// connect to the storage iframe and send a message
		const { port1: receiver, port2: sender } = new MessageChannel();
		receiver.onmessage = fledgeAPI;
		window.parent.postMessage({
			'fledge.polyfill': VERSION,
		}, parentOrigin, [ sender ]);
	}
}

mainFrame();
