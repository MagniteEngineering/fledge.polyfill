/* eslint-disable camelcase */
import { echo } from '@theholocron/klaxon';

/*
 * @function
 * @name getEligible
 * @description filter all buyers by their owner field to ensure they're eligible to bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} groups - an array of objects containing interest group buyers
 * @param {array<String>} eligibility - a list of eligible owners to check against
 * @return {Array<Object> | null} an array of objects; null if none found;
 */
export const getEligible = (groups, eligibility, debug) => {
	debug && echo.groupCollapsed('auction utils: getEligible');
	if (eligibility === '*') {
		debug && echo.info(`using the wildcard yields all groups`);
		debug && echo.groupEnd();
		return groups;
	}

	const eligible = groups.filter(({ owner }) => eligibility.includes(owner));
	if (eligible.length) {
		debug && echo.info(`found some eligible buyers`);
		debug && echo.groupEnd();
		return eligible;
	}

	debug && echo.log(echo.asWarning(`No groups were eligible!`));
	debug && echo.groupEnd();
	return null;
};

/*
 * @function
 * @name getBids
 * @description given a set of bidders, grab their bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bidders - a list of bidders (also referred to as interest groups)
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} an array of objects containing bids; null if none found
 */
export const getBids = async (bidders, conf, debug) => Promise.all(
	bidders.map(async bidder => {
		debug && echo.groupCollapsed(`auction utils: getBids => ${bidder._key}`);
		const time0 = performance.now();
		const { generateBid, generate_bid } = await import(bidder.bidding_logic_url);
		let callBid = generateBid;

		if (generate_bid && !generateBid) {
			callBid = generate_bid;
		}

		// check if there is even a generateBid function
		// if not, removed bidder from elibility
		if (!callBid && typeof callBid !== 'function') {
			debug && echo.log(echo.asWarning(`No 'generateBid' function found!`));
			debug && echo.groupEnd();
			return null;
		}

		const trustedSignals = await getTrustedSignals(bidder?.trusted_bidding_signals_url, bidder?.trusted_bidding_signals_keys, debug);

		// generate a bid by providing all of the necessary information
		let bid;
		try {
			bid = callBid(bidder, conf?.auction_signals, conf?.per_buyer_signals?.[bidder.owner], trustedSignals, {
				top_window_hostname: window.top.location.hostname,
				seller: conf.seller,
			});
			debug && echo.log(echo.asInfo('bid:'), bid);
		} catch (err) {
			debug && echo.log(echo.asAlert(`There was an error in the 'generateBid' function:`));
			debug && echo.log(err);
			return null;
		}

		// check if generateBid function returned the necessary parts to score
		// if not, removed bidder from elibility
		if (!(
			(bid.ad && typeof bid.ad === 'object') &&
			(bid.bid && typeof bid.bid === 'number') &&
			(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
		)) {
			debug && echo.log(echo.asWarning(`No bid found!`));
			debug && echo.groupEnd();
			return null;
		}

		const time1 = performance.now();
		debug && echo.groupEnd();
		return {
			...bidder,
			...bid,
			duration: time1 - time0,
		};
	}),
);

/*
 * @function
 * @name getScores
 * @description given a set of bids, grab their score
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bids - a list of bids to score
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} a sorted, filtered array of objects containing scores
 */
export const getScores = async (bids, conf, debug) => {
	debug && echo.groupCollapsed(`auction utils: getScores`);
	const { scoreAd, score_ad } = await import(conf.decision_logic_url);
	let callScore = scoreAd;

	if (score_ad && !scoreAd) {
		callScore = score_ad;
	}

	// check if there is even a scoreAd function
	// if not, return null
	if (!callScore && typeof callScore !== 'function') {
		debug && echo.log(echo.asWarning(`No 'scoreAd' function was found!`));
		return null;
	}

	return bids.map(bid => {
		let score;

		try {
			score = callScore(bid?.ad, bid?.bid, conf, conf?.trusted_scoring_signals, {
				top_window_hostname: window.top.location.hostname,
				interest_group_owner: bid.owner,
				interest_group_name: bid.name,
				bidding_duration_msec: bid.duration,
			});
			debug && echo.log(echo.asInfo(`score:`), score);
		} catch (err) {
			debug && echo.log(echo.asAlert(`There was an error in the 'scoreAd' function:`));
			debug && echo.log(err);
			score = -1;
		}

		debug && echo.groupEnd();
		return {
			bid,
			score,
		};
	})
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
};

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
const getTrustedSignals = async (url, keys, debug) => {
	debug && echo.groupCollapsed('auction utils: getTrustedSignals');
	const hostname = `hostname=${window.top.location.hostname}`;

	if (!(url && keys)) {
		debug && echo.log(echo.asWarning(`No 'url' or 'keys' found!`));
		debug && echo.groupEnd();
		return undefined;
	}

	const isJSON = response => /\bapplication\/json\b/.test(response?.headers?.get('content-type'));

	const response = await fetch(`${url}?${hostname}&keys=${keys.join(',')}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Something went wrong! The response returned was not ok.');
			}

			if (!isJSON(response)) {
				throw new Error('Response was not in the format of JSON.');
			}

			return response.json();
		})
		.catch(error => {
			debug && echo.log(echo.asAlert('There was a problem with your fetch operation:'));
			debug && echo.log(error);
			return null;
		});

	const signals = {};
	for (const [ key, value ] of response) {
		if (keys.includes(key)) {
			signals[key] = value;
		}
	}

	if (!(signals && Object.keys(signals).length === 0 && signals.constructor === Object)) {
		debug && echo.log(echo.asWarning(`No signals found!`));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.groupEnd();
	return signals;
};
