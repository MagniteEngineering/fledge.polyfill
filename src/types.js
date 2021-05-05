export const NAMESPACE = 'fledge.polyfill';
export const VERSION = 1;

export const AuctionConf = {
	seller: 'string',
	decision_logic_url: 'url',
	interest_group_buyers: 'mixed',
	trusted_scoring_signals_url: 'url',
	additional_bids: 'array',
	auction_signals: 'object',
	seller_signals: 'object',
	per_buyer_signals: 'object',
};

export const InterestGroup = {
	owner: 'string',
	name: 'string',
	bidding_logic_url: 'url',
	daily_update_url: 'url', // @TODO: support this potentially on the auction, grabbing the latest interest group data, and updating the IDB store with it
	trusted_bidding_signals_url: 'url',
	trusted_bidding_signals_keys: 'array',
	user_bidding_signals: 'object',
	ads: 'array',
};
