export const mockSeller = 'mock-seller.com';
export const mockDecisionLogicUrl = 'https://mock.ssp.example/decision_logic_url';
export const mockTrustedScoringSignalsUrl = 'https://mock.ssp.example/trusted_scoring_signals_url';
export const mockInterestGroupBuyers = [
	'mockIG',
	'anotherMockIG',
];
export const mockAdditionalBids = [
	'mockBid',
	'anotherMockBid',
];
export const mockAuctionSignals = {
	mockASKey: 'mockValue',
	anotherMockASKey: 'anotherMockValue',
};
export const mockSellerSignals = {
	mockSSKey: 'mockValue',
	anotherMockSSKey: 'anotherMockValue',
};
export const mockPerBuyerSignals = {
	mockPBSKey: 'mockValue',
	anotherMockPBSKey: 'anotherMockValue',
};
export const mockRequiredOptions = {
	seller: mockSeller,
	decisionLogicUrl: mockDecisionLogicUrl,
	interestGroupBuyers: mockInterestGroupBuyers,
};
export const mockOptionals = {
	trustedScoringSignalsUrl: mockTrustedScoringSignalsUrl,
	additionalBids: mockAdditionalBids,
	auctionSignals: mockAuctionSignals,
	sellerSignals: mockSellerSignals,
	perBuyerSignals: mockPerBuyerSignals,
};
export const mockAllOptions = {
	...mockRequiredOptions,
	...mockOptionals,
};

export const mockBid = {
	_key: 'www.rp.com-womens-running-shoes',
	_expired: 1621792745000,
	...mockRequiredOptions,
	_created: 1619200745000,
	_updated: 1619200745000,
	ad: {
		auction: {},
		browser: {
			topWindowHostname: 'localhost',
			seller: 'www.ssp.com',
		},
		buyer: {},
		interest: {
			_key: 'www.rp.com-womens-running-shoes',
			_expired: 1621792745000,
			owner: 'www.rp.com',
			name: 'womens-running-shoes',
			biddingLogicUrl: 'https://dark-organic-appeal.glitch.me/bid.js',
			_created: 1619200745000,
			_updated: 1619200745000,
		},
	},
	bid: 1,
	render: 'https://example.com',
};

export const mockAuctionResults = {
	origin: 'http://localhost/',
	timestamp: 1619635510421,
	conf: mockRequiredOptions,
	winner: {
		ad: {
			auction: {},
			browser: {
				topWindowHostname: 'localhost',
				seller: 'www.ssp.com',
			},
			buyer: {},
			interest: {
				_key: 'www.rp.com-womens-running-shoes',
				_expired: 1621792745000,
				owner: 'www.rp.com',
				name: 'womens-running-shoes',
				biddingLogicUrl: 'https://dark-organic-appeal.glitch.me/bid.js',
				_created: 1619200745000,
				_updated: 1619200745000,
			},
		},
		bid: 1,
		render: 'https://example.com',
	},
};
