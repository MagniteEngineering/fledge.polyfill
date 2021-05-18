export const mockOwner = 'mock-owner.com';
export const mockName = 'mockName';
export const mockBiddingLogicUrl = 'https://mock.dsp.example/bidding-logic-url';
export const mockDailyUpdateUrl = 'https://mock.dsp.example/daily-update-url';
export const mockTrustedBiddingSignalsUrl = 'https://mock.dsp.example/trusted-bidding-signals-url';
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
		renderingUrl: 'https://mock.dsp.example/ad-url',
	},
];
export const mockExpiry = 24 * 60 * 60 * 1000;
export const mockMaxExpiry = 30 * mockExpiry;
export const mockRequiredOptions = {
	owner: mockOwner,
	name: mockName,
	biddingLogicUrl: mockBiddingLogicUrl,
};
export const mockOptionals = {
	dailyUpdateUrl: mockDailyUpdateUrl,
	trustedBiddingSignalsUrl: mockTrustedBiddingSignalsUrl,
	trustedBiddingSignalsKeys: mockTrustedBiddingSignalsKeys,
	userBiddingSignals: mockUserBiddingSignals,
	ads: mockAds,
};
export const mockAllOptions = {
	...mockRequiredOptions,
	...mockOptionals,
};

export const mockIGDb = [
	[
		`${mockOwner}-${mockName}`,
		mockAllOptions,
	],
	[
		`new-mock-owner.com-${mockName}`,
		{
			...mockAllOptions,
			owner: 'new-mock-owner.com',
		},
	],
];
