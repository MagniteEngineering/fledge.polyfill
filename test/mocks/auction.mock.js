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
	decision_logic_url: mockDecisionLogicUrl,
	interest_group_buyers: mockInterestGroupBuyers,
};
export const mockOptionals = {
	trusted_scoring_signals_url: mockTrustedScoringSignalsUrl,
	additional_bids: mockAdditionalBids,
	auction_signals: mockAuctionSignals,
	seller_signals: mockSellerSignals,
	per_buyer_signals: mockPerBuyerSignals,
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
			top_window_hostname: 'localhost',
			seller: 'www.ssp.com',
		},
		buyer: {},
		interest: {
			_key: 'www.rp.com-womens-running-shoes',
			_expired: 1621792745000,
			owner: 'www.rp.com',
			name: 'womens-running-shoes',
			bidding_logic_url: 'https://dark-organic-appeal.glitch.me/bid.js',
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
	bid: mockBid,
};
