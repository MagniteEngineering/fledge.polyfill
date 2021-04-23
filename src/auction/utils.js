/* eslint-disable camelcase, compat/compat */

/*
 * @function
 * @name getEligible
 * @description filter all buyers by their owner field to ensure they're eligible to bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} buyers - an array of objects containing interest group buyers
 * @param {array<String>} eligible - a list of eligible owners to check against
 * @return {Array<Object> | null} an array of objects; null if none found;
 */
export const getEligible = (groups, eligibility) => {
	if (eligibility === '*') {
		return groups;
	}

	const eligible = groups.filter(({ owner }) => eligibility.includes(owner));
	if (eligible.length) {
		return eligible;
	}

	return null;
};

/*
 * @function
 * @name getBids
 * @description given a set of bidders, grab their bid
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bidders - a list of eligible owners to bid
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} an array of objects containing bids; null if none found
 */
export const getBids = async (bidders, conf) => Promise.all(
	bidders.map(async bidder => {
		const { generate_bid } = await import(bidder.bidding_logic_url);

		// check if there is even a generate_bid function
		// if not, removed bidder from elibility
		if (!generate_bid && typeof generate_bid !== 'function') {
			return null;
		}

		// @TODO: need to figure out how to pull in trusted bidding signals
		const bid = generate_bid(bidder, conf?.auction_signals, conf?.per_buyer_signals?.[bidder.owner], conf?.trusted_bidding_signals, {
			top_window_hostname: window.top.location.hostname,
			seller: conf.seller,
		});

		// check if generate_bid function returned the necessary parts to score
		// if not, removed bidder from elibility
		if (!(
			(bid.ad && typeof bid.ad === 'object') &&
			(bid.bid && typeof bid.bid === 'number') &&
			(bid.render && (typeof bid.render === 'string' || Array.isArray(bid.render)))
		)) {
			return null;
		}

		return {
			...bidder,
			...bid,
		};
	}),
);

/*
 * @function
 * @name getScores
 * @description given a set of bids, grab their score
 * @author Newton <cnewton@magnite.com>
 * @param {array<Object>} bids - a list of eligible owners to bid
 * @param {array<Object>} conf - an auction configuration object
 * @return {object | null} a sorted, filtered array of objects containing scores
 */
export const getScores = async (bids, conf) => {
	const { score_ad } = await import(conf.decision_logic_url);
	// check if there is even a score_ad function
	// if not, return null
	if (!score_ad && typeof score_ad !== 'function') {
		return null;
	}

	return bids.map(bid => {
		const score = score_ad(bid?.ad, bid?.bid, conf, conf?.trusted_scoring_signals, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: bid.owner,
			interest_group_name: bid.name,
		});

		return {
			...bid,
			score,
		};
	})
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
};

export const uuidv4 = () => ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11)
	.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
