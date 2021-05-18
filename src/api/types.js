export const AuctionConf = {
	seller: 'string',
	decisionLogicUrl: 'url',
	interestGroupBuyers: 'mixed',
	trustedScoringSignalsUrl: 'url',
	additionalBids: 'array',
	auctionSignals: 'object',
	sellerSignals: 'object',
	perBuyerSignals: 'object',
};

export const InterestGroup = {
	owner: 'string',
	name: 'string',
	biddingLogicUrl: 'url',
	dailyUpdateUrl: 'url', // @TODO: support this potentially on the auction, grabbing the latest interest group data, and updating the IDB store with it
	trustedBiddingSignalsUrl: 'url',
	trustedBiddingSignalsKeys: 'array',
	userBiddingSignals: 'object',
	ads: 'array',
};
