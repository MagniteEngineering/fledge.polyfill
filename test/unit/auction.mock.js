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
