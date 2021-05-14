/* eslint-disable camelcase */
import { generateBid } from './dsp.js';
import { scoreAd } from './ssp.js';

const interestGroup = {
	owner: 'dsp.com',
	name: 'nike-womens-running-shoes',
	biddingLogicUrl: 'dsp.com/nike/bid.js',
	dailyUpdateUrl: 'dsp.com/nike/update',
	trustedBiddingSignalsUrl: 'kv-server.com',
	trustedBiddingSignalsKeys: [
		'budget',
		'size',
	],
	userBiddingSignals: {
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
	decisionLogicUrl: 'magnite.com/espn/auction.js',
	interestGroupBuyers: [
		'www.tradedesk.com',
		'nike.com',
	],
	additionalBids: [
		'other_source_ad1',
		'other_source_ad2',
	],
	auctionSignals: {
		ad_size: '300x250',
		publisher_id: 123456,
	},
	seller_Sgnals: {
		price_floor: 0.50,
	},
	perBuyerSignals: {
		'www.tradedesk.com': {
			base_price: 1.00,
		},
		'nike.com': {
			base_price: 1.25,
		},
	},
};

const bid = generateBid(
	interestGroup,
	auctionConfig.auctionSignals,
	auctionConfig.perBuyerSignals['nike.com'],
	{
		budget: 10,
		size: '300x250',
	},
	{
		topWindowHostname: 'www.example-publisher.com',
		seller: 'www.example-ssp.com',
		joinCount: 3,
		bidCount: 17,
		prevWins: [
			[ 'time1', 'ad1' ],
			[ 'time2', 'ad2' ],
		],
	},
);

const score = scoreAd(
	bid.ad,
	bid.bid,
	auctionConfig,
	{
		url: 'https://example.com/creative.html',
	},
	{
		topWindowHostname: 'www.example-publisher.com',
		interestGroupOwner: 'www.example-dsp.com',
		interestGroupName: 'womens-running-shoes',
		adRenderFingerprint: 'M0rNy1D5RVowjnpa',
		biddingDurationMsec: 12,
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
