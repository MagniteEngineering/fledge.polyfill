/* eslint-disable camelcase */
import { generate_bid } from './dsp.js';
import { score_ad } from './ssp.js';

const interestGroup = {
	owner: 'dsp.com',
	name: 'nike-womens-running-shoes',
	bidding_logic_url: 'dsp.com/nike/bid.js',
	daily_update_url: 'dsp.com/nike/update',
	trusted_bidding_signals_url: 'kv-server.com',
	trusted_bidding_signals_keys: [
		'budget',
		'size',
	],
	user_bidding_signals: {
		timestamp: 123456789,
		hostname: 'nike.com',
		path: '/w/womens-running-shoes',
	},
	ads: [
		'shoes_ad1.bundle',
		'shoes_ad2.bundle',
	],
};

const auctionConfig = {
	seller: 'magnite.com',
	decision_logic_url: 'magnite.com/espn/auction.js',
	interest_group_buyers: [
		'www.tradedesk.com',
		'nike.com',
	],
	additional_bids: [
		'other_source_ad1',
		'other_source_ad2',
	],
	auction_signals: {
		ad_size: '300x250',
		publisher_id: 123456,
	},
	seller_signals: {
		price_floor: 0.50,
	},
	per_buyer_signals: {
		'www.tradedesk.com': {
			base_price: 1.00,
		},
		'nike.com': {
			base_price: 1.25,
		},
	},
};

const bid = generate_bid(
	interestGroup,
	auctionConfig.auction_signals,
	auctionConfig.per_buyer_signals['nike.com'],
	{
		budget: 10,
		size: '300x250',
	},
	{
		top_window_hostname: 'www.example-publisher.com',
		seller: 'www.example-ssp.com',
		join_count: 3,
		bid_count: 17,
		prev_wins: [
			[ 'time1', 'ad1' ],
			[ 'time2', 'ad2' ],
		],
	},
);

const score = score_ad(
	bid.ad,
	bid.bid,
	auctionConfig,
	{
		url: 'https://example.com/creative.html',
	},
	{
		top_window_hostname: 'www.example-publisher.com',
		interest_group_owner: 'www.example-dsp.com',
		interest_group_name: 'womens-running-shoes',
		ad_render_fingerprint: 'M0rNy1D5RVowjnpa',
		bidding_duration_msec: 12,
	},
);

function tag (tag, text) {
	const el = document.createElement(tag);
	el.textContent = text;

	return el;
}

const printScore = tag('h2', `Winning Bid Score: ${score}`);
document.body.appendChild(printScore);

const printBid = tag('pre', JSON.stringify(bid, null, 4));
document.body.appendChild(tag('h2', 'Bid'));
document.body.appendChild(printBid);
