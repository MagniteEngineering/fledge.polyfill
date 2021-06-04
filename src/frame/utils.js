const call = promise => promise
	.then(data => ([ data, undefined ]))
	.catch(error => Promise.resolve([ undefined, error ]));

const dynamicImport = async (url, fn, ...args) => {
	const [ module, moduleErr ] = await call(import(url));

	if (moduleErr) {
		return null;
	}

	if (!module[fn] || typeof module[fn] !== 'function') {
		return null;
	}

	try {
		return module[fn](...args);
	} catch (err) {
		return null;
	}
};

/*
 * @function
 * @name getBid
 * @description grab a bid
 * @author Newton <cnewton@magnite.com>
 * @param {Object} bidder - a bidders (also referred to as interest groups)
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} an array of objects containing bids; null if none found
 */
export const getBid = async (bidder, conf) => {
	const startTime = performance.now();
	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const trustedSignals = await getTrustedSignals(bidder?.trustedBiddingSignalsUrl, bidder?.trustedBiddingSignalsKeys);
	const bid = await dynamicImport(bidder.biddingLogicUrl, 'generateBid', bidder, conf?.auctionSignals, conf?.perBuyerSignals?.[bidder.owner], trustedSignals, {
		topWindowHostname: hostname,
		seller: conf.seller,
	});

	// check if generateBid function returned the necessary parts to score
	// if not, removed bidder from elibility
	if (!(
		(bid.ad && typeof bid.ad === 'object') &&
		(bid.bid && typeof bid.bid === 'number') &&
		(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
	)) {
		return false;
	}

	const endTime = performance.now();
	return {
		...bidder,
		...bid,
		duration: endTime - startTime,
	};
};

/*
 * @function
 * @name getScores
 * @description given a set of bids, grab their score
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bids - a list of bids to score
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} a sorted, filtered array of objects containing scores
 */
export const getScores = async (bids, conf) => Promise.all(bids.map(async bid => {
	let trustedSignalsKeys;
	if (bid.ad && bid.ad.length > 0) {
		trustedSignalsKeys = bid?.ad?.map(({ renderUrl }) => renderUrl);
	}
	const trustedSignals = await getTrustedSignals(conf?.trustedScoringSignalsUrl, trustedSignalsKeys);

	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const score = await dynamicImport(conf.decisionLogicUrl, 'scoreAd', bid?.ad, bid?.bid, conf, trustedSignals, {
		topWindowHostname: hostname,
		interestGroupOwner: bid.owner,
		interestGroupName: bid.name,
		biddingDurationMsec: bid.duration,
	});

	return {
		bid,
		score,
	};
}));

/*
 * @function
 * @name uuid
 * @description create a UUID per v4 spec
 * @author broofa <https://stackoverflow.com/users/109538>
 * @link https://stackoverflow.com/a/2117523
 * @return {string} a UUID string
 */
export const uuid = () => ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11)
	.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/*
 * @function
 * @name getTrustedSignals
 * @description grab the data from trusted bidding signals URL and keys
 * @author Newton <cnewton@magnite.com>
 * @param {string} a valid URL in the form of a string
 * @param {array<String>} an array of strings
 * @return {object} a JSON response
 */
const getTrustedSignals = async (url, keys) => {
	if (!(url && keys)) {
		return undefined;
	}

	const { hostname } = new URL(window.location.ancestorOrigins[0]);
	const isJSON = response => /\bapplication\/json\b/.test(response?.headers?.get('content-type'));

	const [ response, responseErr ] = await call(fetch(`${url}?hostname=${hostname}&keys=${keys.join(',')}`));
	if (responseErr || !response.ok || !isJSON(response)) {
		return null;
	}

	const data = await response.json();

	const signals = {};
	for (const key in data) {
		if (keys.includes(key)) {
			signals[key] = data[key];
		}
	}
	if (!signals || Object.keys(signals).length === 0 || signals.constructor !== Object) {
		return null;
	}

	return signals;
};
