export const mockOwner = 'mock-owner.com';
export const mockName = 'mockName';
export const mockBiddingLogicUrl = 'https://mock.dsp.example/bidding_logic_url';
export const mockDailyUpdateUrl = 'https://mock.dsp.example/daily_update_url';
export const mockTrustedBiddingSignalsUrl = 'https://mock.dsp.example/trusted_bidding_signals_url';
export const mockTrustedBiddingSignalsKeys = [
	'mockTBSK',
	'anotherMockTBSK',
];
export const mockUserBiddingSignals = {
	mockUBSKey: 'mockValue',
	anotherMockUBSKey: 'anotherMockValue',
};
export const mockAds = [
	{
		meta: {
			id: 'adid',
		},
		rendering_url: 'https://mock.dsp.example/ad_url',
	},
];
export const mockExpiry = 24 * 60 * 60 * 1000;
export const mockMaxExpiry = 30 * mockExpiry;
export const mockRequiredOptions = {
	owner: mockOwner,
	name: mockName,
	bidding_logic_url: mockBiddingLogicUrl,
};
export const mockOptionals = {
	daily_update_url: mockDailyUpdateUrl,
	trusted_bidding_signals_url: mockTrustedBiddingSignalsUrl,
	trusted_bidding_signals_keys: mockTrustedBiddingSignalsKeys,
	user_bidding_signals: mockUserBiddingSignals,
	ads: mockAds,
};
export const mockAllOptions = {
	...mockRequiredOptions,
	...mockOptionals,
};

export const mockIGDb = [
	mockAllOptions,
	{
		...mockAllOptions,
		owner: 'new-mock-owner.com',
	},
];
