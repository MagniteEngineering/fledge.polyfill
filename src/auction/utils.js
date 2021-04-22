/* eslint-disable camelcase, compat/compat */

export const filterBuyers = (buyers, eligible) => {
	const eligibleBuyers = buyers.filter(({ owner }) => eligible.includes(owner));

	if (eligibleBuyers.length) {
		return eligibleBuyers;
	}

	return null;
};

export const getBids = async (bidders, conf) => Promise.all(
	bidders.map(async bidder => {
		const { generate_bid } = await import(bidder.bidding_logic_url);

		// check if there is even a generate_bid function
		// if not, removed bidder from elibility
		if (!generate_bid && typeof generate_bid !== 'function') {
			return null;
		}

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
